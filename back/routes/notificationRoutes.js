const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, notificationController.getNotifications);
router.patch('/:id/read', authMiddleware, notificationController.markRead);
router.patch('/read-all', authMiddleware, notificationController.markAllRead);

module.exports = router;