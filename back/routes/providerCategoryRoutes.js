const router = require('express').Router();
const controller = require('../controllers/providerCategoryController');
const { authRequired } = require('../middlewares/auth');

// To create or delete, user must be authenticated
router.post('/', authRequired, controller.createProviderCategory);
router.delete('/:id', authRequired, controller.deleteProviderCategory);

module.exports = router;
