const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30000,
});

// Test de connexion au démarrage
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL :', err.message);
    return;
  }
  release();
  console.log('✅ PostgreSQL connecté');
});

// FIX : export { query, getClient } — requis par tous les services
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
