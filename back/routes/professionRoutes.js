const router = require('express').Router();
const ctrl = require('../controllers/professionController');

router.get('/', ctrl.getProfessions);

module.exports = router;