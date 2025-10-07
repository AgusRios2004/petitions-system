const router = require('express').Router();
const ctrl = require('../controllers/typeProviderController');

router.get('/', ctrl.getTypeProviders);

module.exports = router;