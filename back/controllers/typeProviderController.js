const service = require('../services/typeProviderService');
const { error, success } = require('../middlewares/response');

exports.getTypeProviders = async (req, res) => {
    try {
        const typeProviders = await service.getTypeProviders();
        return success(res, typeProviders);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo tipos de proveedor');
    }
}