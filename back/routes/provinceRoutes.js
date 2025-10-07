const router = require('express').Router();
const ctrl = require('../controllers/provinceController');

router.get('/', ctrl.getProvinces);

module.exports = router;