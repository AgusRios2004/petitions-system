const service = require('../services/countryService');
const { error, success } = require('../middlewares/response');

exports.getCountries = async (req, res) => {
    try {
        const countries = await service.getCountries();
        return success(res, countries);
    } catch (e) {
        console.error('Error al obtener países:', e); // Mostrar el error completo para facilitar el diagnóstico
        return error(res, 'Error obteniendo países');
    }
}