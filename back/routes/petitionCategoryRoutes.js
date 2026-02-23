const router = require('express').Router();
const controller = require('../controllers/petitionCategoryController');
const auth = require('../middlewares/authMiddleware');

router.get('/:id_petition', controller.getByPetition);
router.delete('/:id_petition/:id_category', auth, controller.deleteCategory);

module.exports = router;