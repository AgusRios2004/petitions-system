const router = require('express').Router();
const ctrl = require('../controllers/messageController');
const authRequired = require('../middlewares/authMiddleware'); // Asumo que tienes un middleware de autenticación

router.get('/converstaion', authRequired, ctrl.getConverstaions);
router.get('/conversations', authRequired, ctrl.getConverstaions);
router.get('/conversation/:idConversation/messages', authRequired, ctrl.getMessagesByConversation);
router.post('/message', authRequired, ctrl.createMessage);

module.exports = router;