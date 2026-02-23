const service = require('../services/professionService');
const { error, success } = require('../middlewares/response');

exports.getProfessions = async (req, res) => {
    try {
        const professions = await service.getProfessions();
        return success(res, professions);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo profesiones');
    }
}