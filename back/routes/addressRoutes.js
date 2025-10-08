const Router = require('express').Router();
const ctrl = require('../controllers/addressController');

Router.get('/', ctrl.getAddresses);
Router.get('/:id', ctrl.getAddresById);
Router.post('/', ctrl.createAddress);
Router.put('/:id', ctrl.updateAddress);
Router.delete('/:id', ctrl.deleteAddress);
Router.get('/city/:id_city', ctrl.getAddressesByCityId);

module.exports = Router;