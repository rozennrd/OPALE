# Maquette Module README

## 1) Objectif

Ce module sert a importer des maquettes pedagogiques Excel (`.xlsx` / `.xlsm`) dans OPALE.

Le but est de:

- normaliser des formats de maquettes heterogenes;
- extraire les informations pedagogiques utiles (matieres, semestres, volumes horaires, evaluations);
- inserer / mettre a jour les matieres en base (`matiere`);
- preparer et creer les examens en tant qu'evenements (`event` + `concerner`);
- rester idempotent (pas de doublons au second import).

## 2) Perimetre fonctionnel

Le module couvre:

- endpoint d'analyse: `/maquette/analyze` (lecture seule, pas d'ecriture DB);
- endpoint d'import: `/maquette/import` (`dryRun=true` ou `dryRun=false`);
- resolution cycle/promotion a partir de hints + contenu maquette;
- fusion metier des lignes matieres;
- insertion idempotente des examens dans la table `event`.

Le module ne couvre pas:

- la creation automatique de promotions manquantes (ex: `AP3` absente en DB => lignes ignorees avec warning);
- l'assignation de vraies dates de partiels (des dates placeholders deterministes sont generees);
- la creation de cours (`cours`) a partir des examens.

## 3) Pourquoi cette architecture

Architecture choisie: separation par responsabilite.

| Couche | Fichiers | Role | Pourquoi |
|---|---|---|---|
| API routes | `src/api/routes/maquetteRoutes.ts` | Expose les endpoints HTTP | Isoler le transport HTTP |
| API controller | `src/api/controllers/maquetteController.ts` | Validation entree/sortie + delegation service | Garder les controllers minces |
| Service analyse | `src/maquette/services/maquetteAnalyzeService.ts` | Facade read-only vers le parser | Reutilisation simple pour endpoint analyze |
| Service import | `src/maquette/services/maquetteImportService.ts` | Orchestration transaction DB matieres + events | Centraliser la logique d'ecriture |
| Parser | `src/maquette/parser/maquetteParser.ts` | Transformation Excel -> modele metier normalise | Isoler la complexite de parsing |
| Config resolution | `src/maquette/config/promotionResolver.ts` | Heuristiques cycle/promotion | Regles metier explicites et testables |
| Types | `src/maquette/types/MaquetteExtracted.ts` | Contrats de donnees | Typage clair et stable |
| Utils | `src/maquette/utils/*.ts` | Helpers texte/cellules/semestres | Eviter de dupliquer les conversions |
| Tests | `test/maquetteParser.test.ts` | Validation des regles critiques | Eviter regressions sur parsing/resolution |

Cette architecture facilite:

- l'evolution des regles de maquette sans casser l'API;
- le test unitaire de la logique metier;
- la maintenance quand de nouveaux formats de maquettes apparaissent.

## 4) Arborescence des nouveaux fichiers

```text
BobPlanning.back/
  src/
    api/
      controllers/
        maquetteController.ts
      routes/
        maquetteRoutes.ts
    maquette/
      README.md
      config/
        README.md
        promotionResolver.ts
      parser/
        README.md
        maquetteParser.ts
      services/
        README.md
        maquetteAnalyzeService.ts
        maquetteImportService.ts
      types/
        README.md
        MaquetteExtracted.ts
      utils/
        README.md
        cell.ts
        semesters.ts
        text.ts
  test/
    maquetteParser.test.ts
```

Fichier existant modifie pour brancher la feature:

- `src/index.ts` (montage des routes maquette).

## 5) Flux de traitement

### 5.1 `/maquette/analyze`

1. Upload du fichier Excel en memoire (`multer.memoryStorage()`).
2. Parsing du classeur feuille par feuille.
3. Detection des entetes, semestres, lignes matieres, evaluations.
4. Resolution cycle/promotion.
5. Fusion des lignes selon regles metier.
6. Retour JSON avec:
   - `matieres`
   - `warnings`
   - `metadata`

### 5.2 `/maquette/import`

1. Reutilise le meme parser.
2. Si `dryRun=true`: retour projection sans ecriture DB.
3. Si `dryRun=false`:
   - upsert `matiere` (insert/update);
   - creation des events d'examen (`event`);
   - liaison event -> promotion (`concerner`);
   - deduplication pour eviter les doublons;
   - retour des compteurs.

## 6) Regles metier principales

### 6.1 Fusion des matieres

- Si le nom contient un chiffre (`Math1`, `Math2`): une ligne par matiere.
- Si le nom est strictement identique sans chiffre: fusion par nb de semestres.

### 6.2 Resolution cycle/promotion

Priorites:

1. `promotionHint` explicite.
2. Code explicite detecte dans la feuille (`CIR1`, `APS5`, etc.).
3. Code explicite detecte dans `cycleRaw`.
4. Heuristiques:
   - AP legacy: `S5/S6 -> AP3`, `S7/S8 -> AP4`, `S9/S10 -> AP5`;
   - ADI/CIR: mapping par paire de semestres (`ADI1`, `ADI2`, etc.).
