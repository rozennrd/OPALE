-- ===================================================================
-- Schéma OPALE - Création des types, tables et contraintes
-- Base : PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================
-- 1. Types ENUM
-- ==============================================================

CREATE TYPE type_professeur AS ENUM ('permanent', 'intervenant', 'invite');
CREATE TYPE type_salle      AS ENUM ('projet', 'td', 'tp', 'reunion', 'autre');
CREATE TYPE type_event      AS ENUM ('cours', 'examen', 'reunion', 'fermeture', 'soutenance', 'portes ouvertes', 'autre');
CREATE TYPE type_cours      AS ENUM ('TD', 'TP', 'PROJET', 'AUTRE');
CREATE TYPE type_cycle      AS ENUM ('Initial', 'Apprentissage');
CREATE TYPE campus          AS ENUM ('Bordeaux', 'Lille', 'Chateauroux');

-- ==============================================================
-- 2. Tables de base
-- ==============================================================

-- 2.1 professeur
CREATE TABLE professeur (
                            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            nom         VARCHAR(255)        NOT NULL,
                            prenom      VARCHAR(255)        NOT NULL,
                            email       VARCHAR(255),
                            email_perso VARCHAR(255),
                            type        type_professeur     NOT NULL,
                            distanciel  BOOLEAN             DEFAULT FALSE,
                            campus_origin campus,
                            CONSTRAINT uq_professeur_email UNIQUE (email),
                            CONSTRAINT uq_professeur_email_perso UNIQUE (email_perso)
);

-- 2.2 salle
CREATE TABLE salle (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       nom         VARCHAR(100)        NOT NULL,
                       type        type_salle          NOT NULL,
                       capacite    INT,
                       etage       INT,
                       CONSTRAINT uq_salle_nom UNIQUE (nom)
);

-- 2.3 event
CREATE TABLE event (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       type            type_event          NOT NULL,
                       nom             VARCHAR(255)        NOT NULL,
                       num_semaine     INT,
                       datetime_start  TIMESTAMP           NOT NULL,
                       datetime_end    TIMESTAMP           NOT NULL,
                       show_macro      BOOLEAN             DEFAULT TRUE,
                       show_micro      BOOLEAN             DEFAULT TRUE,
                       is_blocking     BOOLEAN             DEFAULT FALSE,
                       is_exceptional  BOOLEAN             DEFAULT FALSE,
                       is_external     BOOLEAN             DEFAULT FALSE,
                       CONSTRAINT ck_event_dates CHECK (datetime_start < datetime_end)
);

-- 2.4 cycle
CREATE TABLE cycle (
                       id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       nom     VARCHAR(255)    NOT NULL,
                       type    type_cycle     NOT NULL,
                       CONSTRAINT uq_cycle_nom UNIQUE (nom, type)
);

-- 2.5 promotion
CREATE TABLE promotion (
                           id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           nom         VARCHAR(255)    NOT NULL,
                           effectifs   INT             NOT NULL,
                           id_cycle    UUID            NOT NULL,
                           date_start  DATE,
                           date_end    DATE,
                           CONSTRAINT fk_promotion_cycle
                               FOREIGN KEY (id_cycle)
                                   REFERENCES cycle(id)
                                   ON UPDATE CASCADE
                                   ON DELETE CASCADE,
                           CONSTRAINT uq_promotion_nom_cycle UNIQUE (nom, id_cycle),
                           CONSTRAINT ck_promotion_dates CHECK (
                               date_start IS NULL OR date_end IS NULL OR date_start <= date_end
                               )
);

-- 2.6 groupe
CREATE TABLE groupe (
                        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        id_promo    UUID           NOT NULL,
                        nom         VARCHAR(100)   NOT NULL,
                        effectifs   INT            NOT NULL,
                        CONSTRAINT fk_groupe_promotion
                            FOREIGN KEY (id_promo)
                                REFERENCES promotion(id)
                                ON UPDATE CASCADE
                                ON DELETE CASCADE,
                        CONSTRAINT uq_groupe_nom_promo UNIQUE (id_promo, nom)
);

-- 2.7 specialite
CREATE TABLE specialite (
                            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            id_groupe   UUID           NULL,
                            id_promo    UUID           NULL,
                            nom         VARCHAR(255)   NOT NULL,
                            effectifs   INT            NOT NULL,
                            CONSTRAINT fk_specialite_groupe
                                FOREIGN KEY (id_groupe)
                                    REFERENCES groupe(id)
                                    ON UPDATE CASCADE
                                    ON DELETE CASCADE,
                            CONSTRAINT fk_specialite_promo
                                FOREIGN KEY (id_promo)
                                    REFERENCES promotion(id)
                                    ON UPDATE CASCADE
                                    ON DELETE CASCADE,
                            CONSTRAINT uq_specialite_nom_groupe UNIQUE (id_groupe, nom)
);

