const { User, Customer, Provider } = require('../models');
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

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.sub; // Get user ID from token payload

        const user = await User.findOne({
            where: { id_user: userId },
            include: [
                {
                    model: Customer,
                    as: 'customer',
                },
                {
                    model: Provider,
                    as: 'provider',
                }
            ]
        });

        if (!user) {
            return error(res, 'Usuario no encontrado', 404);
        }

        // Convertir el usuario de Sequelize a un objeto plano
        const userJSON = user.toJSON();
        // Añadir la propiedad 'role' basada en is_staff
        userJSON.role = user.is_staff ? 'provider' : 'customer';

        return success(res, userJSON, 'Perfil obtenido correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo el perfil');
    }
};
