const { body } = require('express-validator');

const registerValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
  body('pseudo')
    .trim()
    .isLength({ min: 3, max: 80 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Pseudo : 3-80 caractères, lettres/chiffres/tiret/underscore.'),
  body('mot_de_passe')
    .isLength({ min: 8 })
    .withMessage('Mot de passe : 8 caractères minimum.'),
  body('nom').optional().trim().isLength({ max: 100 }),
  body('prenom').optional().trim().isLength({ max: 100 }),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('mot_de_passe').notEmpty().withMessage('Mot de passe requis.'),
];

module.exports = { registerValidators, loginValidators };
