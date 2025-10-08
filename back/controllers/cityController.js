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

exports.getCitiesByDepartment = async (req, res) => {
    try {
        const cities = await service.getCityByDepartment(req.params.id_departament);
        return success(res, cities);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo ciudades por departamento');
    }
}