const router = require('express').Router();
const controller = require('../controllers/offerController');
const { authRequired } = require('../middlewares/auth'); // Asumo que tienes un middleware de autenticación

router.get('/', controller.getOffers);
router.get('/:id', controller.getOfferById);
router.get('/:id_provider/provider', authRequired, controller.getOfferByProviderId)
router.post('/', authRequired, controller.createOffer);
router.put('/:id', authRequired, controller.updateOffer);
router.delete('/:id', authRequired, controller.deleteOffer);

module.exports = router;