const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const { authRequired } = require('../middlewares/auth');

router.get('/', authRequired, notificationController.getNotifications);
router.patch('/:id/read', authRequired, notificationController.markRead);
router.patch('/read-all', authRequired, notificationController.markAllRead);

module.exports = router;