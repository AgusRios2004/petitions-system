const { User, Customer, Provider } = require('../models');
const { error, success } = require('../middlewares/response');
const UserService = require('../services/userService');
const ProviderService = require('../services/providerService');
const CustomerService = require('../services/customerService');
const { deriveRoles, deriveLegacyRole } = require('../middlewares/auth');
const { parseId } = require('../middlewares/ownership');

// Payload de /profile/me: lo comparten el GET y las activaciones de perfil.
// Devuelve null si el usuario no existe.
const buildProfile = async (userId) => {
    const user = await User.findOne({
        where: { id_user: userId },
        include: [
            { model: Customer, as: 'customer' },
            { model: Provider, as: 'provider' },
        ],
    });
    if (!user) return null;

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
    return userJSON;
};

exports.getProfile = async (req, res) => {
    try {
        const userJSON = await buildProfile(req.user.sub);
        if (!userJSON) {
            return error(res, 'Usuario no encontrado', 404);
        }
        return success(res, userJSON, 'Perfil obtenido correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo el perfil');
    }
};

const activate = (kind, serviceCall) => async (req, res) => {
    try {
        await serviceCall(req.user.sub, req.body || {}, { customer: req.customer, provider: req.provider });
        const profile = await buildProfile(req.user.sub);
        return success(res, profile, `Perfil de ${kind} activado`, 201);
    } catch (e) {
        const status = e.statusCode || 500;
        if (status >= 500) console.error('Error activando perfil: ', e);
        return error(res, status >= 500 ? 'Error interno' : e.message, status);
    }
};

exports.activateProvider = activate('proveedor', (...a) => ProviderService.activateProvider(...a));
exports.activateCustomer = activate('cliente', (...a) => CustomerService.activateCustomer(...a));

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