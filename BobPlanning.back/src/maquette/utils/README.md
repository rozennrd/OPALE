# Utils maquette

> Briques utilitaires transverses pour un parsing robuste et homogene.

---

## Sommaire

- [Objectif](#objectif)
- [Fichiers](#fichiers)
- [Dependances et usage](#dependances-et-usage)
- [Detail par fichier](#detail-par-fichier)
- [Pourquoi garder ces utils separes](#pourquoi-garder-ces-utils-separes)

---

## Objectif

Ce dossier regroupe les utilitaires transverses de parsing:

- lecture robuste de cellules Excel;
- extraction semestre/periode/annee scolaire;
- normalisation de texte et de codes.

Ces helpers evitent de dupliquer des conversions fragiles dans le parser et les services.

---

## Fichiers

| Fichier | Role |
|---|---|
| `cell.ts` | Conversion robuste des cellules Excel vers texte/nombre. |
| `semesters.ts` | Extraction des semestres, periodes et annee scolaire. |
| `text.ts` | Normalisation de texte et de codes techniques. |

---

## Dependances et usage

| Type | Elements |
|---|---|
| Dependances externes | `cell.ts` depend de `exceljs` pour typer `CellValue`. |
| Dependances internes | `semesters.ts` depend de `text.ts` (`normalizeText`). |
| Utilises par | `parser/maquetteParser.ts`, `config/promotionResolver.ts`, `services/maquetteImportService.ts` |

---

## Detail par fichier

### `cell.ts`

#### Objectif

Uniformiser la lecture des valeurs cellule ExcelJS vers:

- texte (`string`);
- nombre (`number`).

#### Fonctions

| Fonction | Role |
|---|---|
| `extractCellText(value)` | Gere string/number/boolean/Date/richText/formule/hyperlink et renvoie un texte nettoye. |
| `extractCellNumber(value)` | Convertit une cellule en nombre de facon tolerante. |

`extractCellText(value): string`:

- gere plusieurs formes de valeur Excel: string, number, boolean, Date, rich text, formule (`result`), hyperlink;
- retourne une string nettoyee (`trim`, remplacement espace inseparable).

`extractCellNumber(value): number`:

- supprime espaces/`%`/caracteres parasites;
- convertit virgule en point decimal;
- parse float;
- fallback `0` si invalide.

### `semesters.ts`

#### Objectif

Extraire la temporalite pedagogique depuis du texte libre.

#### Fonctions

| Fonction | Role |
|---|---|
| `extractSemestersAndPeriods(input)` | Detecte semestres (`Sx`) et periodes (`Px`) dans une cellule. |
| `extractSchoolYear(input)` | Detecte une annee scolaire (`2024-2025`, `2024/2025`). |
| `mergeUniqueNumbers(left, right)` | Fusionne deux listes numeriques en unique + tri. |

`extractSemestersAndPeriods(input): { semesters; periods }`:

- detecte `S1`, `S 2`, etc.;
- detecte `P1`, `P 2`, etc.;
- dedup + tri croissant;
- fallback si cellule = nombre seul (`"1"` -> `S1`).

`extractSchoolYear(input): string | null`:

- detecte les formats `2024-2025` et `2024/2025`.

`mergeUniqueNumbers(left, right): number[]`:

- fusionne deux listes numeriques en unique + tri.

### `text.ts`

#### Objectif

Rendre les comparaisons de texte robustes face aux variations de saisie.

#### Fonctions

| Fonction | Role |
|---|---|
| `normalizeText(value)` | Normaliser le texte (accents, ponctuation, espaces, casse). |
| `toUpperNoSpace(value)` | Compactage d'un code (`AP 4` -> `AP4`). |
| `hasDigit(value)` | Detecter la presence d'au moins un chiffre. |

`normalizeText(value): string`:

- retire accents;
- remplace ponctuation;
- reduit espaces;
- passe en lowercase;
- utilise pour la detection des alias et les heuristiques de mapping.

`toUpperNoSpace(value): string`:

- supprime espaces;
- uppercase;
- exemple: `"AP 4"` -> `"AP4"`.

`hasDigit(value): boolean`:

- retourne `true` si le texte contient au moins un chiffre;
- utilise pour la regle de fusion matiere (nom avec chiffre => ligne distincte).

---

## Pourquoi garder ces utils separes

- code parser plus lisible;
- comportement de conversion centralise;
- tests unitaires possibles par brique;
- simplifie l'ajout de nouveaux formats de maquettes.
