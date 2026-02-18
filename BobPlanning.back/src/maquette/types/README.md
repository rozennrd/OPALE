# Types maquette

> Contrats TypeScript partages entre parser, services et API.

---

## Sommaire

- [Objectif](#objectif)
- [Fichier](#fichier)
- [Dependances et usage](#dependances-et-usage)
- [Detail type par type](#detail-type-par-type)
- [Pourquoi un fichier types dedie](#pourquoi-un-fichier-types-dedie)

---

## Objectif

Ce dossier centralise les contrats TypeScript de la feature maquette.

Le but est de:

- stabiliser le format de donnees entre parser, services et API;
- rendre explicites les champs metier importes;
- limiter les regressions lors des evolutions.

---

## Fichier

| Fichier | Role |
|---|---|
| `MaquetteExtracted.ts` | Definitions de types de reference de toute la feature maquette. |

---

## Dependances et usage

| Type | Elements |
|---|---|
| Importe par | `parser/maquetteParser.ts`, `services/maquetteAnalyzeService.ts`, `services/maquetteImportService.ts`, `api/controllers/maquetteController.ts` (indirectement via services) |
| Dependances propres | Aucune dependance metier |

---

## Detail type par type

### Vue rapide

| Type | Role |
|---|---|
| `MaquetteEvaluationType` | Enumeration des categories d'evaluation normalisees. |
| `MaquetteEvaluation` | Evaluation extraite d'une ligne matiere. |
| `MaquetteExamEventDraft` | Brouillon minimal pour creation d'event examen. |
| `MaquetteHeures` | Volumes horaires consolides d'une matiere. |
| `MaquetteSourcePosition` | Tracabilite feuille + ligne source. |
| `MaquetteMatiereLine` | Ligne matiere normalisee principale. |
| `MaquetteAnalyzeResult` | Contrat de sortie du parser/analyze. |
| `AnalyzeMaquetteOptions` | Hints de parsing (cycle/promotion). |
| `ImportMaquetteResult` | Contrat de sortie du service d'import. |

<details>
<summary><strong>Voir le detail complet de chaque type</strong></summary>

### `MaquetteEvaluationType`

Union litterale des types d'evaluation normalises:

- `INTERMEDIAIRE`
- `FINALE`
- `CONTROLE_CONTINU`
- `TRAVAUX_PRATIQUES`
- `PROJET`
- `AUTRE`

Utilite:

- simplifier le mapping metier et l'import event.

### `MaquetteEvaluation`

Represente une evaluation extraite d'une ligne matiere.

Champs:

- `nom`: label stable (`Epreuve Finale`, `CC1`, etc.).
- `type`: type normalise (`MaquetteEvaluationType`).
- `poids`: valeur numerique extraite.
- `semestres`: semestres lies a cette evaluation.
- `ordre`: position de colonne quand disponible.
- `rawLabel`: label brut pour diagnostic.

### `MaquetteExamEventDraft`

Represente un brouillon minimal de futur event d'examen.

Champs:

- `promotionCode`
- `cycleCode`
- `matiereNom`
- `evaluationNom`
- `evaluationType`
- `poids`
- `semestres`

Usage:

- produit par le parser;
- consomme par le service d'import.

### `MaquetteHeures`

Represente la vue consolidee des volumes horaires d'une matiere.

Champs:

- `total`, `totalAvecProf`
- `coursMagistral`, `coursInteractif`
- `td`, `tp`, `projet`, `elearning`
- `visitesConferences`, `autoGere`

### `MaquetteSourcePosition`

Trace la provenance dans le fichier source.

Champs:

- `sheetName`
- `rowNumber`

Utilite:

- audit/debug;
- comprehension des fusions de lignes.

### `MaquetteMatiereLine`

Type principal de sortie parser au niveau matiere.

Champs principaux:

- contexte: `anneeScolaire`, `cycleCode`, `cycleRaw`, `promotionCode`, `ueNom`;
- identification: `matiereNom`;
- temporalite: `semestres`, `periodes`, `nbSemestres`;
- contenu: `heures`, `evaluations`, `examEventDrafts`;
- tracabilite: `sources`.

### `MaquetteAnalyzeResult`

Contrat de sortie de l'analyse.

Champs:

- `matieres`: lignes matieres normalisees;
- `warnings`: alertes fonctionnelles;
- `metadata`: `anneeScolaire`, `cycleRaw`, `cycleCode`, `promotions`, `feuilles`.

### `AnalyzeMaquetteOptions`

Options de parsing venant de l'API:

- `cycleHint`
- `promotionHint`

### `ImportMaquetteResult`

Contrat de sortie du service d'import.

Champs:

- compteurs matieres: `insertedMatieres`, `updatedMatieres`, `skippedMatieres`;
- compteurs examens: `insertedExamEvents`, `skippedExamEvents`;
- `warnings`;
- `examEventsToCreate` (projection des brouillons).

</details>

---

## Pourquoi un fichier types dedie

- versionner facilement le contrat de donnees;
- rendre les changements de schema visibles en review;
- eviter la duplication de types dans parser/services/controller.
