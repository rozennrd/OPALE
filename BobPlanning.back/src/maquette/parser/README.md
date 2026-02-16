# Parser maquette

> Coeur de l'extraction des maquettes Excel vers un modele metier unique.

---

## Sommaire

- [Objectif](#objectif)
- [Fichier et dependances](#fichier-et-dependances)
- [Flux interne global](#flux-interne-global)
- [Detection des lignes](#detection-des-lignes)
- [Structures et constantes](#structures-et-constantes)
- [Fonctions](#fonctions)
- [Decisions de conception](#decisions-de-conception)

---

## Objectif

Ce dossier contient le coeur de l'extraction des maquettes Excel.

Le parser transforme des feuilles heterogenes (`xlsx/xlsm`) en donnees metier normalisees:

- lignes matieres consolidees;
- volumes horaires;
- semestres/periodes;
- evaluations normalisees;
- brouillons d'evenements d'examen.

---

## Fichier et dependances

| Element | Valeur |
|---|---|
| Fichier principal | `maquetteParser.ts` |
| Dependances | `exceljs`, `../config/promotionResolver`, `../types/MaquetteExtracted`, `../utils/cell`, `../utils/semesters`, `../utils/text` |
| Utilise par | `../services/maquetteAnalyzeService.ts`, `../services/maquetteImportService.ts` |

---

## Flux interne global

Flux principal de `parseMaquetteBuffer(...)`:

1. Charger le workbook en memoire.
2. Parcourir chaque feuille.
3. Scanner les lignes:
   - detecter annee scolaire;
   - detecter ligne cycle;
   - detecter blocs semestres;
   - detecter debut bloc entetes UE/Modules.
4. Construire une `HeaderMap` dynamique.
5. Parser chaque ligne matiere via `parseDataRow(...)`.
6. Fusionner les lignes multi-sources via `mergeLines(...)`.
7. Retourner `MaquetteAnalyzeResult` (`matieres`, `warnings`, `metadata`).

---

## Detection des lignes

Le parser identifie aussi les lignes (pas seulement les colonnes):

- ligne "cycle": regex `^Cycle: ...`;
- ligne de section semestre: texte contenant `Semestre` + extraction `Sx`;
- ligne entete bloc metier: contient `Unite d enseignements`;
- ligne de fin bloc: `Total ...`, `ECTS entreprise`, etc.

Les lignes matieres sont parsees uniquement quand un `headerMap` actif existe.

---

## Structures et constantes

### Structures internes

| Structure | Role |
|---|---|
| `HeaderMap` | Memoriser les index de colonnes detectees dynamiquement (UE/module/semestre, heures, evaluations). |
| `ParseRowContext` | Garder le contexte evolutif du scan (`currentUE`, `cycleRaw`, `sectionSemesters`). |

### Constantes

| Constante | Role |
|---|---|
| `HEADER_ALIAS` | Dictionnaire d'alias d'entetes connus, utilise par `findColumnByAliases(...)`. |
| `MAX_HEADER_SCAN_ROWS` | Nombre de lignes concatenees pour reconstruire une entete fusionnee. |
| `DEFAULT_MAX_SCAN_COLUMNS` | Borne minimum de scan colonnes si `worksheet.columnCount` est incomplet. |

---

## Fonctions

| Fonction | Role principal |
|---|---|
| `isCycleDescriptorRow(...)` | Detecter une ligne `Cycle: ...`. |
| `getMaxColumnCount(...)` | Definir la largeur de scan a utiliser. |
| `getCombinedRowText(...)` | Concatener les cellules non vides d'une ligne. |
| `buildHeaderByColumn(...)` | Reconstruire les entetes multi-lignes (raw + normalisees). |
| `findColumnByAliases(...)` | Trouver une colonne via alias. |
| `detectEvaluationLabel(...)` | Mapper une entete vers un label d'evaluation stable. |
| `buildHeaderMap(...)` | Construire la map de colonnes metier. |
| `classifyEvaluationType(...)` | Convertir un label vers un type metier. |
| `buildExamEventDrafts(...)` | Transformer les evaluations en brouillons d'evenements. |
| `mergeEvaluations(...)` | Fusionner des evaluations homonymes. |
| `parseDataRow(...)` | Parser une ligne matiere complete. |
| `mergeLines(...)` | Fusionner les lignes matieres parsees. |
| `parseMaquetteBuffer(...)` | Point d'entree public du parser. |

<details>
<summary><strong>Voir le detail fonction par fonction</strong></summary>

### `isCycleDescriptorRow(rawCombinedText): boolean`

Detecte une ligne `Cycle: ...`.

### `getMaxColumnCount(worksheet): number`

Retourne la largeur de scan a utiliser.

### `getCombinedRowText(worksheet, rowNumber, maxCol): string`

Concatene les cellules non vides d'une ligne en texte brut.

### `buildHeaderByColumn(worksheet, startRowNumber, maxCol): { normalized; raw }`

Reconstruit les entetes (raw + normalisees) colonne par colonne, sur plusieurs lignes.

### `findColumnByAliases(headers, aliases): number | null`

Trouve la premiere colonne dont l'entete contient un alias donne.

### `detectEvaluationLabel(headerNormalized): string | null`

Mappe une entete vers un libelle d'evaluation stable:

- `Epreuve Interm.`, `Epreuve Finale`, `Exam 1`, `Exam 2`, `CCx`, `TPx`, `Rap.`, `Sout.`, `Proj.`

### `buildHeaderMap(worksheet, headerRowNumber): HeaderMap`

Cree la map complete des colonnes metier a partir de la ligne d'entete detectee.

### `classifyEvaluationType(label): MaquetteEvaluationType`

Convertit un libelle d'evaluation en type metier:

- `INTERMEDIAIRE`, `FINALE`, `CONTROLE_CONTINU`, `TRAVAUX_PRATIQUES`, `PROJET`, `AUTRE`.

### `buildExamEventDrafts(line): MaquetteExamEventDraft[]`

Transforme les evaluations d'une matiere en brouillons d'evenements a importer.

### `mergeEvaluations(left, right): MaquetteEvaluation[]`

Fusionne deux listes d'evaluations sur cle metier:

- `nom + type + semestres`

Comportement:

- additionne `poids`;
- garde l'ordre minimum connu.

### `parseDataRow(worksheet, rowNumber, headerMap, rowContext, options, anneeScolaire): MaquetteMatiereLine | null`

Fonction centrale de parsing ligne:

1. Lit `UE`, `module`, `semestre/periode`, heures, evaluations.
2. Ignore les lignes non matiere (`module vide`, `total`, etc.).
3. Determine semestres/periodes (cellule + fallback section).
4. Resout `cycleCode/promotionCode` via `resolvePromotionCode`.
5. Calcule les heures (`total`, `totalAvecProf`, details).
6. Construit la `MaquetteMatiereLine` + `examEventDrafts`.

### `mergeLines(lines): MaquetteMatiereLine[]`

Fusion finale des lignes parsees:

- cle metier principale: `cycle|promotion|UE|matiere`;
- exception: si le nom matiere contient un chiffre (`Math1`, `Math2`), pas de fusion automatique;
- fusionne semestres/periodes/sources/evaluations/heures;
- regenere `examEventDrafts` apres fusion.

### `parseMaquetteBuffer(buffer, options): Promise<MaquetteAnalyzeResult>`

Point d'entree public du parser.

Responsabilites:

- orchestration du scan multi-feuilles;
- collecte warnings/metadata;
- fusion globale;
- retour du resultat normalise.

</details>

---

## Decisions de conception

- parser tolerant aux variantes de maquette (alias + normalisation texte);
- separation detection colonne / detection ligne / parsing ligne / fusion;
- sortie unique et stable pour reutilisation par `analyze` et `import`;
- aucune ecriture DB dans cette couche.
