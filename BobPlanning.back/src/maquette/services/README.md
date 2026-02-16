# Services maquette

> Couche d'orchestration entre API, parser et base de donnees.

---

## Sommaire

- [Objectif](#objectif)
- [Fichiers](#fichiers)
- [Dependances et appels](#dependances-et-appels)
- [Flux analyze](#flux-analyze)
- [Flux import](#flux-import)
- [Fonctions de maquetteImportService.ts](#fonctions-de-maquetteimportservicets)
- [Contrat dryRun](#contrat-dryrun)
- [Pourquoi separer parser et services](#pourquoi-separer-parser-et-services)

---

## Objectif

Ce dossier contient la couche service de la feature maquette:

- service `analyze` (lecture seule);
- service `import` (ecritures DB transactionnelles).

Ces services servent de pont entre:

- couche API (controller/routes);
- couche parsing (`parser/`);
- couche base de donnees (`pool`, SQL).

---

## Fichiers

| Fichier | Role |
|---|---|
| `maquetteAnalyzeService.ts` | Service read-only de projection normalisee. |
| `maquetteImportService.ts` | Service transactionnel d'upsert matieres + creation events examens. |

---

## Dependances et appels

| Type | Elements |
|---|---|
| Dependances principales | `../parser/maquetteParser`, `../types/MaquetteExtracted`, `../../database/pool`, `pg`, `../utils/text` |
| Appelant principal | `src/api/controllers/maquetteController.ts` |

---

## Flux analyze

### `maquetteAnalyzeService.analyze(buffer, options)`

- delegue au parser;
- retourne la projection normalisee;
- n'effectue aucune ecriture DB.

Usages:

- previsualisation;
- audit;
- debug parsing;
- validation avant import.

---

## Flux import

`maquetteImportService.import(buffer, options)` suit les etapes:

1. Parser le fichier (meme pipeline que `analyze`).
2. Si `dryRun=true`: retour immediat sans ecriture.
3. Ouvrir transaction SQL.
4. Upsert des matieres par promotion.
5. Construire/inserer les evenements d'examen (`event`) + liaison (`concerner`).
6. Commit.
7. En cas d'erreur: rollback.

---

## Fonctions de `maquetteImportService.ts`

### Vue rapide

| Groupe | Fonctions |
|---|---|
| Conversion | `toNullableInt`, `truncate` |
| Annee / date | `parseSchoolYearStartYear`, `getSemesterAnchor`, `buildExamEventDateRange` |
| Nommage / dedup | `buildExamEventName`, `buildExamEventDescription`, `buildExamDraftKey`, `sortExamDrafts` |
| Compatibilite schema | `resolveExamEventTypeValue`, `resolveEventTableCapabilities` |
| Metier matiere | `getNbPartiels`, `getNbEvalIntermediaire`, `findExistingMatiere`, `insertMatiere`, `updateMatiere` |
| Metier event | `findExistingExamEvent`, `insertExamEvent`, `attachEventToPromotion` |
| API publique | `maquetteImportService.import` |

<details>
<summary><strong>Voir le detail fonction par fonction</strong></summary>

### Helpers de conversion

#### `toNullableInt(value): number | null`

Convertit un nombre vers int nullable pour les colonnes DB.

#### `truncate(value, maxLength): string`

Garantit le respect des limites VARCHAR.

### Helpers annee/date

#### `parseSchoolYearStartYear(schoolYear): SchoolYearInfo`

Extrait l'annee de depart de `metadata.anneeScolaire` (formats `2024-2025`, `24/25`, `2024`).
Fallback: annee courante + flag `inferred=true`.

#### `getSemesterAnchor(semestres): number`

Retourne un semestre d'ancrage stable (minimum >= 1).

#### `buildExamEventDateRange(schoolYearStart, semestres, slotIndex): { datetimeStart; datetimeEnd }`

Genere une plage datetime placeholder deterministe pour un exam event.

Principes:

- semestre impair -> septembre;
- semestre pair -> fevrier;
- slots de 2h pour repartir les events.

### Helpers noms/description/cle de dedup

#### `buildExamEventName(draft): string`

Construit le nom event affichable: `"[PROMO] Matiere - Evaluation"`.

#### `buildExamEventDescription(draft): string`

Construit une description technique compacte (trace du draft).

#### `buildExamDraftKey(draft): string`

Construit une cle logique de dedup (`promo|matiere|eval|type|poids|semestres`).

#### `sortExamDrafts(drafts): MaquetteExamEventDraft[]`

Trie les drafts pour rendre le placement datetime deterministe.

### Helpers compatibilite schema

#### `resolveExamEventTypeValue(client): Promise<string>`

Lit l'enum `type_event` pour trouver la valeur "examen" compatible (`examen` ou `Examen`).

#### `resolveEventTableCapabilities(client): Promise<EventTableCapabilities>`

Inspecte `information_schema.columns` pour savoir quelles colonnes existent dans `event`.

But:

- inserer proprement meme si le schema varie entre environnements.

### Helpers metier matiere

#### `getNbPartiels(line): number`

Compte les evaluations de type `INTERMEDIAIRE` ou `FINALE`.

#### `getNbEvalIntermediaire(line): number`

Compte `INTERMEDIAIRE` + `CONTROLE_CONTINU`.

#### `findExistingMatiere(client, line, promotionId): Promise<string | null>`

Recherche une matiere existante (nom + promo + semestre + specialite null).

#### `insertMatiere(client, line, promotionId): Promise<void>`

Insert une nouvelle matiere.

#### `updateMatiere(client, matiereId, line, promotionId): Promise<void>`

Met a jour une matiere existante.

### Helpers metier events

#### `findExistingExamEvent(client, examEventTypeValue, nom, promotionId, datetimeStart, datetimeEnd): Promise<string | null>`

Recherche un event d'examen existant deja relie a la promotion.

#### `insertExamEvent(client, examEventTypeValue, eventTableCapabilities, nom, description, datetimeStart, datetimeEnd): Promise<string>`

Insert un event avec SQL dynamique selon les colonnes disponibles.

#### `attachEventToPromotion(client, eventId, promotionId): Promise<void>`

Cree la liaison dans `concerner` avec garde anti-doublon.

### Fonction publique

#### `maquetteImportService.import(buffer, options): Promise<ImportMaquetteResult>`

Responsabilites detaillees:

- parser le buffer;
- calculer `examEventsToCreate`;
- executer mode `dryRun` ou mode transactionnel;
- charger la table promotion en memoire (`promotionMap`);
- upsert matieres (insert/update/skip + warnings);
- deduplicer les drafts examens;
- inserer/skip events idempotemment;
- retourner compteurs + warnings + drafts.

</details>

---

## Contrat `dryRun`

En `dryRun=true`:

- pas de transaction DB;
- pas d'insert/update;
- compteurs d'ecriture a `0`;
- `examEventsToCreate` retourne la projection de ce qui serait traite.

---

## Pourquoi separer parser et services

- le parser ne connait pas la DB;
- les services gerent les contraintes transactionnelles et idempotence;
- la meme extraction peut servir a des usages differents (`preview`, `import`, futur front de validation).
