const router = require('express').Router();
const ctrl = require('../controllers/availabilityController');
const { authRequired } = require('../middlewares/auth');

// Obtener la disponibilidad del proveedor autenticado
router.get('/me', authRequired, ctrl.getAvailability);

// Obtener una disponibilidad por ID
router.get('/:id', authRequired, ctrl.getAvailabilityById);

// Crear la disponibilidad del proveedor autenticado
router.post('/me', authRequired, ctrl.createAvailability);

//Actualizar
router.put('/me/:id', authRequired, ctrl.updateAvailability);

// Eliminar la disponibilidad del proveedor autenticado
router.delete('/me/:id', authRequired, ctrl.deleteAvailability);

module.exports = router;
