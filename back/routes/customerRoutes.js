const router = require('express').Router();
const ctrl = require('../controllers/customerController');

router.get('/', ctrl.getAllCustomers);
router.get('/:id', ctrl.getCustomerById);
router.post('/', ctrl.createCustomer);
router.put('/:id',  ctrl.updateCustomer);
router.post('/register', ctrl.registerCustomer);

module.exports = router;