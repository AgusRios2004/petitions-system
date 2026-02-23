const service = require('../services/typePetitionService');
const { error, success } = require('../middlewares/response');

exports.getTypePetitions = async (req, res) => {
    try {
        const typePetitions = await service.getTypePetitions();
        return success(res, typePetitions);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo tipos de petición');
    }
}

exports.getTypePetitionById = async (req, res) => {
    try {
        const { id_type_petition } = req.params;
        const typePetition = await service.getTypePetitionById(id_type_petition);
        if (!typePetition) return error(res, 'Tipo de petición no encontrado', 404);
        return success(res, typePetition);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo tipo de petición por ID');
    }
}

exports.createTypePetition = async (req, res) => {
    try {
        const typePetitionData = req.body;
        typePetitionData.id_user_create = req.user.sub;
        const newTypePetition = await service.createTypePetition(typePetitionData);
        return success(res, newTypePetition, 'Tipo de petición creado correctamente', 201);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error creando tipo de petición');
    }
}

exports.updateTypePetition = async (req, res) => {
    try {
        const { id_type_petition } = req.params;
        const typePetitionData = req.body;
        typePetitionData.id_user_update = req.user.sub;
        const updatedTypePetition = await service.updateTypePetition(id_type_petition, typePetitionData);
        if (!updatedTypePetition) return error(res, 'Tipo de petición no encontrado', 404);
        return success(res, updatedTypePetition, 'Tipo de petición actualizado correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error actualizando tipo de petición');
    }
}

exports.deleteTypePetition = async (req, res) => {  
    try {
        const { id_type_petition } = req.params;
        const deleted = await service.deleteTypePetition(id_type_petition);
        if (!deleted) return error(res, 'Tipo de petición no encontrado', 404);
        return success(res, { message: 'Tipo de petición eliminado correctamente' });
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error eliminando tipo de petición');
    }   
}
