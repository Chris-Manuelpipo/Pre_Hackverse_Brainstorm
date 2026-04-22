const db = require('../../config/database');

// ── Créer une question (avec gestion des tags) ───────────────────────────────
async function create({ auteur_id, titre, type_contenu, matiere_id,
                        niveau_etudes, description, tags = [] }) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO question (auteur_id, titre, type_contenu, matiere_id, niveau_etudes, description)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [auteur_id, titre, type_contenu, matiere_id, niveau_etudes, description]
    );
    const question = rows[0];

    // Associer les tags (créer si inexistants)
    for (const tagNom of tags) {
      const tagRes = await client.query(
        `INSERT INTO tag (nom) VALUES ($1)
         ON CONFLICT (nom) DO UPDATE SET nom = EXCLUDED.nom
         RETURNING id`,
        [tagNom.toLowerCase().trim()]
      );
      await client.query(
        'INSERT INTO question_tag (question_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [question.id, tagRes.rows[0].id]
      );
    }

    await client.query('COMMIT');
    return findById(question.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Feed paginé avec filtres et tri ─────────────────────────────────────────
async function findAll({ page = 1, limit = 20, matiere, statut,
                          type_contenu, niveau, sort = 'recent' }) {
  const offset = (page - 1) * limit;
  const conditions = ['1=1'];
  const params = [];
  let p = 1;

  if (matiere)      { conditions.push(`vfq.matiere_nom ILIKE $${p++}`);   params.push(matiere); }
  if (statut)       { conditions.push(`vfq.statut = $${p++}`);            params.push(statut); }
  if (type_contenu) { conditions.push(`vfq.type_contenu = $${p++}`);      params.push(type_contenu); }
  if (niveau)       { conditions.push(`vfq.niveau_etudes ILIKE $${p++}`); params.push(`%${niveau}%`); }

  const orderMap = {
    recent: 'vfq.date_creation DESC',
    votes:  'nb_reponses DESC',
    vues:   'vfq.nb_vues DESC',
  };
  const orderBy = orderMap[sort] || orderMap.recent;

  const sql = `
    SELECT
      vfq.id, vfq.titre, vfq.type_contenu, vfq.statut, vfq.nb_vues,
      vfq.date_creation, vfq.niveau_etudes,
      q.auteur_id,
      vfq.auteur_pseudo, vfq.auteur_avatar,
      vfq.auteur_niveau,
      vfq.matiere_nom, vfq.matiere_icone,
      vfq.nb_reponses,
      vfq.tags
    FROM v_feed_questions vfq
    JOIN question q ON q.id = vfq.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT $${p} OFFSET $${p + 1}
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM v_feed_questions vfq
    WHERE ${conditions.join(' AND ')}
  `;

  const [dataRes, countRes] = await Promise.all([
    db.query(sql, [...params, limit, offset]),
    db.query(countSql, params),
  ]);

  return {
    data:       dataRes.rows,
    total:      parseInt(countRes.rows[0].total),
    page:       parseInt(page),
    limit:      parseInt(limit),
    totalPages: Math.ceil(countRes.rows[0].total / limit),
  };
}

// ── Détail d'une question ────────────────────────────────────────────────────
async function findById(id) {
  const { rows } = await db.query(
    `SELECT
       q.id, q.auteur_id, q.matiere_id, q.titre, q.type_contenu,
       q.niveau_etudes, q.description, q.statut, q.nb_vues,
       q.date_creation, q.date_modification,
       u.pseudo AS auteur_pseudo, u.avatar_url AS auteur_avatar,
       u.niveau_confiance AS auteur_niveau,
       m.nom AS matiere_nom,
       ARRAY_AGG(DISTINCT t.nom) FILTER (WHERE t.nom IS NOT NULL) AS tags
      FROM question q
      JOIN utilisateur u      ON u.id = q.auteur_id
      LEFT JOIN matiere m     ON m.id = q.matiere_id
      LEFT JOIN question_tag qt ON qt.question_id = q.id
      LEFT JOIN tag t         ON t.id = qt.tag_id
      WHERE q.id = $1
      GROUP BY q.id, q.auteur_id, q.matiere_id, q.titre, q.type_contenu, q.niveau_etudes, q.description, q.statut, q.nb_vues, q.date_creation, q.date_modification, u.id, u.pseudo, u.avatar_url, u.niveau_confiance, m.nom`,
    [id]
  );
  if (rows.length === 0) {
    const err = new Error('Question introuvable.');
    err.status = 404;
    throw err;
  }
  // Incrémenter nb_vues (fire & forget)
  db.query('UPDATE question SET nb_vues = nb_vues + 1 WHERE id = $1', [id]);
  return rows[0];
}

// ── Recherche full-text ──────────────────────────────────────────────────────
async function search({ q, page = 1, limit = 20 }) {
  if (!q) return [];
  const offset = (page - 1) * limit;
  const { rows } = await db.query(
    `SELECT
       q.id, q.titre, q.type_contenu, q.statut, q.date_creation,
       u.pseudo AS auteur_pseudo,
       m.nom AS matiere_nom,
       ts_rank(q.search_vector, plainto_tsquery('french', $1)) AS rank
     FROM question q
     JOIN utilisateur u  ON u.id = q.auteur_id
     LEFT JOIN matiere m ON m.id = q.matiere_id
     WHERE q.search_vector @@ plainto_tsquery('french', $1)
     ORDER BY rank DESC
     LIMIT $2 OFFSET $3`,
    [q, limit, offset]
  );
  return rows;
}

// ── Détection de doublons ────────────────────────────────────────────────────
async function checkDuplicates(titre) {
  if (!titre) return [];
  const { rows } = await db.query(
    `SELECT id, titre, similarity(titre, $1) AS score
     FROM question
     WHERE similarity(titre, $1) > 0.35
     ORDER BY score DESC
     LIMIT 5`,
    [titre]
  );
  return rows;
}

// ── Modifier une question ────────────────────────────────────────────────────
async function update(id, { titre, description, type_contenu, matiere_id, niveau_etudes }) {
  const { rows } = await db.query(
    `UPDATE question
     SET titre=$1, description=$2, type_contenu=$3, matiere_id=$4, niveau_etudes=$5
     WHERE id=$6
     RETURNING *`,
    [titre, description, type_contenu, matiere_id, niveau_etudes, id]
  );
  return rows[0];
}

// ── Supprimer une question ───────────────────────────────────────────────────
async function remove(id) {
  await db.query('DELETE FROM question WHERE id = $1', [id]);
}

// ── Récupérer l'auteur (pour le middleware ownership) ───────────────────────
async function getOwnerId(questionId) {
  const { rows } = await db.query(
    'SELECT auteur_id FROM question WHERE id = $1',
    [questionId]
  );
  return rows[0]?.auteur_id;
}

module.exports = { create, findAll, findById, search, checkDuplicates,
                   update, remove, getOwnerId };
