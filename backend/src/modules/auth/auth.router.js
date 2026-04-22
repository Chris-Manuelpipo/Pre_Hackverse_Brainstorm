const router     = require('express').Router();
const controller = require('./auth.controller');
const validate   = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { registerValidators, loginValidators } = require('./auth.validators');
const rateLimit  = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

router.post('/register', authLimiter, registerValidators, validate, controller.register);
router.post('/login',    authLimiter, loginValidators,    validate, controller.login);
router.get('/me',        authenticate, controller.getMe);

module.exports = router;
