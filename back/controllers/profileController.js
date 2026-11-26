const { User, Customer, Provider } = require('../models');
const { error, success } = require('../middlewares/response');
const UserService = require('../services/userService');
const { deriveRoles, deriveLegacyRole } = require('../middlewares/auth');
const { parseId } = require('../middlewares/ownership');

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

        // Determinar el estado de completitud del perfil
        const isCustomerComplete = !!(user.customer && user.customer.dni && user.customer.phone && user.customer.address_id);
        const isProviderComplete = !!(user.provider && user.provider.id_type_provider && user.provider.id_profession && user.provider.address_id);
        const hasCompletedProfile = isCustomerComplete || isProviderComplete;

        userJSON.profileStatus = {
            isCustomerComplete,
            isProviderComplete,
            hasCompletedProfile,
        };
        
        userJSON.roles = deriveRoles(user.customer, user.provider);
        // Compatibilidad hasta la tarea 8: role derivado de los perfiles, no de is_staff.
        userJSON.role = deriveLegacyRole(user.customer, user.provider);

        return success(res, userJSON, 'Perfil obtenido correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo el perfil');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = parseId(req.params.id);
        if (userId === null) return error(res, 'Usuario no encontrado', 404);
        if (userId !== req.user.sub) {
            const exists = await User.findByPk(userId, { attributes: ['id_user'] });
            return exists ? error(res, 'No es tu usuario.', 403) : error(res, 'Usuario no encontrado', 404);
        }
        const { name, lastname, email, profile_image } = req.body;

        const dataToUpdate = {};
        if (name) dataToUpdate.name = name;
        if (lastname) dataToUpdate.lastname = lastname;
        if (email) dataToUpdate.email = email;
        if (profile_image) dataToUpdate.profile_image = profile_image;

        if (Object.keys(dataToUpdate).length === 0) {
            return error(res, "No se proporcionaron datos para actualizar.", 400);
        }
        
        const updatedUser = await UserService.updateUser(userId, dataToUpdate);

        return success(res, updatedUser, "Usuario modificado correctamente");
    } catch (e) {
        console.error(e);
        return error(res, e.message, 500, e);
    }
}