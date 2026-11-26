const service = require('../services/postulationService');
const { error, success } = require('../middlewares/response');
const { Petition, Customer, Provider } = require('../models');
const notificationService = require('../services/notificationService');

// Los errores llevan su código; los 5xx no exponen el detalle interno.
const fail = (res, e) => {
    const status = e.statusCode || 500;
    return error(res, status >= 500 ? 'Error interno' : e.message, status);
};

exports.getAllPostulations = async (req, res) => {
    try {
        const { id_state, id_customer, id_petition, id_provider } = req.query;
        const { is_superuser } = req.user;

        const filter = {};
        if (id_state) filter.id_state = id_state;
        if (id_customer) filter.id_customer = id_customer;
        if (id_petition) filter.id_petition = id_petition;
        if (id_provider) filter.id_provider = id_provider;

        // Los permisos salen de la relación con la petición, no de un rol (spec 0002).
        if (!is_superuser) {
            if (!id_petition) {
                // Sin petición, solo el proveedor dueño lista sus propias postulaciones.
                // El historial público va por GET /api/provider/:id/history (spec 0004).
                const own = !!req.provider && String(id_provider) === String(req.provider.id_provider);
                if (!own) return error(res, 'No autorizado para ver estas postulaciones', 403);
                filter.id_provider = req.provider.id_provider;
            } else {
                const petition = await Petition.findByPk(id_petition, { attributes: ['id_petition', 'id_customer'] });
                if (!petition) {
                    return error(res, 'Petición no encontrada', 404);
                }

                const isOwner = !!req.customer && petition.id_customer === req.customer.id_customer;
                if (!isOwner) {
                    // Un proveedor que no es dueño ve solo su propia postulación.
                    if (!req.provider) {
                        return error(res, 'No autorizado para ver las postulaciones de esta petición', 403);
                    }
                    filter.id_provider = req.provider.id_provider;
                }
            }
        }

        const postulations = await service.getAllPostulations(filter);
        return success(res, postulations);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error interno', 500);
    }
}

exports.getPostulationById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!/^\d+$/.test(String(id))) return error(res, 'Postulación no encontrada', 404);
        const postulation = await service.getPostulationById(id);
        if (!postulation) return error(res, 'Postulación no encontrada', 404);

        // Lo lee el superusuario, el proveedor autor o el cliente dueño de la petición.
        if (!req.user.is_superuser) {
            const userId = req.user.sub;
            const provider = await Provider.findOne({ where: { user_id: userId }, attributes: ['id_provider'] });
            const isAuthor = !!provider && provider.id_provider === postulation.id_provider;
            const owner = await Customer.findByPk(postulation.petition && postulation.petition.id_customer, { attributes: ['user_id'] });
            const isOwner = !!owner && owner.user_id === userId;
            if (!isAuthor && !isOwner) return error(res, 'No tienes permiso para ver esta postulación', 403);
        }
        return success(res, postulation);
    } catch (e) {
        console.error("Error: ", e);
        return fail(res, e);
    }
};

exports.createPostulation = async (req, res) => {
    try {
        const userId = req.user.sub;
        const eventBus = req.app.get('eventBus');
        const postulation = await service.createPostulation(req.body, userId, eventBus);
        return success(res, postulation, 201);
    } catch (e) {
        return error(res, e.message, e.statusCode || 500);
    }
}

exports.updatePostulation = async (req, res) => {
    try {
        const postulation = await service.updatePostulation(req.params.id, req.body, req.user.sub);
        if (!postulation) return error(res, 'Postulación no encontrada', 404);
        return success(res, postulation);
    } catch (e) {
        return fail(res, e);
    }
}

exports.changePostulationState = async (req, res) => {
    try {
        const postulation = await service.changePostulationState(req.params.id, req.body, req.user.sub);
        if (!postulation) return error(res, 'Postulación no encontrada', 404);
        return success(res, postulation);
    } catch (e) {
        return fail(res, e);
    }
}

exports.acceptPostulation = async (req, res) => {
    try {
        const eventBus = req.app.get('eventBus');
        const postulation = await service.acceptPostulation(req.params.id, req.user.sub, eventBus);
        if (!postulation) return error(res, "Postulación no encontrada", 404);
        return success(res, postulation);
    } catch (e) {
        console.error("Error: ", e);
        const status = e.statusCode || 500;
        // Los errores 5xx no exponen el detalle interno.
        return error(res, status >= 500 ? 'Error interno' : e.message, status);
    }
}

exports.rejectPostulation = async (req, res) => {
    try {
        const eventBus = req.app.get('eventBus');
        const postulation = await service.rejectPostulation(req.params.id, req.user.sub, eventBus);
        if (!postulation) return error(res, "Postulación no encontrada", 404);
        return success(res, postulation);
    } catch (e) {
        console.error("Error: ", e);
        return fail(res, e);
    }
}

exports.withdrawPostulation = async (req, res) => {
    try {
        const eventBus = req.app.get('eventBus');
        const postulation = await service.withdrawPostulation(req.params.id, req.user.sub, eventBus);
        if (!postulation) return error(res, "Postulación no encontrada", 404);
        return success(res, postulation);
    } catch (e) {
        console.error("Error: ", e);
        return fail(res, e);
    }
}

exports.finishPostulation = async (req, res) => {
    try {
        const eventBus = req.app.get('eventBus');
        const postulation = await service.finishPostulation(req.params.id, req.user.sub, eventBus);
        return success(res, postulation);
    } catch (e) {
        console.error("Error: ", e);
        return fail(res, e);
    }
}