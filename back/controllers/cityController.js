const service = require('../services/cityService');
const { error, success } = require('../middlewares/response');

exports.getCities = async (req, res) => {
    try {
        const cities = await service.getCities();
        return success(res, cities);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo ciudades');
    }
}