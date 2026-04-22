const router  = require('express').Router();
const service = require('./reponses.service');
const db      = require('../../config/database');
const { authenticate, requireOwnership } = require('../../middleware/auth');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');

// ── GET /api/reponses/question/:questionId ───────────────────────────────────
// Toutes les réponses d'une question (public, vote de l'user si connecté)
router.get('/question/:questionId', async (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = null;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {}
  }
  res.json(await service.findByQuestion(req.params.questionId, userId));
});

// ── POST /api/reponses/question/:questionId ──────────────────────────────────
// Poster une réponse
router.post('/question/:questionId',
  authenticate,
  body('contenu').trim().isLength({ min: 10 }).withMessage('La réponse doit faire au moins 10 caractères.'),
  validate,
  async (req, res) => {
    res.status(201).json(await service.create({
      question_id: req.params.questionId,
      auteur_id:   req.user.id,
      contenu:     req.body.contenu,
    }));
  }
);

// ── POST /api/reponses/:id/accept ────────────────────────────────────────────
// Accepter une réponse comme solution (auteur de la question uniquement)
router.post('/:id/accept', authenticate, async (req, res) => {
  res.json(await service.accept({ reponse_id: req.params.id, userId: req.user.id }));
});

// ── PATCH /api/reponses/:id ──────────────────────────────────────────────────
// Modifier sa réponse
router.patch('/:id',
  authenticate,
  requireOwnership(req => service.getOwnerId(req.params.id)),
  body('contenu').trim().isLength({ min: 10 }),
  validate,
  async (req, res) => {
    res.json(await service.update(req.params.id, req.body));
  }
);

// ── DELETE /api/reponses/:id ─────────────────────────────────────────────────
// Supprimer sa réponse
router.delete('/:id',
  authenticate,
  requireOwnership(req => service.getOwnerId(req.params.id)),
  async (req, res) => {
    await db.query('DELETE FROM reponse WHERE id = $1', [req.params.id]);
    res.status(204).end();
  }
);

module.exports = router;
