const router = require('express').Router();
const ctrl = require('../controllers/postulationController');
const { authRequired, onlyStaff } = require('../middlewares/auth');

router.get('/', authRequired, ctrl.getAllPostulations);
router.get('/:id', authRequired, ctrl.getPostulationById);
router.post('/', authRequired, ctrl.createPostulation);
router.put('/:id', authRequired, ctrl.updatePostulation);
router.patch('/:id/state', authRequired, onlyStaff, ctrl.changePostulationState);
router.patch('/:id/winner', authRequired, ctrl.winnerPostulation);
router.patch('/:id/accept', authRequired, ctrl.acceptPostulation);
router.patch('/:id/reject', authRequired, ctrl.rejectPostulation);
router.patch('/:id/cancel', authRequired, ctrl.withdrawPostulation);

module.exports = router;