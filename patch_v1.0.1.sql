-- =============================================================================
--  PATCH v1.0.1 — Corrections post-déploiement Render (PostgreSQL 18)
--  Erreur 1 : Sous-requête interdite dans CHECK constraint → trigger
--  Erreur 2 : Dictionnaire ispell/french manquant → configuration simple
-- =============================================================================


-- =============================================================================
-- FIX 1 : Anti-auto-vote
-- Problème  : PostgreSQL n'autorise pas les sous-requêtes dans CHECK CONSTRAINT
-- Solution  : Trigger BEFORE INSERT OR UPDATE qui lève une exception
-- =============================================================================

-- Supprimer la contrainte invalide si elle a été partiellement créée
ALTER TABLE vote DROP CONSTRAINT IF EXISTS ck_vote_pas_autovote;

-- Fonction trigger : rejette le vote si l'utilisateur est l'auteur de la réponse
CREATE OR REPLACE FUNCTION fn_prevent_self_vote()
RETURNS TRIGGER AS $$
DECLARE
    v_auteur_id INT;
BEGIN
    SELECT auteur_id INTO v_auteur_id
    FROM reponse
    WHERE id = NEW.reponse_id;

    IF NEW.utilisateur_id = v_auteur_id THEN
        RAISE EXCEPTION 'Interdit : un utilisateur ne peut pas voter pour sa propre réponse.'
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_vote_prevent_self
    BEFORE INSERT OR UPDATE ON vote
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_self_vote();

COMMENT ON TRIGGER tg_vote_prevent_self ON vote IS
    'Empêche l''auto-vote : lève une exception si utilisateur_id = auteur de la réponse.';


-- =============================================================================
-- FIX 2 : Configuration Full-Text Search sans dictionnaire ispell
-- Problème  : Le dictionnaire french.dict n''est pas installé sur Render
-- Solution  : Créer une configuration personnalisée avec french_stem + unaccent
-- =============================================================================

-- Supprimer la config partielle si elle existe
DROP TEXT SEARCH CONFIGURATION IF EXISTS french_custom CASCADE;
DROP TEXT SEARCH DICTIONARY IF EXISTS french_unaccent CASCADE;

-- Créer la configuration en copiant la config française de base
CREATE TEXT SEARCH CONFIGURATION french_custom (COPY = pg_catalog.french);

-- Remplacer le mapping des tokens texte pour utiliser unaccent + french_stem
ALTER TEXT SEARCH CONFIGURATION french_custom
    ALTER MAPPING FOR hword, hword_part, word
    WITH unaccent, french_stem;

COMMENT ON TEXT SEARCH CONFIGURATION french_custom IS
    'Config full-text française avec normalisation des accents (unaccent + french_stem).';

-- Mettre à jour le trigger search_vector pour utiliser french_custom
CREATE OR REPLACE FUNCTION fn_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('french_custom', COALESCE(NEW.titre, '')),       'A') ||
        setweight(to_tsvector('french_custom', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_update_search_vector IS
    'search_vector maintenu via french_custom (unaccent + french_stem). Sans dépendance ispell.';

-- Reconstruire les search_vectors existants (si des données avaient été insérées)
UPDATE question SET search_vector =
    setweight(to_tsvector('french_custom', COALESCE(titre, '')),       'A') ||
    setweight(to_tsvector('french_custom', COALESCE(description, '')), 'B');


-- =============================================================================
-- VÉRIFICATION
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '  PATCH v1.0.1 appliqué avec succès';
    RAISE NOTICE '  ✔ Trigger anti-auto-vote installé';
    RAISE NOTICE '  ✔ Config FTS french_custom créée';
    RAISE NOTICE '  ✔ Trigger search_vector mis à jour';
    RAISE NOTICE '==============================================';
END $$;
