-- ===================================================================
-- Schéma OPALE - Création des types, tables et contraintes
-- Base : PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================
-- 1. Types ENUM
-- ==============================================================

CREATE TYPE type_professeur AS ENUM ('Permanent', 'Intervenant', 'Invite');
CREATE TYPE type_salle      AS ENUM ('Cours', 'Informatique', 'Projet', 'Rassemblement', 'Associatif', 'Reunion', 'Electronique', 'Fablab', 'Reseau', 'Autre');
CREATE TYPE type_event      AS ENUM ('Cours', 'Entreprise', 'Examen', 'Reunion', 'Fermeture', 'Soutenance', 'JPO', 'Stage', 'Mobilite', 'PFE', 'Rattrapage', 'Conference', 'Rentrée', 'Réunion parents', 'Journée Immersion', 'Concours', 'Salon', 'Fin des cours', 'Autre');
CREATE TYPE type_cours      AS ENUM ('Cours_TD', 'Cours_TD_DIST', 'Cours_TP', 'Cours_TP_DIST', 'E-Learning', 'Entreprise', 'Examen', 'Projet', 'Rattrapage', 'Associatif', 'Conférence', 'Stage', 'Encadrement', 'Auto-géré', 'Autre');
CREATE TYPE type_cycle      AS ENUM ('Initial', 'Apprentissage');
CREATE TYPE campus          AS ENUM ('Bordeaux', 'Lille', 'Chateauroux');
CREATE TYPE modalite_enseignement AS ENUM ('Présentiel', 'Distanciel', 'Hybride');

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
                            telephone   VARCHAR(20),
                            type        type_professeur     NOT NULL,
                            modalite_enseignement  modalite_enseignement,
                            campus_origin campus,
                            CONSTRAINT uq_professeur_email UNIQUE (email),
                            CONSTRAINT uq_professeur_email_perso UNIQUE (email_perso)
);

-- 2.2 salle
CREATE TABLE salle (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       nom         VARCHAR(100)        NOT NULL,
                       nom_complet  VARCHAR(255),
                       type_principal type_salle  NOT NULL,
                       types_secondaires type_salle[],
                       etage       INT,
                       capacite    INT,
                       utilisable  BOOLEAN             DEFAULT FALSE,
                       description VARCHAR(500),
                       CONSTRAINT uq_salle_nom UNIQUE (nom)
);

