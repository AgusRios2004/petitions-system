const router = require('express').Router();
const ctrl = require('../controllers/provinceController');

router.get('/', ctrl.getProvinces);
router.get('/:id_country/countries', ctrl.getProvinceByCountry);

module.exports = router;