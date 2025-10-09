const service = require('../services/stateService');
const { error, success } = require('../middlewares/response');

exports.getStates = async (req, res) => {
    try {
        const states = await service.getStates();
        return success(res, states);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo los estados');
    }
}

exports.getStateById = async (req, res) => {
    try {
        const { id_state } = req.params;
        const state = await service.getStateById(id_state);
        if (!state) return error(res, 'Estado no encontrado', 404);
        return success(res, state);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo estado por ID');
    }           
}

exports.createState = async (req, res) => {
    try {
        const stateData = req.body;
        // Asignar el usuario que crea desde el token
        stateData.id_user_create = req.user.sub;
        const newState = await service.createState(stateData);
        return success(res, newState, 'Estado creado correctamente', 201);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error creando el estado');
    }
}

exports.updateState = async (req, res) => {
    try {
        const { id_state } = req.params;
        const stateData = req.body;
        // Asignar el usuario que actualiza desde el token
        stateData.id_user_update = req.user.sub;
        const updatedState = await service.updateState(id_state, stateData);
        if (!updatedState) return error(res, 'Estado no encontrado', 404);
        return success(res, updatedState, 'Estado actualizado correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error actualizando el estado');
    }
}

exports.deleteState = async (req, res) => {
    try {
        const { id_state } = req.params;
        const deleted = await service.deleteState(id_state);
        if (!deleted) return error(res, 'Estado no encontrado', 404);
        return success(res, { message: 'Estado eliminado correctamente' });
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error eliminando el estado');
    }
}
