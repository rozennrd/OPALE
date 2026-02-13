# OPALE PROJECT

## To run the project : 

### 1. Database

* Prerequisite : [Docker](https://www.docker.com/get-started/) is installed.
* Open terminal in folder BobPlanning.database
* `docker compose up`

* Add a file .env at the root of the project that contains this :

```
POSTGRES_DB=opale
POSTGRES_USER=opale_user
POSTGRES_PASSWORD=thisIsOpale!
```

### 2. Backend
Add file `db.conf` in src/database/config
```
DB_HOST=localhost
DB_USER=opale_user
DB_PASSWORD=thisIsOpale!
DB_NAME=opale
DB_PORT=5432
POSTGRES_DB=opale
POSTGRES_USER=opale_user
POSTGRES_PASSWORD=thisIsOpale!
```
* Go to BobPlanning.back --> cd .\BobPlanning.back
* Install library --> npm i
* Run the project --> npm run dev

### 3. Frontend
 
* Add this .env file in BobPlanning.front :

```
  VITE_RACINE_FETCHER_URL=http://localhost:3000
```
* Go to BobPlanning.front --> cd .\BobPlanning.front
* Install library --> npm i
* Run the project --> npm run dev 


You can stop here if you just want to run the project. Continue if you are trying to develop.

---

 Pour l'utilisation de le partie, utilisation de postman en rajoutant dans le headers un x-access-token que vous pouvez le récupérer depuis votre front apres la connexion en tapant dans votre console web la commande : localStorage.accessToken qui vous renvoit votre token actuel. 
 Sinon vous pouvez supprimer dans index.ts la demande de vérification du token, attention, ne pas supprimer pour la partie prod. 

## [work in progress] MicroService
Service pour générer le micro-planning
 Go to BobPlanning.microService --> cd .\BobPlanning.microService
 Create a env mode for python --> python -m venv venv
 Go in env mode for python : 
   If you are a linux user --> source venv/bin/activate 
   If you are a Windows user --> .\venv\Scripts\activate
 Install library --> pip install -r requirements.txt
 Run the project --> uvicorn main:app --port 3001 --reload

 Pour mettre à jour les installations de lib --> pip freeze > requirements.txt

## Database
### Entity Relationship Diagram 
#### Existing Database Schema : BOB
```mermaid
erDiagram
%% =====================
%% Schéma : bobPlanning
%% =====================

    calendrier {
        int(11) id PK
        date dateDeb
        date dateFin
    }

    Cours {
        int(11) id PK
        int(11) promo FK  "→ promosData.id (CASCADE)"
        varchar name
        varchar UE
        longtext Semestre
        longtext Periode  "NULL"
        int(11) Prof FK       "→ Professeurs.id (SET NULL)"
        enum typeSalle    "classique|electronique|informatique|projet"
        longtext heure    "JSON (CHECK json_valid(heure))"
    }

    Professeurs {
        int(11) id PK
        varchar name
        enum type         "EXT|INT"
        text dispo        
    }

    promosData {
        int(11) id PK
        varchar Name
        int Nombre
        longtext Periode  
    }

    Salles {
        int(11) id PK
        varchar name
        enum type         "classique|electronique|informatique|projet"
        int(11) capacite
    }

    Utilisateurs {
        int IdUtilisateur PK
        varchar Login
        varchar Email
        varchar Password
        tinyint Bloque        "DEFAULT 0"
        datetime DateBlocage  "NULL"
        int TentativesEchouees "DEFAULT 0"
    }

%% =====================
%% Relations
%% =====================

    Professeurs ||--o{ Cours : "enseigne (Prof)"
    promosData  ||--|{ Cours : "regroupe (promo)"
%% Note: pas de contrainte FK entre Cours.typeSalle et Salles
%% Note: calendrier et Utilisateurs n'ont pas de relations explicites

```

#### New Database Schema : OPALE
```mermaid
erDiagram
    professeur {
        UUID id PK
        varchar nom
        varchar prenom
        varchar email
        type_professeur type
        boolean distanciel
    }

    salle {
        UUID id PK
        varchar nom
        type_salle type
        int capacite
        int etage
    }

    event {
        UUID id PK
        type_event type
        varchar nom
        int num_semaine
        timestamp datetime_start
        timestamp datetime_end
        boolean show_macro
        boolean show_micro
        boolean is_blocking
    }

    cycle {
        UUID id PK
        varchar nom
        type_cycle type
    }

    promotion {
        UUID id PK
        varchar nom
        int effectifs
        UUID id_cycle FK
        date date_start
        date date_end
    }

    groupe {
        UUID id PK
        UUID id_promo FK
        varchar nom
        int effectifs
    }

    specialite {
        UUID id PK
        UUID id_groupe FK
        UUID id_promo FK
        varchar nom
        int effectifs
    }

    matiere {
        UUID id PK
        varchar nom
        float volume_horaire
        UUID id_promo FK
        UUID id_specialite FK
        int semestre
        int nb_partiels
        int nb_eval_intermediaire
        int heures_td
        int heures_tp
    }

    cours {
        UUID id PK
        UUID id_event FK
        type_cours type
        UUID id_prof FK
        UUID id_matiere FK
        boolean is_distanciel
    }

    disponibilite {
        UUID id PK
        UUID id_prof FK
        int num_semaine
        varchar dispo_micro
    }

    localisation {
        UUID id PK
        UUID id_salle FK
        UUID id_event FK
    }

    concerner {
        UUID id PK
        UUID id_event FK
        UUID id_promo FK
        UUID id_groupe FK
        UUID id_specialite FK
    }

    enseignement {
        UUID id PK
        UUID id_matiere FK
        UUID id_prof FK
        int nb_heures
    }

    utilisateurs {
        UUID id_utilisateur PK
        varchar login
        varchar email
        varchar password
        boolean bloque
        timestamp date_blocage
        int tentatives_echouees
    }

%% ================================
%%          RELATIONS
%% ================================

    cycle ||--o{ promotion : "1,n"

    promotion ||--o{ groupe : "1,n"
    promotion ||--o{ specialite : "1,n"
    promotion ||--o{ matiere : "1,n"

    groupe ||--o{ specialite : "1,n"

    specialite ||--o{ matiere : "1,n"

    professeur ||--o{ cours : "1,n"
    matiere ||--o{ cours : "1,n"
    event ||--o{ cours : "1,n"

    professeur ||--o{ disponibilite : "1,n"

    salle ||--o{ localisation : "1,n"
    event ||--o{ localisation : "1,n"

    event ||--o{ concerner : "1,n"
    promotion ||--o{ concerner : "0,n"
    groupe ||--o{ concerner : "0,n"
    specialite ||--o{ concerner : "0,n"

    professeur ||--o{ enseignement : "1,n"
    matiere ||--o{ enseignement : "1,n"

```