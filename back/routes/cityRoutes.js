const router = require('express').Router();
const ctrl = require('../controllers/cityController');

router.get('/', ctrl.getCities);

module.exports = router;