const router = require('express').Router();
const ctrl = require('../controllers/profileController');

router.post('/profile', ctrl.createProfile);

module.exports = router;
