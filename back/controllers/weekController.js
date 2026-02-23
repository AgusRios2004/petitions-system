const service = require('../services/weekService');
const { error, success } = require('../middlewares/response');

exports.getWeeks = async (req, res) => {
    try {
        const weeks = await service.getAllWeeks();
        return success(res, weeks, "Semanas encontradas");
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo semanas');
    }
}