-- 2.8 matiere
CREATE TABLE matiere (
                         id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         nom                    VARCHAR(255)   NOT NULL,
                         volume_horaire         FLOAT          NOT NULL,
                         id_promo               UUID,
                         id_specialite          UUID,
                         semestre               INT            NOT NULL,
                         nb_partiels            INT            NOT NULL,
                         nb_eval_intermediaire  INT,
                         heures_td              INT,
                         heures_tp              INT,
                         CONSTRAINT fk_matiere_promotion
                             FOREIGN KEY (id_promo)
                                 REFERENCES promotion(id)
                                 ON UPDATE CASCADE
                                 ON DELETE SET NULL,
                         CONSTRAINT fk_matiere_specialite
                             FOREIGN KEY (id_specialite)
                                 REFERENCES specialite(id)
                                 ON UPDATE CASCADE
                                 ON DELETE SET NULL,
                         CONSTRAINT ck_matiere_volume CHECK (volume_horaire >= 0),
                         CONSTRAINT ck_matiere_semestre CHECK (semestre >= 1),
                         CONSTRAINT uq_matiere_ident UNIQUE (nom, semestre, id_promo, id_specialite)
);

-- ==============================================================
-- 3. Tables de lien / métier
-- ==============================================================

-- 3.1 cours
CREATE TABLE cours (
                       id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       id_event       UUID           NOT NULL,
                       type           type_cours     NOT NULL,
                       id_prof        UUID           NOT NULL,
                       id_matiere     UUID           NOT NULL,
                       is_distanciel  BOOLEAN        DEFAULT FALSE,
                       CONSTRAINT fk_cours_event
                           FOREIGN KEY (id_event)
                               REFERENCES event(id)
                               ON UPDATE CASCADE
                               ON DELETE CASCADE,
                       CONSTRAINT fk_cours_prof
                           FOREIGN KEY (id_prof)
                               REFERENCES professeur(id)
                               ON UPDATE CASCADE
                               ON DELETE CASCADE,
                       CONSTRAINT fk_cours_matiere
                           FOREIGN KEY (id_matiere)
                               REFERENCES matiere(id)
                               ON UPDATE CASCADE
                               ON DELETE CASCADE,
    -- Évite d’avoir plusieurs fois exactement le même cours
                       CONSTRAINT uq_cours_unique UNIQUE (id_event, id_prof, id_matiere, type)
);

-- 3.2 disponibilite
CREATE TABLE disponibilite (
                               id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               id_prof      UUID        NOT NULL,
                               num_semaine  INT         NOT NULL,
                               dispo_micro  VARCHAR(10),
                               CONSTRAINT fk_dispo_prof
                                   FOREIGN KEY (id_prof)
                                       REFERENCES professeur(id)
                                       ON UPDATE CASCADE
                                       ON DELETE CASCADE,
    -- Un bloc de dispo par prof / semaine
                               CONSTRAINT uq_dispo_prof_semaine UNIQUE (id_prof, num_semaine)
);

-- 3.3 localisation (event ↔ salle)
CREATE TABLE localisation (
                              id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              id_salle  UUID   NOT NULL,
                              id_event  UUID   NOT NULL,
                              CONSTRAINT fk_localisation_salle
                                  FOREIGN KEY (id_salle)
                                      REFERENCES salle(id)
                                      ON UPDATE CASCADE
                                      ON DELETE CASCADE,
                              CONSTRAINT fk_localisation_event
                                  FOREIGN KEY (id_event)
                                      REFERENCES event(id)
                                      ON UPDATE CASCADE
                                      ON DELETE CASCADE,
    -- Une même salle ne peut pas être associée deux fois au même event
                              CONSTRAINT uq_localisation_salle_event UNIQUE (id_salle, id_event)
);

-- 3.4 concerner (event ↔ promo / groupe / spécialité)
CREATE TABLE concerner (
                           id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           id_event       UUID    NOT NULL,
                           id_promo       UUID    NULL ,
                           id_groupe      UUID    NULL ,
                           id_specialite  UUID    NULL ,
                           CONSTRAINT fk_concerner_event
                               FOREIGN KEY (id_event)
                                   REFERENCES event(id)
                                   ON UPDATE CASCADE
                                   ON DELETE CASCADE,
                           CONSTRAINT fk_concerner_promo
                               FOREIGN KEY (id_promo)
                                   REFERENCES promotion(id)
                                   ON UPDATE CASCADE
                                   ON DELETE CASCADE,
                           CONSTRAINT fk_concerner_groupe
                               FOREIGN KEY (id_groupe)
                                   REFERENCES groupe(id)
                                   ON UPDATE CASCADE
                                   ON DELETE CASCADE,
                           CONSTRAINT fk_concerner_specialite
                               FOREIGN KEY (id_specialite)
                                   REFERENCES specialite(id)
                                   ON UPDATE CASCADE
                                   ON DELETE CASCADE,
    -- Au moins une cible (promo/groupe/spécialité)
                           CONSTRAINT ck_concerner_cible CHECK (
                               id_promo IS NOT NULL
                                   OR id_groupe IS NOT NULL
                                   OR id_specialite IS NOT NULL
                               ),
    -- Évite de dupliquer la même association
                           CONSTRAINT uq_concerner_unique UNIQUE (id_event, id_promo, id_groupe, id_specialite)
);

