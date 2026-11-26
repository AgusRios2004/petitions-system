const service = require('../services/postulationService');
const { error, success } = require('../middlewares/response');
const { Petition, Customer } = require('../models');
const notificationService = require('../services/notificationService');

// Los errores llevan su código; los 5xx no exponen el detalle interno.
const fail = (res, e) => {
    const status = e.statusCode || 500;
    return error(res, status >= 500 ? 'Error interno' : e.message, status);
};

exports.getAllPostulations = async (req, res) => {
    try {
        const { id_state, id_customer, id_petition, id_provider } = req.query;
        const { is_staff, is_superuser, sub: userId } = req.user;

        // A request for a provider's public history is identified by id_provider and id_state === '1' (Accepted)
        const isPublicHistoryRequest = id_provider && id_state === '1' && !id_petition;

        const filter = {};
        if (id_state) filter.id_state = id_state;
        if (id_customer) filter.id_customer = id_customer;
        if (id_petition) filter.id_petition = id_petition;
        if (id_provider) filter.id_provider = id_provider;

        // If user is not staff/superuser AND it's NOT a public history request, apply original security check.
        if (!is_staff && !is_superuser && !isPublicHistoryRequest) {
            if (!id_petition) {
                // if no petition id is provided, we can't check ownership, so return nothing
                return success(res, []);
            }

            const petition = await Petition.findByPk(id_petition, {
                include: [{
                    model: Customer,
                    as: 'customers',
                }]
            });

            if (!petition) {
                return error(res, 'Petición no encontrada', 404);
            }

            // Check if the petition belongs to the user
            if (petition.customers.user_id !== userId) {
                return error(res, 'No autorizado para ver las postulaciones de esta petición', 403);
            }
        }

        const postulations = await service.getAllPostulations(filter);
        return success(res, postulations);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
}

exports.getPostulationById = async (req, res) => {
    try {
        const { id } = req.params;
        const postulation = await service.getPostulationById(id);
        if (!postulation) return error(res, 'Postulación no encontrada', 404);
        return success(res, postulation);
    } catch (e) {
        return error(res, e.message, 500);
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
        const postulation = await service.updatePostulation(req.params.id, req.body);
        if (!postulation) return error(res, 'Postulación no encontrada', 404);
        return success(res, postulation);
    } catch (e) {
        return fail(res, e);
    }
}

exports.changePostulationState = async (req, res) => {
    try {
        const postulation = await service.changePostulationState(req.params.id, req.body);
        if (!postulation) return error(res, 'Postulación no encontrada', 404);
        return success(res, postulation);
    } catch (e) {
        return error(res, e.message, 500);
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