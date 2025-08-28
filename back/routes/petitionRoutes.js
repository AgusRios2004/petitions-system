const router = require('express').Router();
const ctrl = require('../controllers/petitionController');

// rutas específicas primero
router.get('/customer/:id_customer', ctrl.getPetitionsByCustomerId);
router.get('/state/:id_state', ctrl.getPetitionsByState);
router.get('/state-type/:id_state/:id_type_petition', ctrl.getPetitionsByStateAndType);

// luego las más genéricas
router.get('/', ctrl.getPetitions);
router.get('/:id', ctrl.getPetitionById);
router.post('/', ctrl.createPetition);
router.put('/:id', ctrl.updatePetition);
router.delete('/:id/:id_state', ctrl.deletePetition);

module.exports = router;
