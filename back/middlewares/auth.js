const { error, success } = require('../middlewares/response');
const jwt = require('jsonwebtoken');
const { Customer, Provider } = require('../models');

exports.authRequired = (req, res, next) => {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if(!token) return error(res, 'Token requerido', 401);
    
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; //{ sub, email, is_staff, is_superuser }    
        next();
    } catch (e) {
        return error(res, e.message, 403);
    }
}

exports.onlyStaff = (req, res, next) => {
    if(!req.user?.is_staff && !req.user?.is_superuser) return error(res, 'Requere staff', 403);
    next();
}

exports.onlySuperuser = (req, res, next) => {
    if(!req.user?.is_superuser) return error(res, 'Requiere superuser', 403);
    next();
}

// Deja en req.customer y req.provider los perfiles del usuario del token (o null).
// Los permisos se deciden por la relación con el recurso, no por un rol (PRD 3.1).
exports.loadProfiles = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const [customer, provider] = await Promise.all([
            Customer.findOne({ where: { user_id } }),
            Provider.findOne({ where: { user_id } }),
        ]);
        req.customer = customer || null;
        req.provider = provider || null;
        next();
    } catch (e) {
        console.error('Error cargando perfiles: ', e);
        return error(res, 'Error interno', 500);
    }
}

exports.deriveRoles = (customer, provider) => ({ customer: !!customer, provider: !!provider });

// Compatibilidad hasta la tarea 8: provider solo si tiene unicamente perfil de proveedor.
exports.deriveLegacyRole = (customer, provider) => (provider && !customer ? 'provider' : 'customer');
