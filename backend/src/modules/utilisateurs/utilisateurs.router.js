const router = require('express').Router();
const db     = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');

// ── PATCH /api/users/me ──────────────────────────────────────────────────────
// FIX : /me déclaré AVANT /:pseudo pour éviter le conflit de routes
router.patch('/me',
  authenticate,
  body('nom').optional().trim().isLength({ max: 100 }),
  body('prenom').optional().trim().isLength({ max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  validate,
  async (req, res) => {
    const { nom, prenom, bio, niveau_etudes, avatar_url } = req.body;
    const { rows } = await db.query(
      `UPDATE utilisateur
       SET nom=$1, prenom=$2, bio=$3, niveau_etudes=$4, avatar_url=$5
       WHERE id=$6
       RETURNING id, pseudo, nom, prenom, bio, niveau_etudes, avatar_url, points_xp, niveau_confiance`,
      [nom, prenom, bio, niveau_etudes, avatar_url, req.user.id]
    );
    res.json(rows[0]);
  }
);

// ── GET /api/users/me/matieres ───────────────────────────────────────────────
// Matières suivies par l'utilisateur connecté
router.get('/me/matieres', authenticate, async (req, res) => {
  const { rows } = await db.query(
    `SELECT m.* FROM matiere m
     JOIN utilisateur_matiere um ON um.matiere_id = m.id
     WHERE um.utilisateur_id = $1
     ORDER BY m.nom`,
    [req.user.id]
  );
  res.json(rows);
});

// ── POST /api/users/me/matieres ──────────────────────────────────────────────
// Suivre une matière
router.post('/me/matieres', authenticate, async (req, res) => {
  const { matiere_id } = req.body;
  await db.query(
    `INSERT INTO utilisateur_matiere (utilisateur_id, matiere_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [req.user.id, matiere_id]
  );
  res.status(201).json({ message: 'Matière ajoutée.' });
});

// ── DELETE /api/users/me/matieres/:matiereId ─────────────────────────────────
// Se désabonner d'une matière
router.delete('/me/matieres/:matiereId', authenticate, async (req, res) => {
  await db.query(
    'DELETE FROM utilisateur_matiere WHERE utilisateur_id=$1 AND matiere_id=$2',
    [req.user.id, req.params.matiereId]
  );
  res.status(204).end();
});

// ── GET /api/users/:pseudo ───────────────────────────────────────────────────
// Profil public (APRÈS /me pour éviter le conflit)
router.get('/:pseudo', async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM v_profil_utilisateur WHERE pseudo = $1',
    [req.params.pseudo]
  );
  if (!rows[0]) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  res.json(rows[0]);
});

module.exports = router;