-- 3.5 enseignement (matiere ↔ professeur)
CREATE TABLE enseignement (
                              id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              id_matiere  UUID    NOT NULL,
                              id_prof     UUID    NOT NULL,
                              nb_heures   INT,
                              CONSTRAINT fk_enseignement_matiere
                                  FOREIGN KEY (id_matiere)
                                      REFERENCES matiere(id)
                                      ON UPDATE CASCADE
                                      ON DELETE CASCADE,
                              CONSTRAINT fk_enseignement_prof
                                  FOREIGN KEY (id_prof)
                                      REFERENCES professeur(id)
                                      ON UPDATE CASCADE
                                      ON DELETE CASCADE,
    -- Un prof ne doit pas avoir deux lignes pour la même matière
                              CONSTRAINT uq_enseignement_unique UNIQUE (id_matiere, id_prof),
                              CONSTRAINT ck_enseignement_heures CHECK (nb_heures IS NULL OR nb_heures >= 0)
);

-- --------------------------------------------------------

--
-- Structure de la table `Utilisateurs`
--

CREATE TABLE utilisateurs (
                              id_utilisateur      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              login       VARCHAR(255)    NOT NULL,
                              email       VARCHAR(255)    NOT NULL,
                              password    VARCHAR(255)    NOT NULL,
                              bloque      BOOLEAN         DEFAULT FALSE,
                              date_blocage TIMESTAMP      NOT NULL,
                              tentatives_echouees INT    DEFAULT 0 NOT NULL
);


-- ==============================================================
-- Indices optionnels
-- ==============================================================

CREATE INDEX idx_dispo_prof_semaine     ON disponibilite (id_prof, num_semaine);
CREATE INDEX idx_event_num_semaine      ON event (num_semaine);
CREATE INDEX idx_cours_prof             ON cours (id_prof);
CREATE INDEX idx_cours_matiere          ON cours (id_matiere);
CREATE INDEX idx_concerner_event        ON concerner (id_event);
CREATE INDEX idx_localisation_event     ON localisation (id_event);
CREATE INDEX idx_matiere_promo          ON matiere (id_promo);
CREATE INDEX idx_matiere_specialite     ON matiere (id_specialite);

-- ==============================================================
-- Insertion des données initiales
-- ==============================================================
--
-- Déchargement des données de la table `Utilisateurs`
--
INSERT INTO utilisateurs (login, email, password, date_blocage, tentatives_echouees) VALUES
    ('Daminou', 'Daminou', '43c1f76adf6d51952d6a20bbf8ddc93478d11aae84dbc37caa5e5c18b3c7f533',  '2025-02-17 15:36:41', 0);


-- Déchargement des données de la table `cycle`
-- Attention : A enlever une fois que la base de donnée sera correctement intégrée
--
INSERT INTO cycle (nom, type) VALUES
                                  ('Cycle Préparatoire', 'Initial'),
                                  ('Cycle Ingénieur',   'Initial'),
                                  ('Cycle Ingénieur', 'Apprentissage');


-- Déchargement des données de la table `promotions`
-- Attention : A enlever une fois que la base de donnée sera correctement intégrée
--
INSERT INTO promotion (nom, effectifs, id_cycle, date_start, date_end) VALUES
                                                                           ('ADI1',   20,  (SELECT id FROM cycle WHERE nom = 'Cycle Préparatoire'), '2023-09-01', '2024-06-30'),
                                                                           ('ADI2',   22,  (SELECT id FROM cycle WHERE nom = 'Cycle Préparatoire'), '2023-09-01', '2024-06-30'),
                                                                           ('CIR1',   21,  (SELECT id FROM cycle WHERE nom = 'Cycle Préparatoire'), '2023-09-01', '2024-06-30'),
                                                                           ('CIR2',   25,  (SELECT id FROM cycle WHERE nom = 'Cycle Préparatoire'), '2023-09-01', '2024-06-30'),
                                                                           ('AP3',    30,  (SELECT id FROM cycle WHERE nom = 'Cycle Ingénieur' and type = 'Apprentissage'),    '2023-09-01', '2024-06-30'),
                                                                           ('AP4',    30,  (SELECT id FROM cycle WHERE nom = 'Cycle Ingénieur' and type = 'Apprentissage'),    '2023-09-01', '2024-06-30'),
                                                                           ('AP5',    30,  (SELECT id FROM cycle WHERE nom = 'Cycle Ingénieur' and type = 'Apprentissage'),    '2023-09-01', '2024-06-30'),
                                                                           ('ISEN3',    30,  (SELECT id FROM cycle WHERE nom = 'Cycle Ingénieur' and type = 'Initial'),    '2023-09-01', '2024-06-30'),
                                                                           ('ISEN4',    30,  (SELECT id FROM cycle WHERE nom = 'Cycle Ingénieur' and type = 'Initial'),    '2023-09-01', '2024-06-30'),
                                                                           ('ISEN5',    30,  (SELECT id FROM cycle WHERE nom = 'Cycle Ingénieur' and type = 'Initial'),    '2023-09-01', '2024-06-30');