const service = require('../services/postulationService');
const { error, success } = require('../middlewares/response');
const { Petition, Customer } = require('../models');
const notificationService = require('../services/notificationService');

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
        const postulation = await service.createPostulation(req.body, req.user.sub);
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
        return error(res, e.message, 500);
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

exports.winnerPostulation = async (req, res) => {
    try {
        const postulation = await service.updatePostulationWinnerStatus(req.params.id, req.body.winner, req.user.sub);
        if(!postulation) return error(res, 'Postulación no encontrada', 404);
        return success(res, postulation);
    } catch (e) {
        console.error("Error: " ,e.message);
        return error(res, e.message, 500)
    }
};

exports.acceptPostulation = async (req, res) => {
    try {
        const postulation = await service.acceptPostulation(req.params.id, req.user.sub);
        if(!postulation) return error(res, "Postulación no encontrada", 404);
        return success(res, postulation);
    } catch (e) {
        console.error("Error: ", e);
        return error(res, e.message, 500);
    }
}

exports.rejectPostulation = async (req, res) => {
    try {
        const postulation = await service.rejectPostulation(req.params.id, req.user.sub);
        if(!postulation) return error(res, "Postulación no encontrada", 404);
        return success(res, postulation);
    } catch (e) {
        console.error("Error: ", e);
        return error(res, e.message, 500);
    }
}

exports.withdrawPostulation = async (req, res) => {
    try {
        const postulation = await service.withdrawPostulation(req.params.id, req.user.sub);
        if(!postulation) return error(res, "Postulación no encontrada", 404);
        return success(res, postulation);
    } catch (e) {
        console.error("Error: ", e);
        return error(res, e.message, 500);
    }
}