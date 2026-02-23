const Router = require('express').Router();
const controller = require('../controllers/gradeController');
const { authRequired } = require('../middlewares/auth');

// GET /api/grades?id_user_create=123
Router.get('/', authRequired, controller.getGrades);
Router.post('/', authRequired, controller.createGrade);

module.exports = Router;