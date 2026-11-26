const router = require('express').Router();
const ctrl = require('../controllers/profileController');
const { authRequired, loadProfiles } = require('../middlewares/auth');

router.get('/profile/me', authRequired, ctrl.getProfile);
router.post('/profile/me/provider', authRequired, loadProfiles, ctrl.activateProvider);
router.post('/profile/me/customer', authRequired, loadProfiles, ctrl.activateCustomer);
router.put('/profile/user/:id', authRequired, ctrl.updateUser);

module.exports = router;
