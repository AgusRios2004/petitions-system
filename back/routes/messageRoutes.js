const router = require('express').Router();
const ctrl = require('../controllers/messageController');
const { authRequired } = require('../middlewares/auth'); // Asumo que tienes un middleware de autenticación

router.get('/conversations', authRequired, ctrl.getConversations);
router.get('/conversation/:idConversation/messages', authRequired, ctrl.getMessagesByConversation);
router.post('/message', authRequired, ctrl.createMessage);
router.post('/conversation/start', authRequired, ctrl.startConversation);

module.exports = router;