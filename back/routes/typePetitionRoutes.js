const Router = require('express').Router();
const controller = require('../controllers/typePetitionController');
const { authRequired } = require('../middlewares/auth');

Router.get('/', controller.getTypePetitions);
Router.get('/:id_type_petition', controller.getTypePetitionById);
Router.post('/', authRequired, controller.createTypePetition);
Router.put('/:id_type_petition', authRequired, controller.updateTypePetition);
Router.delete('/:id_type_petition', authRequired, controller.deleteTypePetition);

module.exports = Router;
