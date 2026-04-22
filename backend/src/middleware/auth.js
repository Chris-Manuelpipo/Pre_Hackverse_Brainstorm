const jwt = require('jsonwebtoken');

// Middleware obligatoire : bloque si pas de token valide
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Token d'authentification manquant." });
  }
  const token = authHeader.split(' ')[1];
  req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
}

// Middleware optionnel : passe même sans token
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      // Token invalide ignoré silencieusement
    }
  }
  next();
}

// Middleware de propriété : vérifie que l'utilisateur est bien le propriétaire
function requireOwnership(getResourceOwnerId) {
  return async (req, res, next) => {
    const ownerId = await getResourceOwnerId(req);
    if (req.user.id !== ownerId) {
      return res.status(403).json({ error: 'Action non autorisée.' });
    }
    next();
  };
}

module.exports = { authenticate, optionalAuth, requireOwnership };
