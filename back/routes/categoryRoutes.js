const router = require('express').Router();
const ctrl = require('../controllers/categoryController');

router.get('/', ctrl.getCategories);
router.get('/:id', ctrl.getCategoryById);
router.post('/', ctrl.createCategory);
router.put('/:id', ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

module.exports = router;