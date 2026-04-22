const router   = require('express').Router();
const service  = require('./votes.service');
const { authenticate } = require('../../middleware/auth');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');

// ── POST /api/votes/:reponseId ───────────────────────────────────────────────
// Voter sur une réponse (+1 ou -1)
router.post('/:reponseId',
  authenticate,
  body('valeur').isIn([1, -1]).withMessage('La valeur doit être 1 (upvote) ou -1 (downvote).'),
  validate,   // FIX : validate était importé mais non utilisé dans l'original
  async (req, res) => {
    res.json(await service.vote({
      utilisateur_id: req.user.id,
      reponse_id:     req.params.reponseId,
      valeur:         req.body.valeur,
    }));
  }
);

// ── DELETE /api/votes/:reponseId ─────────────────────────────────────────────
// Annuler son vote
router.delete('/:reponseId', authenticate, async (req, res) => {
  res.json(await service.unvote({
    utilisateur_id: req.user.id,
    reponse_id:     req.params.reponseId,
  }));
});

module.exports = router;
