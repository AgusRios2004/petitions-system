const router = require('express').Router();
const ctrl = require('../controllers/providerController');
const { authRequired } = require('../middlewares/auth');

router.get('/', ctrl.getAllProviders);
router.get('/:id', ctrl.getProviderById);
router.put('/:id', ctrl.updateProvider);
router.get('/public/:id', ctrl.getPublicProfile);
router.get('/details/:id', authRequired, ctrl.getProviderByIdWithDetails)

module.exports = router;