5. Fallback generique par semestre minimum.

### 6.3 Examens dans `event`

- Tous les partiels/evaluations sont modeles en `event` de type examen.
- Insertion idempotente:
  - si deja present (meme promo, nom, datetime_start/end), pas de reinsertion;
  - compteur `skippedExamEvents` incremente.
- Liaison a la promotion dans `concerner`.

### 6.4 Compatibilite schema DB

Le service detecte dynamiquement:

- la valeur enum de type examen (`examen` ou `Examen`);
- les colonnes disponibles de `event` (`description`, `is_external`, etc.).

Cela permet de fonctionner sur plusieurs variantes de schema sans migration immediate.

## 7) Commandes de test

Toutes les commandes ci-dessous sont faites en PowerShell depuis:

```powershell
PS C:\Users\...\OPALE>
```

### 7.1 Demarrage stack

```powershell
docker compose up -d
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Services attendus:

- `opale-backend` sur `localhost:3000`
- `postgres-database` sur `localhost:5433`

### 7.2 Tests unitaires backend

```powershell
cd .\BobPlanning.back\
npm run build
npm test -- --runInBand
cd ..
```

### 7.3 Variables de test API

```powershell
chcp 65001 > $null
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$BASE = "http://localhost:3000"

$ADI = "$env:USERPROFILE\Downloads\Maquette ADI 2425 avec noms.xlsx"
$AP  = "$env:USERPROFILE\Downloads\Maquette apprentissage JUNIA BDX 2024-2025.xlsx"
$CIR = "$env:USERPROFILE\Downloads\Maquette CIR Bordeaux 2425 avec noms.xlsx"

Test-Path $ADI
Test-Path $AP
Test-Path $CIR
```

### 7.4 Recuperation token

Compte seed par defaut (environnement de dev actuel):

- `email = Daminou`
- `password = 43c1f76adf6d51952d6a20bbf8ddc93478d11aae84dbc37caa5e5c18b3c7f533`

```powershell
$body = @{
  email    = "Daminou"
  password = "43c1f76adf6d51952d6a20bbf8ddc93478d11aae84dbc37caa5e5c18b3c7f533"
} | ConvertTo-Json

