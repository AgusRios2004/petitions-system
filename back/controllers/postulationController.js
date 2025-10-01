const service = require('../services/postulationService');
const { error, success } = require('../middlewares/response');

exports.getAllPostulations = async (req, res) => {
    try {
        const { id_state, id_customer, id_petition } = req.query;
        const filter = {};
        if (id_state) filter.id_state = id_state;
        if (id_customer) filter.id_customer = id_customer;
        if (id_petition) filter.id_petition = id_petition;
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
        const postulation = await service.createPostulation(req.body);
        return success(res, postulation, 201);
    } catch (e) {
        return error(res, e.message, 500);
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

exports.deletePostulation = async (req, res) => {
    try {
        const postulation = await service.deletePostulation(req.params.id, req.body);
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