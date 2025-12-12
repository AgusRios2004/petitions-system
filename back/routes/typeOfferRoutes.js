const router = require('express').Router();
const controller = require('../controllers/typeOfferController');
const { authRequired } = require('../middlewares/auth'); // Asumo que tienes un middleware de autenticación

// Obtener todos los tipos (público o privado según tu lógica, aquí lo dejo público para listar en selects)
router.get('/', controller.getTypeOffers);

// Obtener uno por ID
router.get('/:id', controller.getTypeOfferById);

// Crear (Requiere auth)
router.post('/', authRequired, controller.createTypeOffer);

// Actualizar (Requiere auth)
router.put('/:id', authRequired, controller.updateTypeOffer);

// Eliminar (Requiere auth - Cuidado con integridad referencial)
router.delete('/:id', authRequired, controller.deleteTypeOffer);

module.exports = router;