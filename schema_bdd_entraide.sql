-- =============================================================================
--  PLATEFORME D'ENTRAIDE ACADÉMIQUE — Script DDL PostgreSQL
--  Version      : 1.0.0 (Phase 1 MVP)
--  Auteur        : Chris Manuel Loïc — EVOLYX Tech
--  Base          : PostgreSQL 15+
--  Encodage      : UTF-8
--  Description   : Création complète du schéma relationnel incluant
--                  tables, types, contraintes, triggers, index et vues.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. PARAMÈTRES DE SESSION
-- ---------------------------------------------------------------------------
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;
SET check_function_bodies = FALSE;
SET client_min_messages = WARNING;


-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================

-- Recherche plein texte avec gestion des accents (é→e, ê→e, etc.)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Similarité de chaînes (% opérateur) — utile pour détection de doublons
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Génération d'UUID (optionnel, on préfère SERIAL pour simplifier)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- 2. TYPES ÉNUMÉRÉS (ENUM)
--    Les ENUMs garantissent l'intégrité des valeurs discrètes
--    sans passer par des tables de référence.
-- =============================================================================

-- Type de contenu d'une question
CREATE TYPE type_contenu_enum AS ENUM (
    'exercice',       -- Exercice / problème à résoudre
    'comprehension',  -- Question de compréhension de cours
    'ressources'      -- Demande de ressources (PDF, annales…)
);

-- Statut du cycle de vie d'une question
CREATE TYPE statut_question_enum AS ENUM (
    'ouvert',   -- En attente de réponse
    'resolu',   -- Solution acceptée par l'auteur
    'ferme'     -- Clôturé (modération ou désuet)
);

-- Type de notification système
CREATE TYPE type_notification_enum AS ENUM (
    'nouvelle_reponse',   -- Quelqu'un a répondu à votre question
    'commentaire',        -- Nouveau commentaire sur votre contenu
    'solution_acceptee',  -- Votre réponse a été acceptée
    'upvote'              -- Votre réponse a reçu un upvote
);

-- Fournisseur SSO (authentification tierce)
CREATE TYPE provider_sso_enum AS ENUM (
    'google',
    'universite',
    'local'       -- Inscription email/mot de passe classique
);

COMMENT ON TYPE type_contenu_enum    IS 'Catégories possibles pour le typage d''une question.';
COMMENT ON TYPE statut_question_enum IS 'Cycle de vie d''une question : ouverte → résolue ou fermée.';
COMMENT ON TYPE type_notification_enum IS 'Événements déclenchant une notification temps réel.';
COMMENT ON TYPE provider_sso_enum    IS 'Méthode d''authentification de l''utilisateur.';


-- =============================================================================
-- 3. TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3.1 MATIERE
--     Table de référence des matières académiques.
--     Pré-peuplée à l'initialisation (voir section 8 – Seeds).
-- ---------------------------------------------------------------------------
CREATE TABLE matiere (
    id      SERIAL       PRIMARY KEY,
    nom     VARCHAR(100) NOT NULL UNIQUE,
    domaine VARCHAR(100),            -- Ex: "Sciences formelles", "Informatique"
    icone   TEXT                     -- Emoji ou nom d'icône CSS
);

COMMENT ON TABLE  matiere         IS 'Référentiel des matières académiques disponibles sur la plateforme.';
COMMENT ON COLUMN matiere.domaine IS 'Domaine parent (Mathématiques, Informatique, Physique…).';
COMMENT ON COLUMN matiere.icone   IS 'Emoji ou identifiant icône pour l''affichage (ex: 🧮, 💻).';


-- ---------------------------------------------------------------------------
-- 3.2 TAG
--     Tags libres associés aux questions pour affiner le filtrage.
--     Le compteur nb_utilisations est mis à jour par trigger.
-- ---------------------------------------------------------------------------
CREATE TABLE tag (
    id              SERIAL      PRIMARY KEY,
    nom             VARCHAR(60) NOT NULL UNIQUE,
    description     TEXT,
    nb_utilisations INT         NOT NULL DEFAULT 0 CHECK (nb_utilisations >= 0)
);

COMMENT ON TABLE  tag                  IS 'Tags thématiques attribuables aux questions (Algèbre, Python, Réseaux…).';
COMMENT ON COLUMN tag.nb_utilisations  IS 'Compteur dénormalisé pour trier les tags populaires. Mis à jour par trigger.';


