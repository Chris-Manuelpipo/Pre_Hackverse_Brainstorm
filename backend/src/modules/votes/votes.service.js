const db = require('../../config/database');
const { emitToUser } = require('../../socket');

async function vote({ utilisateur_id, reponse_id, valeur }) {
  // UPSERT : un seul vote par (utilisateur, réponse), mise à jour si changement
  const { rows } = await db.query(
    `INSERT INTO vote (utilisateur_id, reponse_id, valeur)
     VALUES ($1,$2,$3)
     ON CONFLICT (utilisateur_id, reponse_id)
     DO UPDATE SET valeur = EXCLUDED.valeur
     RETURNING *`,
    [utilisateur_id, reponse_id, valeur]
  );

  // Score mis à jour par trigger PostgreSQL, on le relit
  const scoreRes = await db.query(
    'SELECT score_votes FROM reponse WHERE id = $1',
    [reponse_id]
  );

  emitToUser(utilisateur_id, 'vote:updated', {
    reponse_id,
    score_votes: scoreRes.rows[0].score_votes,
  });

  return { vote: rows[0], score_votes: scoreRes.rows[0].score_votes };
}

async function unvote({ utilisateur_id, reponse_id }) {
  await db.query(
    'DELETE FROM vote WHERE utilisateur_id=$1 AND reponse_id=$2',
    [utilisateur_id, reponse_id]
  );

  const scoreRes = await db.query(
    'SELECT score_votes FROM reponse WHERE id = $1',
    [reponse_id]
  );

  return { score_votes: scoreRes.rows[0].score_votes };
}

module.exports = { vote, unvote };
