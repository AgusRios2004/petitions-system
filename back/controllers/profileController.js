const { Customer, Provider } = require('../models');
const { error, success } = require('../middlewares/response');

exports.createProfile = async (req, res) => {
    try {
        const { id_user, role } = req.body;
        if (!id_user || !role) return error(res, 'Faltan datos (id_user o role)');

        let customer, provider;

        if (role === 'customer' || role === 'both') {
            customer = await Customer.create({ id_user });
        }

        if (role === 'provider' || role === 'both') {
            provider = await Provider.create({ id_user });
        }

        if (!customer && !provider) {
            return error(res, 'Rol no válido');
        }

        return success(res, { customer, provider }, 'Perfil(es) creado(s) correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error creando el perfil');
    }
};
