const router = require('express').Router();
const controller = require('../controllers/interestController');
const { authRequired } = require('../middlewares/auth');

// La obtención de intereses puede ser pública o requerir autenticación, dependiendo de tu lógica.
// Por ahora la dejamos pública.
router.get('/customer/:id_customer', controller.getInterestsByCustomer);

// Para crear o eliminar, es obligatorio estar autenticado.
router.post('/', authRequired, controller.createInterest);
router.delete('/:id_interest', authRequired, controller.deleteInterest);

module.exports = router;