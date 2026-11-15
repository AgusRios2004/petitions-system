const router = require('express').Router();
const ctrl = require('../controllers/customerController');
const { authRequired } = require('../middlewares/auth');

router.get('/:id', authRequired, ctrl.getCustomerById);
router.put('/:id', authRequired, ctrl.updateCustomer);

module.exports = router;