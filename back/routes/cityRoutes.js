const router = require('express').Router();
const ctrl = require('../controllers/cityController');

router.get('/', ctrl.getCities);
router.get('/:id_departament/departments', ctrl.getCitiesByDepartment);

module.exports = router;