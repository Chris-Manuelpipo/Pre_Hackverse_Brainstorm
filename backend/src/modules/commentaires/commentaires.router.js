const router = require('express').Router();
const db     = require('../../config/database');
const { authenticate, requireOwnership } = require('../../middleware/auth');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const { emitToUser } = require('../../socket');

const validContenu = body('contenu').trim()
  .isLength({ min: 2, max: 1000 })
  .withMessage('Le commentaire doit faire entre 2 et 1000 caractères.');

// ── POST /api/commentaires/question/:questionId ──────────────────────────────
// Commenter une question
router.post('/question/:questionId',
  authenticate,
  validContenu,
  validate,
  async (req, res) => {
    const { rows } = await db.query(
      `INSERT INTO commentaire (auteur_id, contenu, question_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, req.body.contenu, req.params.questionId]
    );

    // Notifier l'auteur de la question
    const q = await db.query('SELECT auteur_id FROM question WHERE id = $1', [req.params.questionId]);
    if (q.rows[0] && q.rows[0].auteur_id !== req.user.id) {
      const notif = await db.query(
        `INSERT INTO notification (destinataire_id, type, question_id, contenu)
         VALUES ($1, 'commentaire', $2, 'Nouveau commentaire sur votre question.')
         RETURNING *`,
        [q.rows[0].auteur_id, req.params.questionId]
      );
      emitToUser(q.rows[0].auteur_id, 'notification:new', notif.rows[0]);
    }

    res.status(201).json(rows[0]);
  }
);

// ── POST /api/commentaires/reponse/:reponseId ────────────────────────────────
// Commenter une réponse
router.post('/reponse/:reponseId',
  authenticate,
  validContenu,
  validate,
  async (req, res) => {
    const { rows } = await db.query(
      `INSERT INTO commentaire (auteur_id, contenu, reponse_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, req.body.contenu, req.params.reponseId]
    );

    // Notifier l'auteur de la réponse
    const r = await db.query('SELECT auteur_id FROM reponse WHERE id = $1', [req.params.reponseId]);
    if (r.rows[0] && r.rows[0].auteur_id !== req.user.id) {
      const notif = await db.query(
        `INSERT INTO notification (destinataire_id, type, reponse_id, contenu)
         VALUES ($1, 'commentaire', $2, 'Nouveau commentaire sur votre réponse.')
         RETURNING *`,
        [r.rows[0].auteur_id, req.params.reponseId]
      );
      emitToUser(r.rows[0].auteur_id, 'notification:new', notif.rows[0]);
    }

    res.status(201).json(rows[0]);
  }
);

// ── GET /api/commentaires/question/:questionId ───────────────────────────────
// Commentaires d'une question
router.get('/question/:questionId', async (req, res) => {
  const { rows } = await db.query(
    `SELECT c.*, u.pseudo AS auteur_pseudo, u.avatar_url AS auteur_avatar
     FROM commentaire c
     JOIN utilisateur u ON u.id = c.auteur_id
     WHERE c.question_id = $1
     ORDER BY c.date_creation ASC`,
    [req.params.questionId]
  );
  res.json(rows);
});

// ── GET /api/commentaires/reponse/:reponseId ─────────────────────────────────
// Commentaires d'une réponse
router.get('/reponse/:reponseId', async (req, res) => {
  const { rows } = await db.query(
    `SELECT c.*, u.pseudo AS auteur_pseudo, u.avatar_url AS auteur_avatar
     FROM commentaire c
     JOIN utilisateur u ON u.id = c.auteur_id
     WHERE c.reponse_id = $1
     ORDER BY c.date_creation ASC`,
    [req.params.reponseId]
  );
  res.json(rows);
});

// ── DELETE /api/commentaires/:id ─────────────────────────────────────────────
// Supprimer son commentaire
router.delete('/:id',
  authenticate,
  requireOwnership(async req => {
    const { rows } = await db.query('SELECT auteur_id FROM commentaire WHERE id = $1', [req.params.id]);
    return rows[0]?.auteur_id;
  }),
  async (req, res) => {
    await db.query('DELETE FROM commentaire WHERE id = $1', [req.params.id]);
    res.status(204).end();
  }
);

module.exports = router;
