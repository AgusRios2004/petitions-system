const Routes = require('express').Router();
const controller = require('../controllers/hourController');

Routes.get('/', controller.getHours);

module.exports = Routes;