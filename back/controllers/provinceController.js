const service = require('../services/provinceService');
const { error, success } = require('../middlewares/response');

exports.getProvinces = async (req, res) => {
    try {
        const provinces = await service.getProvinces();
        return success(res, provinces);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo provincias');
    }
}