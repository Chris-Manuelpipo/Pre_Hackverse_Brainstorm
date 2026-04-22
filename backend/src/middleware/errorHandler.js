function errorHandler(err, req, res, next) {
  console.error('💥 Erreur :', err.message);

  // Erreurs PostgreSQL connues
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Cette valeur existe déjà (doublon).' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Référence invalide (clé étrangère).' });
  }
  if (err.code === 'check_violation' || err.code === '23514') {
    return res.status(400).json({ error: err.message });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalide.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expiré.' });
  }

  // Erreur générique
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Erreur serveur interne.',
  });
}

module.exports = errorHandler;
