const service = require('../services/providerService');
const response = require('../middlewares/response');

exports.getAllProviders = async(req, res) => {
    try {
        const providers = await service.getProviders();
        return response.success(res, providers, 'Lista de proveedores');
    } catch (e) {
        return response.error(res, e.message, 500);
    }
}

exports.getProviderById = async(req, res) =>{
    try {
        const provider = await service.getProviderById(req.params.id);
        return response.success(res, provider, 'Proveedor encontrado.');
    } catch (e) {
        return response.error(res, e.message, 500)
    }
}

exports.createProvider = async(req, res) => {
    try {
        const provider = await service.createProvider(req.body);
        return response.success(res, provider, 'Proveedor creado', 201);
    } catch (e) {
        return response.error(res, e.message, 500);
    }
}

exports.updateProvider = async(req, res) => {
    try {
        const provider = await service.updateProvider(req.params.id, req.body);
        if(!provider) return response.error(res, 'Proveedor no encontrado.', 404);
        return response.success(res, provider, 'Proveedor actualizado');
    } catch (e) {
        return response.error(res, e.message, 500);
    }
}

exports.deleteProvider = (req, res) => {};