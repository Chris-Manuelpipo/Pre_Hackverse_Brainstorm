-- =============================================================================
-- SCRIPT DE NETTOYAGE — Suppression complète du schéma
-- =============================================================================

-- Supprimer toutes les vues
DROP VIEW IF EXISTS v_feed_questions CASCADE;
DROP VIEW IF EXISTS v_profil_utilisateur CASCADE;
DROP VIEW IF EXISTS v_notifs_non_lues CASCADE;

-- Supprimer toutes les tables (CASCADE supprime aussi les triggers/FK)
DROP TABLE IF EXISTS utilisateur_badge CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS badge CASCADE;
DROP TABLE IF EXISTS piece_jointe CASCADE;
DROP TABLE IF EXISTS vote CASCADE;
DROP TABLE IF EXISTS commentaire CASCADE;
DROP TABLE IF EXISTS question_tag CASCADE;
DROP TABLE IF EXISTS reponse CASCADE;
DROP TABLE IF EXISTS question CASCADE;
DROP TABLE IF EXISTS utilisateur_matiere CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;
DROP TABLE IF EXISTS tag CASCADE;
DROP TABLE IF EXISTS matiere CASCADE;

-- Supprimer tous les types enum
DROP TYPE IF EXISTS type_contenu_enum CASCADE;
DROP TYPE IF EXISTS statut_question_enum CASCADE;
DROP TYPE IF EXISTS type_notification_enum CASCADE;
DROP TYPE IF EXISTS provider_sso_enum CASCADE;

-- Supprimer tous les dictionnaires de texte search (si existants)
DROP TEXT SEARCH DICTIONARY IF EXISTS french_unaccent CASCADE;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Base de données nettoyée avec succès !';
    RAISE NOTICE '   Vous pouvez maintenant réexécuter schema_bdd_entraide.sql';
END $$;
