const router = require('express').Router();
const ctrl = require('../controllers/petitionController');
const { authRequired } = require('../middlewares/auth');

router.get('/customer/:id_customer', ctrl.getPetitionsByCustomerId);
router.get('/state/:id_state', ctrl.getPetitionsByState);
router.get('/state-type/:id_state/:id_type_petition', ctrl.getPetitionsByStateAndType);

router.get('/', ctrl.getPetitions);
router.get('/:id', ctrl.getPetitionById);
router.post('/', authRequired, ctrl.createPetition);
router.put('/:id', authRequired, ctrl.updatePetition);
router.delete('/:id', authRequired, ctrl.deletePetition);
router.patch('/:id/cancel', authRequired, ctrl.cancelPetition);

module.exports = router;