-- ---------------------------------------------------------------------------
-- 3.3 UTILISATEUR
--     Entité centrale : comptes étudiants et contributeurs.
--     La réputation (points_xp, niveau_confiance) est pilotée par triggers.
-- ---------------------------------------------------------------------------
CREATE TABLE utilisateur (
    id                  SERIAL              PRIMARY KEY,
    email               VARCHAR(255)        NOT NULL UNIQUE,
    mot_de_passe_hash   TEXT,               -- NULL si SSO uniquement
    pseudo              VARCHAR(80)         NOT NULL UNIQUE,
    nom                 VARCHAR(100),
    prenom              VARCHAR(100),
    avatar_url          TEXT,               -- URL Cloudinary
    bio                 TEXT,
    niveau_etudes       VARCHAR(100),       -- Ex: "3GI - ENSPY"
    points_xp           INT                 NOT NULL DEFAULT 0 CHECK (points_xp >= 0),
    niveau_confiance    INT                 NOT NULL DEFAULT 1 CHECK (niveau_confiance BETWEEN 1 AND 10),
    provider_sso        provider_sso_enum   NOT NULL DEFAULT 'local',
    est_actif           BOOLEAN             NOT NULL DEFAULT TRUE,
    date_inscription    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    date_derniere_connexion TIMESTAMPTZ
);

COMMENT ON TABLE  utilisateur                   IS 'Comptes utilisateurs. Couvre inscription locale et SSO Google/Université.';
COMMENT ON COLUMN utilisateur.mot_de_passe_hash IS 'Hash bcrypt/argon2. NULL pour les comptes SSO purs.';
COMMENT ON COLUMN utilisateur.points_xp         IS 'Expérience cumulée (gamification). Calculée par triggers sur votes/réponses.';
COMMENT ON COLUMN utilisateur.niveau_confiance  IS 'Niveau 1–10 débloquant des privilèges progressifs (modération, tags…).';
COMMENT ON COLUMN utilisateur.provider_sso      IS 'Méthode d''authentification principale.';


-- ---------------------------------------------------------------------------
-- 3.4 UTILISATEUR_MATIERE
--     Association N:M — matières suivies par un utilisateur.
--     Utilisée par l'algorithme Smart Feed pour personnaliser le fil.
-- ---------------------------------------------------------------------------
CREATE TABLE utilisateur_matiere (
    utilisateur_id  INT         NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    matiere_id      INT         NOT NULL REFERENCES matiere(id)     ON DELETE CASCADE,
    date_ajout      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (utilisateur_id, matiere_id)
);

COMMENT ON TABLE utilisateur_matiere IS 'Matières suivies par un utilisateur — alimente le Smart Feed (Phase 2).';


-- ---------------------------------------------------------------------------
-- 3.5 QUESTION
--     Entité principale de contenu.
--     search_vector est un champ tsvector maintenu automatiquement par trigger
--     pour la recherche plein texte haute performance.
-- ---------------------------------------------------------------------------
CREATE TABLE question (
    id               SERIAL               PRIMARY KEY,
    auteur_id        INT                  NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    matiere_id       INT                  REFERENCES matiere(id) ON DELETE SET NULL,
    titre            VARCHAR(120)         NOT NULL,
    type_contenu     type_contenu_enum    NOT NULL,
    niveau_etudes    VARCHAR(100),        -- Ex: "Prépa MPSI", "L2 Informatique"
    description      TEXT                 NOT NULL,
    statut           statut_question_enum NOT NULL DEFAULT 'ouvert',
    nb_vues          INT                  NOT NULL DEFAULT 0 CHECK (nb_vues >= 0),
    -- Champ calculé pour la recherche full-text (alimenté par trigger)
    search_vector    TSVECTOR,
    date_creation    TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMPTZ
);

COMMENT ON TABLE  question               IS 'Questions publiées par les étudiants. Nœud central du graphe social.';
COMMENT ON COLUMN question.search_vector IS 'Index tsvector (titre+description). Maintenu par trigger fn_update_search_vector.';
COMMENT ON COLUMN question.statut        IS 'Cycle de vie : ouvert → resolu (réponse acceptée) ou ferme (modération).';
COMMENT ON COLUMN question.nb_vues       IS 'Compteur de vues incrémenté à chaque consultation (via backend).';


