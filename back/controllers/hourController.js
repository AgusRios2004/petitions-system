const service = require('../services/hourService');
const { error, success } = require('../middlewares/response');

exports.getHours = async (req, res) => {
    try {
        const hours = await service.getAllHours();
        return success(res, hours, "Horas encontradas");       
    } catch (e) {
        console.error("Error: ", e);
        return error(res, 'Error obteniendo horas');
    }
}