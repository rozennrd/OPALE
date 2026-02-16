# Config maquette

> Resolution cycle/promotion pour des maquettes heterogenes.

---

## Sommaire

- [Objectif](#objectif)
- [Fichier et dependances](#fichier-et-dependances)
- [Flux de traitement](#flux-de-traitement)
- [Interfaces et fonctions](#interfaces-et-fonctions)

---

## Objectif

Ce dossier contient la logique de resolution cycle/promotion, independante du parsing Excel brut.

Le fichier `promotionResolver.ts` transforme un contexte de ligne (cycle, feuille, semestres, hints API) en deux codes metier stables:

- `cycleCode` (ex: `ADI`, `CIR`, `AP`, `ISEN`, fallback `CYCLE`);
- `promotionCode` (ex: `ADI1`, `CIR2`, `AP5`, `APS5`).

Cette separation permet:

- d'ajuster les regles metier sans toucher au parser principal;
- de centraliser les heuristiques et priorites;
- de rendre les regles testables de facon isolee.

---

## Fichier et dependances

| Element | Valeur |
|---|---|
| Fichier principal | `promotionResolver.ts` |
| Dependance interne | `../utils/text` (`normalizeText`, `toUpperNoSpace`) |
| Utilise par | `../parser/maquetteParser.ts` dans `parseDataRow(...)` |

---

## Flux de traitement

`resolvePromotionCode(...)` applique les etapes suivantes dans cet ordre:

1. Determiner le `cycleCode`:
   - hint API prioritaire;
   - sinon heuristique sur `cycleRaw`.
2. Si `promotionHint` est fourni, retour immediat.
3. Chercher une promotion explicite dans le nom de feuille (`sheetName`).
4. Chercher une promotion explicite dans `cycleRaw`.
5. Si cycle AP: appliquer la regle legacy `S5/S6 -> AP3`, `S7/S8 -> AP4`, `S9/S10 -> AP5`.
6. Si cycle ADI/CIR: appliquer la regle par paire de semestres.
7. Fallback generique par semestre minimal.

---

## Interfaces et fonctions

### Interface

| Nom | Role |
|---|---|
| `PromotionResolverInput` | Decrire toutes les entrees necessaires a la decision. |

Champs de `PromotionResolverInput`:

- `cycleHint`: hint cycle fourni par API.
- `promotionHint`: hint promotion fourni par API.
- `cycleRaw`: texte brut detecte dans la maquette.
- `sheetName`: nom de feuille Excel.
- `semestres`: semestres detectes pour la ligne courante.

### Fonctions

| Fonction | Role principal |
|---|---|
| `extractExplicitPromotion(text)` | Detecter un token de type `AP4`, `CIR2`, `APS5` dans un texte libre. |
| `inferCycleCode(cycleHint, cycleRaw)` | Choisir le code cycle de reference. |
| `resolveLegacyApPromotion(semestres)` | Appliquer la logique AP historique basee sur le semestre max. |
| `resolveSemesterPairPromotion(cycleCode, semestres)` | Convertir un semestre max en index annuel (`ceil(maxSem/2)`). |
| `resolveSemesterExactPromotion(cycleCode, semestres)` | Fallback strict au semestre minimal. |
| `resolvePromotionCode(input)` | Fonction publique principale appelee par le parser. |

<details>
<summary><strong>Voir le detail fonction par fonction</strong></summary>

#### `extractExplicitPromotion(text: string): string | null`

- detecte un token du type `AP4`, `CIR2`, `APS5` dans un texte libre;
- ignore volontairement `S1`, `P2` qui ne sont pas des promotions.

#### `inferCycleCode(cycleHint, cycleRaw): string`

- `cycleHint` gagne si present;
- sinon detection tolerante sur `cycleRaw` (`adi`, `cir`, `fisa`, `apprentissage`, `isen`);
- fallback `CYCLE`.

#### `resolveLegacyApPromotion(semestres): string | null`

Mapping:

- `<= 6` -> `AP3`
- `<= 8` -> `AP4`
- sinon -> `AP5`

#### `resolveSemesterPairPromotion(cycleCode, semestres): string | null`

- convertit un semestre max en index annuel (`ceil(maxSem/2)`);
- exemple: `CIR` + `S3/S4` -> `CIR2`.

#### `resolveSemesterExactPromotion(cycleCode, semestres): string | null`

- fallback strict au semestre minimal;
- exemple: `ADI` + `S1` -> `ADI1`.

#### `resolvePromotionCode(input): { cycleCode, promotionCode }`

- fonction publique principale appelee par le parser;
- garantie: retourne toujours un couple `cycleCode/promotionCode` meme en cas de contexte incomplet (fallback final).

</details>
