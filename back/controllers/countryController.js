const service = require('../services/countryService');
const { error, success } = require('../middlewares/response');

exports.getCountries = async (req, res) => {
    try {
        const countries = await service.getCountries();
        return success(res, countries);
    } catch (e) {
        console.error('Error al obtener países:', e);
        return error(res, `Error obteniendo países: ${e.message}`);
    }
}