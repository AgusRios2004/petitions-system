const Routes = require('express').Router();
const controller = require('../controllers/weekController');

Routes.get('/', controller.getWeeks);

module.exports = Routes;