-- ---------------------------------------------------------------------------
-- 3.6 QUESTION_TAG
--     Association N:M — tags d'une question.
-- ---------------------------------------------------------------------------
CREATE TABLE question_tag (
    question_id INT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    tag_id      INT NOT NULL REFERENCES tag(id)      ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

COMMENT ON TABLE question_tag IS 'Association N:M entre questions et tags. Suppression en cascade.';


-- ---------------------------------------------------------------------------
-- 3.7 REPONSE
--     Contributions complètes apportées à une question.
--     score_votes est dénormalisé et mis à jour par trigger à chaque vote.
-- ---------------------------------------------------------------------------
CREATE TABLE reponse (
    id                SERIAL      PRIMARY KEY,
    question_id       INT         NOT NULL REFERENCES question(id)    ON DELETE CASCADE,
    auteur_id         INT         NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    contenu           TEXT        NOT NULL,
    est_acceptee      BOOLEAN     NOT NULL DEFAULT FALSE,
    score_votes       INT         NOT NULL DEFAULT 0,  -- Dénormalisé : SUM(votes)
    date_creation     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMPTZ,

    -- Contrainte : une seule réponse acceptée par question (gérée aussi par trigger)
    CONSTRAINT uq_reponse_acceptee_par_question
        EXCLUDE USING btree (question_id WITH =)
        WHERE (est_acceptee = TRUE)
        DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE  reponse             IS 'Réponses complètes à une question. Une seule peut être marquée acceptée.';
COMMENT ON COLUMN reponse.est_acceptee IS 'TRUE = solution validée par l''auteur de la question. Déclenche attribution XP.';
COMMENT ON COLUMN reponse.score_votes  IS 'Somme algébrique des votes (+1/-1). Dénormalisé, mis à jour par trigger.';


-- ---------------------------------------------------------------------------
-- 3.8 COMMENTAIRE
--     Précisions courtes, questions de clarification ou remarques.
--     Un commentaire cible SOIT une question, SOIT une réponse.
-- ---------------------------------------------------------------------------
CREATE TABLE commentaire (
    id            SERIAL      PRIMARY KEY,
    auteur_id     INT         NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    contenu       TEXT        NOT NULL,
    question_id   INT         REFERENCES question(id) ON DELETE CASCADE,
    reponse_id    INT         REFERENCES reponse(id)  ON DELETE CASCADE,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Un commentaire doit référencer exactement une cible (XOR logique)
    CONSTRAINT ck_commentaire_cible_unique
        CHECK (
            (question_id IS NOT NULL AND reponse_id IS NULL)
            OR
            (question_id IS NULL AND reponse_id IS NOT NULL)
        )
);

COMMENT ON TABLE  commentaire            IS 'Commentaires courts sur une question ou une réponse (jamais les deux).';
COMMENT ON COLUMN commentaire.question_id IS 'Cible question. Mutuellement exclusif avec reponse_id (CHECK constraint).';
COMMENT ON COLUMN commentaire.reponse_id  IS 'Cible réponse. Mutuellement exclusif avec question_id (CHECK constraint).';


-- ---------------------------------------------------------------------------
-- 3.9 VOTE
--     Upvotes (+1) et downvotes (-1) sur les réponses.
--     L'unicité (utilisateur, réponse) empêche le vote multiple (anti-abus).
-- ---------------------------------------------------------------------------
CREATE TABLE vote (
    id              SERIAL      PRIMARY KEY,
    utilisateur_id  INT         NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    reponse_id      INT         NOT NULL REFERENCES reponse(id)     ON DELETE CASCADE,
    valeur          SMALLINT    NOT NULL CHECK (valeur IN (1, -1)),
    date_vote       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Anti-abus : un utilisateur = un vote par réponse
    CONSTRAINT uq_vote_unique_par_utilisateur_reponse
        UNIQUE (utilisateur_id, reponse_id)
);

COMMENT ON TABLE  vote           IS 'Votes +1/-1 sur les réponses. Unicité garantie (anti-abus multi-vote).';
COMMENT ON COLUMN vote.valeur    IS '+1 = upvote (utile) | -1 = downvote (incorrect ou peu utile).';


-- ---------------------------------------------------------------------------
-- 3.10 PIECE_JOINTE
--      Fichiers attachés à une question ou une réponse.
--      Stockage sur Cloudinary, seule l'URL est persistée ici.
-- ---------------------------------------------------------------------------
CREATE TABLE piece_jointe (
    id              SERIAL      PRIMARY KEY,
    question_id     INT         REFERENCES question(id) ON DELETE CASCADE,
    reponse_id      INT         REFERENCES reponse(id)  ON DELETE CASCADE,
    cloudinary_url  TEXT        NOT NULL,
    public_id       TEXT,               -- ID Cloudinary pour suppression future
    type_fichier    VARCHAR(20),        -- 'image', 'pdf'
    taille_octets   INT,
    date_upload     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Une pièce jointe doit référencer au moins une cible
    CONSTRAINT ck_pj_cible
        CHECK (question_id IS NOT NULL OR reponse_id IS NOT NULL)
);

COMMENT ON TABLE  piece_jointe            IS 'Métadonnées des pièces jointes. Les fichiers sont hébergés sur Cloudinary.';
COMMENT ON COLUMN piece_jointe.public_id  IS 'Identifiant Cloudinary pour permettre la suppression côté API.';


-- ---------------------------------------------------------------------------
-- 3.11 BADGE
--      Définition des badges attribuables (gamification).
--      Logique d'attribution déportée dans le backend ou triggers.
-- ---------------------------------------------------------------------------
CREATE TABLE badge (
    id               SERIAL      PRIMARY KEY,
    nom              VARCHAR(80) NOT NULL UNIQUE,
    description      TEXT,
    icone_url        TEXT,
    -- condition_type : 'xp_total', 'reponses_acceptees', 'votes_recus', 'questions_publiees'
    condition_type   VARCHAR(60),
    condition_valeur INT          CHECK (condition_valeur > 0)
);

COMMENT ON TABLE  badge                  IS 'Catalogue des badges décernés pour la gamification.';
COMMENT ON COLUMN badge.condition_type   IS 'Métrique évaluée : xp_total, reponses_acceptees, votes_recus, etc.';
COMMENT ON COLUMN badge.condition_valeur IS 'Seuil numérique déclenchant l''attribution du badge.';


-- ---------------------------------------------------------------------------
-- 3.12 UTILISATEUR_BADGE
--      Association N:M — badges détenus par un utilisateur.
-- ---------------------------------------------------------------------------
CREATE TABLE utilisateur_badge (
    utilisateur_id  INT         NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    badge_id        INT         NOT NULL REFERENCES badge(id)       ON DELETE CASCADE,
    date_obtention  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (utilisateur_id, badge_id)
);

COMMENT ON TABLE utilisateur_badge IS 'Badges obtenus par un utilisateur avec date d''attribution.';


-- ---------------------------------------------------------------------------
-- 3.13 NOTIFICATION
--      Journal des notifications in-app.
--      Distribuées en temps réel via WebSockets (lecture asynchrone).
-- ---------------------------------------------------------------------------
CREATE TABLE notification (
    id              SERIAL                  PRIMARY KEY,
    destinataire_id INT                     NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    type            type_notification_enum  NOT NULL,
    question_id     INT                     REFERENCES question(id) ON DELETE CASCADE,
    reponse_id      INT                     REFERENCES reponse(id)  ON DELETE CASCADE,
    contenu         TEXT,                   -- Message lisible (ex: "Pierre a répondu à votre question")
    est_lue         BOOLEAN                 NOT NULL DEFAULT FALSE,
    date_creation   TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notification              IS 'Notifications in-app. Transmises en temps réel (WebSocket), persistées ici.';
COMMENT ON COLUMN notification.est_lue      IS 'FALSE = non lue (badge rouge). Basculé à TRUE à la consultation.';
COMMENT ON COLUMN notification.question_id  IS 'Lien vers la question concernée (peut être NULL selon le type).';


-- =============================================================================
-- 4. INDEX DE PERFORMANCE
--    Stratégie : index sur toutes les FK fréquemment jointes,
--    index partiels pour les cas d'usage précis (réponses acceptées, notifs non lues).
-- =============================================================================

-- ---- QUESTION ---------------------------------------------------------------
-- Récupérer toutes les questions d'un utilisateur (profil public, "Mes questions")
CREATE INDEX idx_question_auteur
    ON question(auteur_id);

-- Filtrer le feed par matière
CREATE INDEX idx_question_matiere
    ON question(matiere_id);

-- Feed chronologique des questions ouvertes (tri DESC le plus courant)
CREATE INDEX idx_question_statut_date
    ON question(statut, date_creation DESC);

-- Recherche full-text : index GIN sur le vecteur tsvector
CREATE INDEX idx_question_search_vector
    ON question USING GIN(search_vector);

-- Détection de doublons par similarité de titre (pg_trgm)
CREATE INDEX idx_question_titre_trgm
    ON question USING GIN(titre gin_trgm_ops);

-- ---- REPONSE ----------------------------------------------------------------
-- Charger toutes les réponses d'une question (page de détail)
CREATE INDEX idx_reponse_question
    ON reponse(question_id);

-- Index partiel : récupérer la réponse acceptée immédiatement
CREATE INDEX idx_reponse_acceptee
    ON reponse(question_id)
    WHERE est_acceptee = TRUE;

-- Réponses d'un utilisateur (profil)
CREATE INDEX idx_reponse_auteur
    ON reponse(auteur_id);

-- ---- VOTE -------------------------------------------------------------------
-- Score agrégé par réponse (stats, tri par pertinence)
CREATE INDEX idx_vote_reponse
    ON vote(reponse_id);

-- Vérifier si un utilisateur a déjà voté sur une réponse (UX temps réel)
CREATE INDEX idx_vote_utilisateur
    ON vote(utilisateur_id, reponse_id);

-- ---- COMMENTAIRE ------------------------------------------------------------
-- Commentaires d'une question
CREATE INDEX idx_commentaire_question
    ON commentaire(question_id)
    WHERE question_id IS NOT NULL;

-- Commentaires d'une réponse
CREATE INDEX idx_commentaire_reponse
    ON commentaire(reponse_id)
    WHERE reponse_id IS NOT NULL;

-- ---- NOTIFICATION -----------------------------------------------------------
-- Notifs non lues d'un utilisateur (badge compteur header)
CREATE INDEX idx_notification_destinataire_nonlue
    ON notification(destinataire_id, date_creation DESC)
    WHERE est_lue = FALSE;

-- ---- QUESTION_TAG -----------------------------------------------------------
-- Questions par tag (page tag publique)
CREATE INDEX idx_question_tag_tag
    ON question_tag(tag_id);

-- ---- UTILISATEUR ------------------------------------------------------------
-- Authentification par email (requête la plus fréquente du backend)
CREATE INDEX idx_utilisateur_email
    ON utilisateur(email);

-- Lookup par pseudo (profil public)
CREATE INDEX idx_utilisateur_pseudo
    ON utilisateur(pseudo);


-- =============================================================================
-- 5. FONCTIONS & TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 5.1  fn_update_search_vector
--      Maintient à jour la colonne tsvector de QUESTION.
--      Appelé automatiquement à chaque INSERT ou UPDATE.
--
--      Configuration linguistique :
--        - 'french' pour la stemmatisation (résoudre → résolu)
--        - unaccent() pour normaliser les accents
--      Pondération :
--        'A' (poids fort)  → titre
--        'B' (poids moyen) → description
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('french', unaccent(COALESCE(NEW.titre, ''))),       'A') ||
        setweight(to_tsvector('french', unaccent(COALESCE(NEW.description, ''))), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_update_search_vector IS
    'Met à jour search_vector à chaque INSERT/UPDATE sur question. Pondère titre (A) > description (B).';

CREATE TRIGGER tg_question_search_vector
    BEFORE INSERT OR UPDATE OF titre, description
    ON question
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_search_vector();

COMMENT ON TRIGGER tg_question_search_vector ON question IS
    'Déclenche fn_update_search_vector avant tout INSERT ou modification de titre/description.';


-- ---------------------------------------------------------------------------
-- 5.2  fn_update_score_votes
--      Recalcule le score dénormalisé de REPONSE après chaque INSERT,
--      UPDATE ou DELETE dans la table VOTE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_score_votes()
RETURNS TRIGGER AS $$
DECLARE
    v_reponse_id INT;
BEGIN
    -- Déterminer l'ID de la réponse affectée
    IF TG_OP = 'DELETE' THEN
        v_reponse_id := OLD.reponse_id;
    ELSE
        v_reponse_id := NEW.reponse_id;
    END IF;

    UPDATE reponse
    SET score_votes = (
        SELECT COALESCE(SUM(valeur), 0)
        FROM   vote
        WHERE  reponse_id = v_reponse_id
    )
    WHERE id = v_reponse_id;

    RETURN NULL; -- AFTER trigger : valeur de retour ignorée
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_update_score_votes IS
    'Recalcule reponse.score_votes après chaque modification dans la table vote.';

CREATE TRIGGER tg_vote_update_score
    AFTER INSERT OR UPDATE OR DELETE
    ON vote
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_score_votes();


-- ---------------------------------------------------------------------------
-- 5.3  fn_attribution_xp
--      Gère l'attribution de points XP à la suite des événements de gamification.
--
--      Barème :
--        +5  XP — Publication d'une question
--        +10 XP — Publication d'une réponse
--        +2  XP — Upvote reçu sur une réponse
--        +50 XP — Réponse marquée comme solution acceptée (auteur réponse)
--        +10 XP — Question résolue (auteur question)
--
--      Niveau de confiance — progression automatique :
--        100  XP → niveau 2
--        300  XP → niveau 3
--        700  XP → niveau 4
--        1500 XP → niveau 5
--        3000 XP → niveau 6
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_attribution_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_auteur_question_id INT;
    v_auteur_reponse_id  INT;
    v_xp_actuel          INT;
BEGIN

    -- ---- Cas 1 : Nouvelle question publiée ----
    IF TG_TABLE_NAME = 'question' AND TG_OP = 'INSERT' THEN
        UPDATE utilisateur
        SET points_xp = points_xp + 5
        WHERE id = NEW.auteur_id;

    -- ---- Cas 2 : Nouvelle réponse publiée ----
    ELSIF TG_TABLE_NAME = 'reponse' AND TG_OP = 'INSERT' THEN
        UPDATE utilisateur
        SET points_xp = points_xp + 10
        WHERE id = NEW.auteur_id;

    -- ---- Cas 3 : Réponse marquée acceptée ----
    ELSIF TG_TABLE_NAME = 'reponse' AND TG_OP = 'UPDATE'
          AND OLD.est_acceptee = FALSE AND NEW.est_acceptee = TRUE THEN

        -- Bonus pour l'auteur de la réponse acceptée
        UPDATE utilisateur
        SET points_xp = points_xp + 50
        WHERE id = NEW.auteur_id;

        -- Bonus pour l'auteur de la question résolue
        SELECT auteur_id INTO v_auteur_question_id
        FROM question WHERE id = NEW.question_id;

        UPDATE utilisateur
        SET points_xp = points_xp + 10
        WHERE id = v_auteur_question_id;

        -- Fermer la question automatiquement
        UPDATE question
        SET statut = 'resolu'
        WHERE id = NEW.question_id;

    -- ---- Cas 4 : Upvote reçu ----
    ELSIF TG_TABLE_NAME = 'vote' AND TG_OP = 'INSERT' AND NEW.valeur = 1 THEN

        SELECT auteur_id INTO v_auteur_reponse_id
        FROM reponse WHERE id = NEW.reponse_id;

        UPDATE utilisateur
        SET points_xp = points_xp + 2
        WHERE id = v_auteur_reponse_id;

    -- ---- Cas 5 : Annulation d'upvote (perte XP) ----
    ELSIF TG_TABLE_NAME = 'vote' AND TG_OP = 'DELETE' AND OLD.valeur = 1 THEN

        SELECT auteur_id INTO v_auteur_reponse_id
        FROM reponse WHERE id = OLD.reponse_id;

        UPDATE utilisateur
        SET points_xp = GREATEST(0, points_xp - 2)
        WHERE id = v_auteur_reponse_id;
    END IF;

    -- ---- Recalcul du niveau de confiance ----
    -- Applicable à l'auteur impacté (simplifié : recalcul global si INSERT/UPDATE)
    UPDATE utilisateur
    SET niveau_confiance = CASE
        WHEN points_xp >= 3000 THEN 6
        WHEN points_xp >= 1500 THEN 5
        WHEN points_xp >= 700  THEN 4
        WHEN points_xp >= 300  THEN 3
        WHEN points_xp >= 100  THEN 2
        ELSE 1
    END
    WHERE id IN (
        SELECT auteur_id FROM question WHERE id = COALESCE(NEW.id, OLD.id) LIMIT 1
        UNION
        SELECT auteur_id FROM reponse  WHERE id = COALESCE(NEW.id, OLD.id) LIMIT 1
        UNION
        SELECT COALESCE(NEW.utilisateur_id, OLD.utilisateur_id)
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_attribution_xp IS
    'Attribution de points XP suite aux actions utilisateur. Met aussi à jour le niveau_confiance.';

-- Trigger sur QUESTION (nouvelle publication)
CREATE TRIGGER tg_question_xp
    AFTER INSERT ON question
    FOR EACH ROW EXECUTE FUNCTION fn_attribution_xp();

-- Trigger sur REPONSE (nouvelle réponse + marquage accepté)
CREATE TRIGGER tg_reponse_xp
    AFTER INSERT OR UPDATE OF est_acceptee ON reponse
    FOR EACH ROW EXECUTE FUNCTION fn_attribution_xp();

-- Trigger sur VOTE (upvote/annulation)
CREATE TRIGGER tg_vote_xp
    AFTER INSERT OR DELETE ON vote
    FOR EACH ROW EXECUTE FUNCTION fn_attribution_xp();


-- ---------------------------------------------------------------------------
-- 5.4  fn_update_tag_count
--      Met à jour le compteur nb_utilisations d'un tag
--      quand il est associé ou dissocié d'une question.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_tag_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tag SET nb_utilisations = nb_utilisations + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tag SET nb_utilisations = GREATEST(0, nb_utilisations - 1) WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_question_tag_count
    AFTER INSERT OR DELETE ON question_tag
    FOR EACH ROW EXECUTE FUNCTION fn_update_tag_count();

COMMENT ON TRIGGER tg_question_tag_count ON question_tag IS
    'Maintient tag.nb_utilisations en synchronisation avec les associations question_tag.';


-- ---------------------------------------------------------------------------
-- 5.5  fn_set_date_modification
--      Met à jour automatiquement la colonne date_modification
--      sur QUESTION et REPONSE lors d'un UPDATE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_date_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_question_date_modif
    BEFORE UPDATE ON question
    FOR EACH ROW EXECUTE FUNCTION fn_set_date_modification();

CREATE TRIGGER tg_reponse_date_modif
    BEFORE UPDATE ON reponse
    FOR EACH ROW EXECUTE FUNCTION fn_set_date_modification();

COMMENT ON FUNCTION fn_set_date_modification IS
    'Horodatage automatique de date_modification avant chaque UPDATE.';


-- =============================================================================
-- 6. VUES UTILITAIRES
--    Simplifient les requêtes courantes du backend (ORM ou raw queries).
-- =============================================================================

-- Vue : liste enrichie des questions pour le feed principal
CREATE OR REPLACE VIEW v_feed_questions AS
SELECT
    q.id,
    q.titre,
    q.type_contenu,
    q.statut,
    q.nb_vues,
    q.date_creation,
    q.niveau_etudes,
    u.pseudo          AS auteur_pseudo,
    u.avatar_url      AS auteur_avatar,
    u.niveau_confiance AS auteur_niveau,
    m.nom             AS matiere_nom,
    m.icone           AS matiere_icone,
    COUNT(DISTINCT r.id) AS nb_reponses,
    COUNT(DISTINCT c.id) AS nb_commentaires,
    ARRAY_AGG(DISTINCT t.nom) FILTER (WHERE t.nom IS NOT NULL) AS tags
FROM question q
JOIN utilisateur u        ON u.id = q.auteur_id
LEFT JOIN matiere m       ON m.id = q.matiere_id
LEFT JOIN reponse r       ON r.question_id = q.id
LEFT JOIN commentaire c   ON c.question_id = q.id
LEFT JOIN question_tag qt ON qt.question_id = q.id
LEFT JOIN tag t           ON t.id = qt.tag_id
GROUP BY q.id, u.pseudo, u.avatar_url, u.niveau_confiance, m.nom, m.icone;

COMMENT ON VIEW v_feed_questions IS
    'Agrégat enrichi pour le feed principal : auteur, matière, compteurs, tags.';


-- Vue : profil public d'un utilisateur (statistiques gamification)
CREATE OR REPLACE VIEW v_profil_utilisateur AS
SELECT
    u.id,
    u.pseudo,
    u.nom,
    u.prenom,
    u.avatar_url,
    u.bio,
    u.niveau_etudes,
    u.points_xp,
    u.niveau_confiance,
    u.date_inscription,
    COUNT(DISTINCT q.id)                                           AS nb_questions,
    COUNT(DISTINCT r.id)                                           AS nb_reponses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.est_acceptee = TRUE)     AS nb_solutions_acceptees,
    COALESCE(SUM(r.score_votes), 0)                               AS score_total_votes,
    ARRAY_AGG(DISTINCT b.nom) FILTER (WHERE b.nom IS NOT NULL)    AS badges
FROM utilisateur u
LEFT JOIN question        q  ON q.auteur_id  = u.id
LEFT JOIN reponse         r  ON r.auteur_id  = u.id
LEFT JOIN utilisateur_badge ub ON ub.utilisateur_id = u.id
LEFT JOIN badge            b  ON b.id = ub.badge_id
GROUP BY u.id;

COMMENT ON VIEW v_profil_utilisateur IS
    'Statistiques complètes pour la page profil publique d''un utilisateur.';


-- Vue : compteur de notifications non lues (pour le header)
CREATE OR REPLACE VIEW v_notifs_non_lues AS
SELECT
    destinataire_id AS utilisateur_id,
    COUNT(*)        AS nb_non_lues
FROM notification
WHERE est_lue = FALSE
GROUP BY destinataire_id;

COMMENT ON VIEW v_notifs_non_lues IS
    'Compteur de notifications non lues par utilisateur. Requête légère pour le badge header.';


-- =============================================================================
-- 7. CONTRAINTES SUPPLÉMENTAIRES
-- =============================================================================

-- Un utilisateur ne peut pas voter pour sa propre réponse
ALTER TABLE vote
    ADD CONSTRAINT ck_vote_pas_autovote
    CHECK (
        utilisateur_id != (
            SELECT auteur_id FROM reponse WHERE id = reponse_id
        )
    );

-- DÉSACTIVÉ EN PRODUCTION (coûteux) — utiliser une validation côté backend
-- Si activé, s'assurer d'un index couvrant.
-- ALTER TABLE vote DROP CONSTRAINT IF EXISTS ck_vote_pas_autovote;


-- =============================================================================
-- 8. DONNÉES INITIALES (SEEDS)
--    Pré-remplissage des tables de référence.
-- =============================================================================

-- ---- Matières ---------------------------------------------------------------
INSERT INTO matiere (nom, domaine, icone) VALUES
    ('Mathématiques',        'Sciences formelles',  '🧮'),
    ('Algorithmique',        'Informatique',         '🔢'),
    ('Programmation',        'Informatique',         '💻'),
    ('Bases de données',     'Informatique',         '🗄️'),
    ('Réseaux',              'Informatique',         '🌐'),
    ('Systèmes d''exploitation', 'Informatique',     '🖥️'),
    ('Génie logiciel',       'Informatique',         '⚙️'),
    ('Électronique',         'Sciences de l''ingénieur', '⚡'),
    ('Physique',             'Sciences fondamentales', '🔭'),
    ('Chimie',               'Sciences fondamentales', '🧪'),
    ('Automatique',          'Sciences de l''ingénieur', '🤖'),
    ('Signaux & Systèmes',   'Sciences de l''ingénieur', '📡'),
    ('Économie',             'Sciences humaines',    '📈'),
    ('Anglais technique',    'Langues',              '🇬🇧')
ON CONFLICT (nom) DO NOTHING;

-- ---- Tags -------------------------------------------------------------------
INSERT INTO tag (nom, description) VALUES
    ('Python',         'Langage Python (3.x)'),
    ('C',              'Langage C'),
    ('C++',            'Langage C++'),
    ('Java',           'Langage Java'),
    ('JavaScript',     'Langage JavaScript / Node.js'),
    ('SQL',            'Requêtes SQL et modélisation'),
    ('Algèbre',        'Algèbre linéaire, matrices'),
    ('Analyse',        'Analyse réelle et complexe'),
    ('Probabilités',   'Probabilités et statistiques'),
    ('Graphes',        'Théorie des graphes'),
    ('TCP/IP',         'Protocoles réseau'),
    ('UML',            'Modélisation UML'),
    ('Linux',          'Systèmes GNU/Linux'),
    ('Docker',         'Conteneurisation Docker'),
    ('Complexité',     'Complexité algorithmique'),
    ('Récursivité',    'Algorithmes récursifs'),
    ('Tri',            'Algorithmes de tri'),
    ('Pointeurs',      'Gestion mémoire / pointeurs'),
    ('Intégrale',      'Calcul intégral'),
    ('Dérivée',        'Calcul différentiel')
ON CONFLICT (nom) DO NOTHING;

-- ---- Badges -----------------------------------------------------------------
INSERT INTO badge (nom, description, icone_url, condition_type, condition_valeur) VALUES
    ('Nouveau membre',        'Bienvenue sur la plateforme !',            '🎉', NULL,                  NULL),
    ('Première réponse',      'Vous avez posté votre première réponse.',  '✍️', 'nb_reponses',          1),
    ('Helper',                '10 réponses postées.',                     '🤝', 'nb_reponses',          10),
    ('Expert confirmé',       '50 réponses postées.',                     '🏆', 'nb_reponses',          50),
    ('Solution validée',      'Votre première réponse acceptée.',         '✅', 'nb_solutions_acceptees', 1),
    ('100 solutions',         '100 réponses acceptées.',                  '🌟', 'nb_solutions_acceptees', 100),
    ('Populaire',             '50 upvotes reçus.',                        '👍', 'votes_recus',          50),
    ('Encyclopédie',          '500 upvotes reçus.',                       '📚', 'votes_recus',          500),
    ('Chercheur assidu',      '20 questions publiées.',                   '🔍', 'nb_questions',         20),
    ('Elite',                 '1000 XP accumulés.',                       '💎', 'xp_total',             1000),
    ('Légende',               '5000 XP accumulés.',                       '⚡', 'xp_total',             5000)
ON CONFLICT (nom) DO NOTHING;


-- =============================================================================
-- 9. CONFIGURATION FULL-TEXT SEARCH
--    Création d'une configuration française personnalisée
--    intégrant le dictionnaire unaccent.
-- =============================================================================

-- Créer un dictionnaire unaccent+french combiné
CREATE TEXT SEARCH DICTIONARY french_unaccent (
    TEMPLATE  = ispell,
    DictFile  = french,
    AffFile   = french,
    StopWords = french,
    FilesDir  = '/usr/share/postgresql/tsearch_data'
) ;

-- NOTE : Si le dictionnaire ispell/french n'est pas disponible,
-- utiliser la configuration simple :
-- CREATE TEXT SEARCH CONFIGURATION french_custom (COPY = pg_catalog.french);
-- ALTER  TEXT SEARCH CONFIGURATION french_custom
--   ALTER MAPPING FOR hword, hword_part, word WITH unaccent, french_stem;

-- Mise à jour manuelle du search_vector pour les données seeds (si besoin)
-- UPDATE question SET search_vector = DEFAULT;


-- =============================================================================
-- 10. RÉSUMÉ FINAL
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '===========================================================';
    RAISE NOTICE '  Schéma BDD — Plateforme d''Entraide Académique v1.0';
    RAISE NOTICE '  Tables    : 13';
    RAISE NOTICE '  Triggers  : 7';
    RAISE NOTICE '  Index     : 14';
    RAISE NOTICE '  Vues      : 3';
    RAISE NOTICE '  Seeds     : matières (14), tags (20), badges (11)';
    RAISE NOTICE '===========================================================';
END $$;
