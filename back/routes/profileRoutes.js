const router = require('express').Router();
const ctrl = require('../controllers/profileController');
const { authRequired } = require('../middlewares/auth');

router.post('/profile', ctrl.createProfile);
router.get('/profile/me', authRequired, ctrl.getProfile);
router.put('/profile/user/:id', authRequired, ctrl.updateUser);

module.exports = router;
