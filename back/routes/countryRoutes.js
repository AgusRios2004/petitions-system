const router = require('express').Router();
const ctrl = require('../controllers/countryController');

router.get('/', ctrl.getCountries);

module.exports = router;