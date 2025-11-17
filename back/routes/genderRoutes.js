const router = require('express').Router();
const controller = require('../controllers/genderController');

router.get('/', controller.getGenders);

module.exports = router;