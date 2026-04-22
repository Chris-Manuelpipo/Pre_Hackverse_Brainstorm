const db = require('../../config/database');
const { emitToUser } = require('../../socket');

// ── Créer une réponse ────────────────────────────────────────────────────────
async function create({ question_id, auteur_id, contenu }) {
  const q = await db.query(
    'SELECT auteur_id, statut FROM question WHERE id = $1',
    [question_id]
  );
  if (!q.rows[0]) {
    const e = new Error('Question introuvable.'); e.status = 404; throw e;
  }
  if (q.rows[0].statut === 'ferme') {
    const e = new Error('Cette question est fermée.'); e.status = 400; throw e;
  }

  const { rows } = await db.query(
    `INSERT INTO reponse (question_id, auteur_id, contenu)
     VALUES ($1,$2,$3) RETURNING *`,
    [question_id, auteur_id, contenu]
  );

  // Notifier l'auteur de la question (sauf si c'est lui-même)
  if (q.rows[0].auteur_id !== auteur_id) {
    await createNotification({
      destinataire_id: q.rows[0].auteur_id,
      type:            'nouvelle_reponse',
      question_id,
      reponse_id:      rows[0].id,
      contenu:         'Nouvelle réponse à votre question.',
    });
  }

  return rows[0];
}

// ── Accepter une réponse comme solution ─────────────────────────────────────
async function accept({ reponse_id, userId }) {
  const rep = await db.query(
    `SELECT r.*, q.auteur_id AS question_auteur_id
     FROM reponse r JOIN question q ON q.id = r.question_id
     WHERE r.id = $1`,
    [reponse_id]
  );
  if (!rep.rows[0]) {
    const e = new Error('Réponse introuvable.'); e.status = 404; throw e;
  }
  if (rep.rows[0].question_auteur_id !== userId) {
    const e = new Error("Seul l'auteur de la question peut accepter une réponse.");
    e.status = 403; throw e;
  }
  if (rep.rows[0].est_acceptee) {
    const e = new Error('Cette réponse est déjà acceptée.'); e.status = 400; throw e;
  }

  const { rows } = await db.query(
    'UPDATE reponse SET est_acceptee = TRUE WHERE id = $1 RETURNING *',
    [reponse_id]
  );

  // Notifier l'auteur de la réponse
  await createNotification({
    destinataire_id: rep.rows[0].auteur_id,
    type:            'solution_acceptee',
    question_id:     rep.rows[0].question_id,
    reponse_id,
    contenu:         'Votre réponse a été acceptée comme solution !',
  });

  return rows[0];
}

// ── Réponses d'une question ──────────────────────────────────────────────────
async function findByQuestion(question_id, userId) {
  const baseQuery = `
    SELECT
      r.*,
      u.pseudo        AS auteur_pseudo,
      u.avatar_url    AS auteur_avatar,
      u.niveau_confiance,
      COUNT(c.id)     AS nb_commentaires
    FROM reponse r
    JOIN utilisateur u ON u.id = r.auteur_id
    LEFT JOIN commentaire c ON c.reponse_id = r.id
    WHERE r.question_id = $1
    GROUP BY r.id, u.pseudo, u.avatar_url, u.niveau_confiance
    ORDER BY r.est_acceptee DESC, r.score_votes DESC, r.date_creation ASC
  `;

  const { rows } = await db.query(baseQuery, [question_id]);

  // Si connecté, enrichir avec le vote de l'utilisateur sur chaque réponse
  if (userId) {
    const reponseIds = rows.map(r => r.id);
    if (reponseIds.length > 0) {
      const votes = await db.query(
        'SELECT reponse_id, valeur FROM vote WHERE utilisateur_id = $1 AND reponse_id = ANY($2)',
        [userId, reponseIds]
      );
      const voteMap = {};
      votes.rows.forEach(v => { voteMap[v.reponse_id] = v.valeur; });
      rows.forEach(r => { r.mon_vote = voteMap[r.id] || null; });
    }
  }

  return rows;
}

// ── Modifier une réponse ─────────────────────────────────────────────────────
async function update(id, { contenu }) {
  const { rows } = await db.query(
    'UPDATE reponse SET contenu = $1 WHERE id = $2 RETURNING *',
    [contenu, id]
  );
  if (!rows[0]) {
    const e = new Error('Réponse introuvable.'); e.status = 404; throw e;
  }
  return rows[0];
}

// ── Récupérer l'auteur (pour ownership) ─────────────────────────────────────
async function getOwnerId(reponseId) {
  const { rows } = await db.query(
    'SELECT auteur_id FROM reponse WHERE id = $1',
    [reponseId]
  );
  return rows[0]?.auteur_id;
}

// ── Helper interne : créer une notification ──────────────────────────────────
async function createNotification({ destinataire_id, type, question_id, reponse_id, contenu }) {
  const { rows } = await db.query(
    `INSERT INTO notification (destinataire_id, type, question_id, reponse_id, contenu)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [destinataire_id, type, question_id, reponse_id, contenu]
  );
  emitToUser(destinataire_id, 'notification:new', rows[0]);
  return rows[0];
}

module.exports = { create, accept, findByQuestion, update, getOwnerId };
