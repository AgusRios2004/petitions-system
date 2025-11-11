const router = require('express').Router();
const controller = require('../controllers/interestController');

router.get('/category/:id_category', controller.getInterestByCategory);

module.exports = router;