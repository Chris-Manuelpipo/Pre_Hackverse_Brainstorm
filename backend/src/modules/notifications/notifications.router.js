const router = require('express').Router();
const db     = require('../../config/database');
const { authenticate } = require('../../middleware/auth');

// ── GET /api/notifications ───────────────────────────────────────────────────
// Mes 30 dernières notifications
router.get('/', authenticate, async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM notification
     WHERE destinataire_id = $1
     ORDER BY date_creation DESC
     LIMIT 30`,
    [req.user.id]
  );
  res.json(rows);
});

// ── GET /api/notifications/unread-count ─────────────────────────────────────
// Compteur non lues (badge header)
router.get('/unread-count', authenticate, async (req, res) => {
  const { rows } = await db.query(
    'SELECT COUNT(*) AS count FROM notification WHERE destinataire_id=$1 AND est_lue=FALSE',
    [req.user.id]
  );
  res.json({ count: parseInt(rows[0].count) });
});

// ── PATCH /api/notifications/read-all ───────────────────────────────────────
// Marquer toutes comme lues
router.patch('/read-all', authenticate, async (req, res) => {
  await db.query(
    'UPDATE notification SET est_lue = TRUE WHERE destinataire_id = $1',
    [req.user.id]
  );
  res.json({ message: 'Toutes les notifications marquées comme lues.' });
});

// ── PATCH /api/notifications/:id/read ───────────────────────────────────────
// Marquer une seule notification comme lue
router.patch('/:id/read', authenticate, async (req, res) => {
  await db.query(
    'UPDATE notification SET est_lue = TRUE WHERE id=$1 AND destinataire_id=$2',
    [req.params.id, req.user.id]
  );
  res.json({ message: 'Notification marquée comme lue.' });
});

module.exports = router;
