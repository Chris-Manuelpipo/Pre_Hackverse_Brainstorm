// FIX : doit être la première ligne — capture toutes les erreurs async
require('express-async-errors');
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression = require('compression');

const errorHandler = require('./middleware/errorHandler');

// Routers
const authRouter          = require('./modules/auth/auth.router');
const questionsRouter     = require('./modules/questions/questions.router');
const reponsesRouter      = require('./modules/reponses/reponses.router');
const commentairesRouter  = require('./modules/commentaires/commentaires.router');
const votesRouter         = require('./modules/votes/votes.router');
const uploadRouter        = require('./modules/upload/upload.router');
const utilisateursRouter  = require('./modules/utilisateurs/utilisateurs.router');
const notificationsRouter = require('./modules/notifications/notifications.router');

const app = express();

// ── Sécurité & Utilitaires ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:      'OK',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── Routes API ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRouter);
app.use('/api/questions',     questionsRouter);
app.use('/api/reponses',      reponsesRouter);
app.use('/api/commentaires',  commentairesRouter);
app.use('/api/votes',         votesRouter);
app.use('/api/upload',        uploadRouter);
app.use('/api/users',         utilisateursRouter);
app.use('/api/notifications', notificationsRouter);

// ── Référentiel (matières & tags) ─────────────────────────────────────────────
const db = require('./config/database');
app.get('/api/matieres', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM matiere ORDER BY nom');
  res.json(rows);
});
app.get('/api/tags', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM tag ORDER BY nb_utilisations DESC, nom');
  res.json(rows);
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} introuvable.` });
});

// ── Gestionnaire d'erreurs global (doit être EN DERNIER) ─────────────────────
app.use(errorHandler);

module.exports = app;
