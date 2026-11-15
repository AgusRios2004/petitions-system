const Router = require('express').Router();
const ctrl = require('../controllers/addressController');
const { authRequired, onlySuperuser } = require('../middlewares/auth');

// Los domicilios son datos personales: leerlos y escribirlos por esta ruta
// es solo de administración. Cada perfil edita el suyo desde su PUT.
Router.use(authRequired, onlySuperuser);

Router.get('/', ctrl.getAddresses);
Router.get('/:id', ctrl.getAddresById);
Router.post('/', ctrl.createAddress);
Router.put('/:id', ctrl.updateAddress);
Router.delete('/:id', ctrl.deleteAddress);
Router.get('/city/:id_city', ctrl.getAddressesByCityId);

module.exports = Router;