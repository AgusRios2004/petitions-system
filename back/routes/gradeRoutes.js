const Router = require('express').Router();
const controller = require('../controllers/gradeController');
const { authRequired  } = require('../middlewares/auth');

Router.post('/', authRequired,  controller.createGrade);

module.exports = Router;