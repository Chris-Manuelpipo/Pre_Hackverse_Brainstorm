const router  = require('express').Router();
const ctrl    = require('./questions.controller');
const service = require('./questions.service');
const { authenticate, requireOwnership } = require('../../middleware/auth');

router.get('/',           ctrl.getAll);
router.get('/search',     ctrl.searchQ);
router.get('/duplicates', authenticate, ctrl.duplicates);
router.get('/:id',        ctrl.getOne);
router.post('/',          authenticate, ctrl.create);
router.patch('/:id',      authenticate,
  requireOwnership(req => service.getOwnerId(req.params.id)), ctrl.update);
router.delete('/:id',     authenticate,
  requireOwnership(req => service.getOwnerId(req.params.id)), ctrl.remove);

// FIX : un seul module.exports (l'original en avait deux)
module.exports = router;
