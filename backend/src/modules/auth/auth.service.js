const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../../config/database');

async function register({ email, pseudo, mot_de_passe, nom, prenom, niveau_etudes }) {
  const existing = await db.query(
    'SELECT id FROM utilisateur WHERE email = $1 OR pseudo = $2',
    [email, pseudo]
  );
  if (existing.rows.length > 0) {
    const err = new Error('Email ou pseudo déjà utilisé.');
    err.status = 409;
    throw err;
  }

  const hash = await bcrypt.hash(mot_de_passe, 12);
  const { rows } = await db.query(
    `INSERT INTO utilisateur (email, mot_de_passe_hash, pseudo, nom, prenom, niveau_etudes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, pseudo, nom, prenom, points_xp, niveau_confiance, date_inscription`,
    [email, hash, pseudo, nom, prenom, niveau_etudes]
  );

  return { user: rows[0], token: generateToken(rows[0]) };
}

async function login({ email, mot_de_passe }) {
  const { rows } = await db.query(
    'SELECT * FROM utilisateur WHERE email = $1 AND est_actif = TRUE',
    [email]
  );

  if (rows.length === 0) {
    const err = new Error('Email ou mot de passe incorrect.');
    err.status = 401;
    throw err;
  }

  const user = rows[0];
  const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
  if (!valid) {
    const err = new Error('Email ou mot de passe incorrect.');
    err.status = 401;
    throw err;
  }

  await db.query(
    'UPDATE utilisateur SET date_derniere_connexion = NOW() WHERE id = $1',
    [user.id]
  );

  const { mot_de_passe_hash, ...safeUser } = user;
  return { user: safeUser, token: generateToken(user) };
}

async function getMe(userId) {
  const { rows } = await db.query(
    `SELECT id, email, pseudo, nom, prenom, avatar_url, bio,
            niveau_etudes, points_xp, niveau_confiance, date_inscription
     FROM utilisateur WHERE id = $1`,
    [userId]
  );
  if (rows.length === 0) {
    const err = new Error('Utilisateur introuvable.');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, pseudo: user.pseudo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

module.exports = { register, login, getMe };
