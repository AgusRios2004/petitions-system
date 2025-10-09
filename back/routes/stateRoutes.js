const Router = require('express').Router();
const controller = require('../controllers/stateController');
const { authRequired } = require('../middlewares/auth');

Router.get('/', controller.getStates);
Router.get('/:id_state', controller.getStateById);
Router.post('/', authRequired, controller.createState);
Router.put('/:id_state', authRequired, controller.updateState);
Router.delete('/:id_state', authRequired, controller.deleteState);

module.exports = Router;
