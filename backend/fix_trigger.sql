-- Correction du trigger fn_attribution_xp v2
-- Problèmes corrigés:
-- 1. UNION dans sous-requête IN -> ARRAY
-- 2. OLD n'existe pas en INSERT (ajout condition TG_OP)

CREATE OR REPLACE FUNCTION fn_attribution_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_auteur_question_id INT;
    v_auteur_reponse_id  INT;
    v_auteurs_ids       INT[];
BEGIN
    v_auteurs_ids := ARRAY[]::INT[];

    -- ---- Cas 1 : Nouvelle question publiée ----
    IF TG_TABLE_NAME = 'question' AND TG_OP = 'INSERT' THEN
        UPDATE utilisateur
        SET points_xp = points_xp + 5
        WHERE id = NEW.auteur_id;
        v_auteurs_ids := ARRAY[NEW.auteur_id];

    -- ---- Cas 2 : Nouvelle réponse publiée ----
    ELSIF TG_TABLE_NAME = 'reponse' AND TG_OP = 'INSERT' THEN
        UPDATE utilisateur
        SET points_xp = points_xp + 10
        WHERE id = NEW.auteur_id;
        v_auteurs_ids := ARRAY[NEW.auteur_id];

    -- ---- Cas 3 : Réponse marquée acceptée ----
    ELSIF TG_TABLE_NAME = 'reponse' AND TG_OP = 'UPDATE' THEN
        IF OLD.est_acceptee = FALSE AND NEW.est_acceptee = TRUE THEN
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

            v_auteurs_ids := ARRAY[NEW.auteur_id, v_auteur_question_id];
        END IF;

    -- ---- Cas 4 : Upvote reçu ----
    ELSIF TG_TABLE_NAME = 'vote' AND TG_OP = 'INSERT' AND NEW.valeur = 1 THEN
        SELECT auteur_id INTO v_auteur_reponse_id
        FROM reponse WHERE id = NEW.reponse_id;

        UPDATE utilisateur
        SET points_xp = points_xp + 2
        WHERE id = v_auteur_reponse_id;

        v_auteurs_ids := ARRAY[v_auteur_reponse_id];

    -- ---- Cas 5 : Annulation d'upvote (perte XP) ----
    ELSIF TG_TABLE_NAME = 'vote' AND TG_OP = 'DELETE' AND OLD.valeur = 1 THEN
        SELECT auteur_id INTO v_auteur_reponse_id
        FROM reponse WHERE id = OLD.reponse_id;

        UPDATE utilisateur
        SET points_xp = GREATEST(0, points_xp - 2)
        WHERE id = v_auteur_reponse_id;

        v_auteurs_ids := ARRAY[v_auteur_reponse_id];
    END IF;

    -- ---- Recalcul du niveau de confiance ----
    IF array_length(v_auteurs_ids, 1) > 0 THEN
        UPDATE utilisateur
        SET niveau_confiance = CASE
            WHEN points_xp >= 3000 THEN 6
            WHEN points_xp >= 1500 THEN 5
            WHEN points_xp >= 700  THEN 4
            WHEN points_xp >= 300  THEN 3
            WHEN points_xp >= 100  THEN 2
            ELSE 1
        END
        WHERE id = ANY(v_auteurs_ids);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;