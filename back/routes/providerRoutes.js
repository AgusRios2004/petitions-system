const router = require('express').Router();
const ctrl = require('../controllers/providerController');

router.get('/', ctrl.getAllProviders);
router.get('/:id', ctrl.getProviderById);
router.post('/', ctrl.createProvider);
router.put('/:id', ctrl.updateProvider);

module.exports = router;