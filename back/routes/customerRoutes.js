const router = require('express').Router();
const ctrl = require('../controllers/customerController');

router.get('/:id', ctrl.getCustomerById);
router.put('/:id',  ctrl.updateCustomer);

module.exports = router;