$TOKEN = (Invoke-RestMethod -Method Post -Uri "$BASE/login" -ContentType "application/json; charset=utf-8" -Body $body).token
```

### 7.5 Analyze (lecture seule)

```powershell
curl.exe -sS -X POST "$BASE/maquette/analyze" -H "x-access-token: $TOKEN" -F "file=@$ADI" -F "cycleHint=ADI" -o ".\analyze-adi.json"
curl.exe -sS -X POST "$BASE/maquette/analyze" -H "x-access-token: $TOKEN" -F "file=@$AP"  -F "cycleHint=AP"  -o ".\analyze-ap.json"
curl.exe -sS -X POST "$BASE/maquette/analyze" -H "x-access-token: $TOKEN" -F "file=@$CIR" -F "cycleHint=CIR" -o ".\analyze-cir.json"
```

Verification rapide:

```powershell
(Get-Content .\analyze-ap.json -Raw | ConvertFrom-Json).metadata
```

### 7.6 Dry-run import

```powershell
curl.exe -sS -X POST "$BASE/maquette/import" -H "x-access-token: $TOKEN" -F "file=@$ADI" -F "cycleHint=ADI" -F "dryRun=true" -o ".\dryrun-adi.json"
curl.exe -sS -X POST "$BASE/maquette/import" -H "x-access-token: $TOKEN" -F "file=@$AP"  -F "cycleHint=AP"  -F "dryRun=true" -o ".\dryrun-ap.json"
curl.exe -sS -X POST "$BASE/maquette/import" -H "x-access-token: $TOKEN" -F "file=@$CIR" -F "cycleHint=CIR" -F "dryRun=true" -o ".\dryrun-cir.json"
```

### 7.7 Import reel

```powershell
curl.exe -sS -X POST "$BASE/maquette/import" -H "x-access-token: $TOKEN" -F "file=@$ADI" -F "cycleHint=ADI" -F "dryRun=false" -o ".\import-adi.json"
curl.exe -sS -X POST "$BASE/maquette/import" -H "x-access-token: $TOKEN" -F "file=@$AP"  -F "cycleHint=AP"  -F "dryRun=false" -o ".\import-ap.json"
curl.exe -sS -X POST "$BASE/maquette/import" -H "x-access-token: $TOKEN" -F "file=@$CIR" -F "cycleHint=CIR" -F "dryRun=false" -o ".\import-cir.json"
```

Resume compteurs:

```powershell
(Get-Content .\import-adi.json -Raw | ConvertFrom-Json) | Select-Object insertedMatieres,updatedMatieres,skippedMatieres,insertedExamEvents,skippedExamEvents
(Get-Content .\import-ap.json  -Raw | ConvertFrom-Json) | Select-Object insertedMatieres,updatedMatieres,skippedMatieres,insertedExamEvents,skippedExamEvents
(Get-Content .\import-cir.json -Raw | ConvertFrom-Json) | Select-Object insertedMatieres,updatedMatieres,skippedMatieres,insertedExamEvents,skippedExamEvents
```

### 7.8 Verifications SQL

```powershell
docker exec postgres-database psql -U opale_user -d opale -c "SELECT nom FROM promotion ORDER BY nom;"
docker exec postgres-database psql -U opale_user -d opale -c "SELECT p.nom AS promo, COUNT(m.id) AS nb_matieres FROM promotion p LEFT JOIN matiere m ON m.id_promo=p.id GROUP BY p.nom ORDER BY p.nom;"
docker exec postgres-database psql -U opale_user -d opale -c "SELECT COUNT(*) AS nb_events FROM event;"
docker exec postgres-database psql -U opale_user -d opale -c "SELECT p.nom AS promo, COUNT(*) AS nb_exam_events FROM event e JOIN concerner c ON c.id_event=e.id JOIN promotion p ON p.id=c.id_promo WHERE UPPER(e.type::text)='EXAMEN' GROUP BY p.nom ORDER BY p.nom;"
```

### 7.9 Test d'idempotence (important)

Relancer le meme import une deuxieme fois:

```powershell
curl.exe -sS -X POST "$BASE/maquette/import" -H "x-access-token: $TOKEN" -F "file=@$ADI" -F "cycleHint=ADI" -F "dryRun=false" -o ".\import-adi-2.json"
(Get-Content .\import-adi-2.json -Raw | ConvertFrom-Json) | Select-Object insertedExamEvents,skippedExamEvents
```

Attendu:

- `insertedExamEvents = 0`
- `skippedExamEvents > 0`

### 7.10 Reset des seuls examens (optionnel)

Utile pour rejouer un scenario "premier import":

```powershell
docker exec postgres-database psql -U opale_user -d opale -c "BEGIN; DELETE FROM concerner c USING event e WHERE c.id_event=e.id AND UPPER(e.type::text)='EXAMEN'; DELETE FROM event e WHERE UPPER(e.type::text)='EXAMEN'; COMMIT;"
```

## 8) Points d'attention connus

- Si `AP3` n'existe pas en table `promotion`, les lignes AP3 sont ignorees avec warning.
- Les accents peuvent etre mal rendus si la sortie HTTP est redirigee avec `Out-File`.
  Utiliser `curl.exe ... -o fichier.json` pour conserver correctement l'encodage.
- Les dates d'examen creees sont des placeholders techniques, pas des dates pedagogiques officielles.

## 9) Evolutions possibles

- Ajouter une table dediee pour stocker le detail des evaluations (type/poids/ordre) de facon normalisee.
- Affiner le calendrier des examens avec de vraies regles metier de placement.
- Ajouter des tests d'integration DB automatises sur `/maquette/import`.

### Q/R issues des discussions

Q1. Si un nouveau cycle apparait (ex: `XP`), est-ce que l'extraction fonctionne ?
A1. Oui pour le parsing brut (modules, semestres, heures, evaluations), car le parser est generique. En revanche, la resolution cycle/promotion sera en mode fallback tant qu'on n'ajoute pas des regles explicites dans `promotionResolver.ts` (ou une source de configuration dynamique). C'est une piste d'evolution prioritaire pour industrialiser l'onboarding de nouveaux cycles.

Q2. Peut-on mettre les alias d'entetes en base pour les gerer depuis le front ?
A2. Oui. L'architecture actuelle permet de remplacer les constantes `HEADER_ALIAS` par un provider (DB + cache). Il faudrait ajouter:
- une table de configuration des alias;
- une API d'administration pour CRUD des alias;
- une couche de cache/validation pour eviter les regressions de parsing.
Cette evolution reduit les redeploiements backend lors de changements de maquettes.

Q3. Les fichiers `maquetteParser.ts` et `maquetteImportService.ts` sont longs. Faut-il les decouper ?
A3. Oui, c'est recommande a moyen terme. Decoupage propose:
- parser: `headerDetection`, `rowParsing`, `lineMerging`, `evaluationMapping`;
- import: `matiereUpsert`, `examEventBuilder`, `examEventRepository`, `schemaCapabilities`.
Le comportement restera identique mais le test unitaire, la lisibilite et la maintenabilite seront meilleurs.

Q4. Peut-on eviter de parser 2 fois (preview analyze puis import) ?
A4. Oui. Strategie possible:
- l'appel `analyze` retourne aussi un identifiant de snapshot (payload parse stocke en cache temporaire ou table technique);
- l'appel `import` consomme ce snapshot au lieu de relire le fichier.
Points d'attention: expiration, taille memoire, securite, et invalidation si le fichier source change.
