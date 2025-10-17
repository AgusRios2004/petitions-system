const router = require('express').Router();
const ctrl = require('../controllers/postulationController');
const { authRequired, onlyStaff } = require('../middlewares/auth');

router.get('/', authRequired, onlyStaff, ctrl.getAllPostulations);
router.get('/:id', authRequired, ctrl.getPostulationById);
router.post('/', authRequired, ctrl.createPostulation);
router.put('/:id', authRequired, ctrl.updatePostulation);
router.patch('/:id/state', authRequired, onlyStaff, ctrl.changePostulationState);

module.exports = router;