-- 2.3 event
CREATE TABLE event (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       type            type_event          NOT NULL,
                       nom             VARCHAR(255)        NOT NULL,
                       description     VARCHAR(255),
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
                         heures_projet          FLOAT,
                         heures_elearning       FLOAT,
                         heures_autre           FLOAT,
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
                              heures_td   INT,
                              heures_tp   INT,
                              heures_projet INT,
                              heures_elearning INT,
                              heures_autre INT,
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
                              CONSTRAINT ck_enseignement_heures_td CHECK (heures_td IS NULL OR heures_td >= 0),
                              CONSTRAINT ck_enseignement_heures_tp CHECK (heures_tp IS NULL OR heures_tp >= 0)

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
-- Note : utilisateur Daminou, mdp Daminou
-- utilisateur test, mdp test
--
INSERT INTO utilisateurs (login, email, password, date_blocage, tentatives_echouees) VALUES
                                                                                         ('Daminou', 'Daminou', '43c1f76adf6d51952d6a20bbf8ddc93478d11aae84dbc37caa5e5c18b3c7f533',  '2025-02-17 15:36:41', 0),
                                                                                         ('test', 'test', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',  '2025-02-17 15:36:41', 0);



-- Déchargement des données de la table `cycle`
-- Attention : À enlever une fois que la base de donnée sera correctement intégrée
--
INSERT INTO cycle (nom, type) VALUES
                                  ('Préparatoire - Adimaker', 'Initial'),
                                  ('Préparatoire - Cir', 'Initial'),
                                  ('Ingénieur - Initial',   'Initial'),
                                  ('Ingénieur - Apprentissage', 'Apprentissage');

-- Déchargement des données de la table `salle`
--
INSERT INTO salle (nom, nom_complet, type_principal, etage, capacite, utilisable, description) VALUES
    ('A101', 'Salle de cours A101', 'Cours', 1, 30, TRUE, 'Salle de cours standard'),
    ('A102', 'Salle de cours A102', 'Cours', 1, 25, TRUE, 'Salle de cours standard'),
    ('B201', 'Salle de cours B201', 'Cours', 2, 35, TRUE, 'Salle de cours grande capacité'),
    ('INFO1', 'Salle informatique INFO1', 'Informatique', 0, 20, TRUE, 'Salle informatique avec postes de travail'),
    ('PROJ1', 'Salle de projet PROJ1', 'Projet', 2, 15, TRUE, 'Salle dédiée aux travaux de groupe et projets');

-- Déchargement des données de la table `professeur`
--
INSERT INTO professeur (id, nom, prenom, email, email_perso, telephone, type, modalite_enseignement, campus_origin) VALUES
    ('7ecaee77-c21a-4bcc-9e0b-be9e554153a2', 'McMillan',   'Tricia',  NULL,                               NULL,                               '0633936710', 'Intervenant', 'Distanciel', 'Bordeaux'),
    ('cdedd532-bf81-4706-8fd4-225597223203', 'McMillan',   'Tricia',  'rozenn.renaud@protonmail.com', 'rozenn.renaud@protonmail.com', '0532629636', 'Permanent',   'Présentiel', 'Bordeaux'),
    ('ed2d8e6a-db52-4c89-8efc-acdf05df96bf', 'Dent',        'Arthur',  'fhdsjkf@gfdg.gf',             'gfjdkg@fds.fe',                '0121212121', 'Permanent',   'Présentiel', 'Bordeaux'),
    ('f938d325-f880-4a21-b5ae-53f58e15b3e5', 'Beeblebrox', 'Zaphod',  'lllll@ae.e',                   'fdgf@fd.e',                    '0665656565', 'Intervenant', 'Présentiel', 'Bordeaux'),
    ('1c4cb8ce-68c7-44f3-afa2-eaa9ad7d337a', 'Prefect',     'Ford',    'grrr@fd.e',                    'fdsfds@fd.d',                  '0632323232', 'Intervenant', 'Présentiel', 'Bordeaux'),
    ('faac9900-3d03-454b-8c46-0947e353c46c', 'McGee',       'Bobby',   'fds@ooo.e',                    'fdsfds@ese.ts',                '0685858585', 'Intervenant', 'Présentiel', 'Bordeaux'),
    ('96f46b56-47f6-418b-802d-f2dd1732da6b', 'lumpur',      'koala',   'gfdg@lll.e',                   'pppp@e.e',                     '0656565656', 'Permanent',   'Présentiel', 'Bordeaux'),
    ('885de8c7-1e90-488b-8360-1f9ef5fd754b', 'chirac',      'jacques', 'jjj@ds.e',                     'jiji@peo.p',                   '0632323232', 'Permanent',   'Présentiel', 'Bordeaux'),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dupont',     'Marie',   'marie.dupont@isen.fr',        'marie.perso@mail.fr',          '0611111111', 'Permanent',   'Présentiel', 'Bordeaux'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Martin',     'Pierre',  'pierre.martin@isen.fr',       NULL,                          '0622222222', 'Intervenant', 'Hybride',    'Bordeaux'),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Bernard',    'Sophie',  'sophie.bernard@isen.fr',      'sophie.b@gmail.com',           '0633333333', 'Permanent',   'Présentiel', 'Lille'),
    ('d4e5f6a7-b8c9-0123-def1-234567890123', 'Lefevre',    'Luc',     NULL,                          'luc.lefevre@free.fr',         '0644444444', 'Intervenant', 'Distanciel', 'Bordeaux'),
    ('e5f6a7b8-c9d0-1234-ef12-345678901234', 'Moreau',     'Claire',  'claire.moreau@isen.fr',       NULL,                          '0655555555', 'Permanent',   'Hybride',    'Bordeaux'),
    ('f6a7b8c9-d0e1-2345-f123-456789012345', 'Petit',      'Thomas',  'thomas.petit@isen.fr',        'thomas.p@outlook.fr',         '0666666666', 'Intervenant', 'Présentiel', 'Lille'),
    ('1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'Leroy',      'Julie',   'julie.leroy@isen.fr',         'julie.leroy@gmail.com',       '0677777777', 'Permanent',   'Présentiel', 'Bordeaux'),
    ('2b3c4d5e-6f7a-8901-bcde-f12345678912', 'Roux',       'Nicolas', 'nicolas.roux@isen.fr',        NULL,                         '0688888888', 'Intervenant', 'Hybride',    'Chateauroux'),
    ('3c4d5e6f-7a8b-9012-cdef-123456789013', 'Fournier',   'Emma',    'emma.fournier@isen.fr',       'emma.f@free.fr',              '0699999999', 'Permanent',   'Distanciel', 'Bordeaux'),
    ('4d5e6f7a-8b9c-0123-def1-234567890134', 'Garnier',    'Antoine', 'antoine.garnier@isen.fr',     NULL,                         '0610101010', 'Intervenant', 'Présentiel', 'Lille'),
    ('5e6f7a8b-9c0d-1234-ef12-345678901235', 'Chevalier',  'Sarah',   'sarah.chevalier@isen.fr',     'sarah.c@hotmail.fr',          '0612121212', 'Permanent',   'Hybride',    'Chateauroux');

-- Déchargement des données de la table `promotions`
INSERT INTO promotion (nom, effectifs, id_cycle, date_start, date_end) VALUES
                                                                           ('ADI1',   20,  (SELECT id FROM cycle WHERE nom = 'Préparatoire - Adimaker'), '2023-09-01', '2024-06-30'),
                                                                           ('ADI2',   22,  (SELECT id FROM cycle WHERE nom = 'Préparatoire - Adimaker'), '2023-09-01', '2024-06-30'),
                                                                           ('CIR1',   21,  (SELECT id FROM cycle WHERE nom = 'Préparatoire - Cir'), '2023-09-01', '2024-06-30'),
                                                                           ('CIR2',   25,  (SELECT id FROM cycle WHERE nom = 'Préparatoire - Cir'), '2023-09-01', '2024-06-30'),
                                                                           ('AP3',    30,  (SELECT id FROM cycle WHERE nom = 'Ingénieur - Apprentissage' and type = 'Apprentissage'),    '2023-09-01', '2024-06-30'),
                                                                           ('AP4',    30,  (SELECT id FROM cycle WHERE nom = 'Ingénieur - Apprentissage' and type = 'Apprentissage'),    '2023-09-01', '2024-06-30'),
                                                                           ('AP5',    30,  (SELECT id FROM cycle WHERE nom = 'Ingénieur - Apprentissage' and type = 'Apprentissage'),    '2023-09-01', '2024-06-30'),
                                                                           ('ISEN3',    30,  (SELECT id FROM cycle WHERE nom = 'Ingénieur - Initial' and type = 'Initial'),    '2023-09-01', '2024-06-30'),
                                                                           ('ISEN4',    30,  (SELECT id FROM cycle WHERE nom = 'Ingénieur - Initial' and type = 'Initial'),    '2023-09-01', '2024-06-30'),
                                                                           ('ISEN5',    30,  (SELECT id FROM cycle WHERE nom = 'Ingénieur - Initial' and type = 'Initial'),    '2023-09-01', '2024-06-30');

INSERT INTO salle (nom, nom_complet, type_principal, types_secondaires, etage, capacite, description) VALUES
                                                                                                          ('J001', 'Fablab', 'Fablab'::type_salle, ARRAY['Fablab', 'Informatique', 'Projet']::type_salle[], 0, 30, ''),
                                                                                                          ('J002', 'J002', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 0, 30, ''),
                                                                                                          ('J003', 'Codesign', 'Informatique'::type_salle, ARRAY['Informatique']::type_salle[], 0, 20, 'Salle de cours de TD informatique'),
                                                                                                          ('J004', 'J004', 'Informatique'::type_salle, ARRAY['Informatique', 'Reseau', 'Electronique']::type_salle[], 0, 16, 'Salle de cours de TP informatique'),
                                                                                                          ('J005', 'J005', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 0, 30, ''),
                                                                                                          ('J101', 'J101', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 1, 30, ''),
                                                                                                          ('J102', 'J102', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 1, 30, ''),
                                                                                                          ('J103', 'J103', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 1, 20, 'Salle de cours de TD informatique'),
                                                                                                          ('J104', 'J104', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 1, 16, 'Salle de cours de TP informatique'),
                                                                                                          ('J105', 'J105', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 1, 30, ''),
                                                                                                          ('J106', 'J106', 'Electronique'::type_salle, ARRAY['Electronique']::type_salle[], 1, 30, ''),
                                                                                                          ('J107', 'Cuisine Pédagogique', 'Reunion'::type_salle, ARRAY['Reunion', 'Cours']::type_salle[], 1, 30, ''),
                                                                                                          ('J108', 'J108', 'Reunion'::type_salle, ARRAY['Informatique']::type_salle[], 1, 30, ''),
                                                                                                          ('J109', 'Classlab', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 1, 30, ''),
                                                                                                          ('J201', 'J201', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 2, 30, ''),
                                                                                                          ('J202', 'J202', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 2, 30, ''),
                                                                                                          ('J203', 'J203', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 2, 20, 'Salle de cours de TD informatique'),
                                                                                                          ('J204', 'J204', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 2, 16, 'Salle de cours de TP informatique'),
                                                                                                          ('J205', 'J205', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 2, 30, ''),
                                                                                                          ('J206', 'J206', 'Cours'::type_salle, ARRAY['Informatique']::type_salle[], 2, 30, '');


INSERT INTO professeur (NOM, PRENOM, EMAIL, EMAIL_PERSO, TELEPHONE, TYPE, MODALITE_ENSEIGNEMENT, CAMPUS_ORIGIN) VALUES
                                                                                                                    ('Pirog', 'Antoine', 'antoine.pirog@junia.com', 'antoine.pirog@junia.com', '0625252525', 'Permanent', 'Présentiel', 'Bordeaux'),
                                                                                                                    ('Chatrie', 'Frédéric', 'frederic.chatrie@junia.com', 'frederic.chatrie@junia.com', '0626252525', 'Permanent', 'Présentiel', 'Bordeaux'),
                                                                                                                    ('Viot', 'Lucas', 'lucas.viot@junia.com', 'lucas.viot@junia.com', '0626352525', 'Permanent', 'Présentiel', 'Bordeaux'),
                                                                                                                    ('Mokrani', 'Cyril', 'cyril.mokrani@junia.com', null, '0626352625', 'Intervenant', 'Présentiel', 'Bordeaux');
