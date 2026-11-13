const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { authRequired, onlySuperuser } = require('../middlewares/auth');

// Leer es público (lo usa el registro); escribir es de administración.
const admin = [authRequired, onlySuperuser];

router.get('/', ctrl.getCategories);
router.get('/:id', ctrl.getCategoryById);
router.post('/', admin, ctrl.createCategory);
router.put('/:id', admin, ctrl.updateCategory);
router.delete('/:id', admin, ctrl.deleteCategory);

module.exports = router;