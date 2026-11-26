const service = require('../services/providerService');
const response = require('../middlewares/response');
const providerService = require('../services/providerService');
const postulationService = require('../services/postulationService');
const { parseId } = require('../middlewares/ownership');
const { Provider } = require('../models');

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

exports.getPublicProfile = async(req, res) => {
    try {
        const provider = await service.getPublicProfile(req.params.id);
        if (!provider) {
            return response.error(res, 'Perfil de proveedor no encontrado.', 404);
        }
        return response.success(res, provider, 'Perfil público del proveedor.');
    } catch (e) {
        return response.error(res, e.message, 500);
    }
}

exports.updateProvider = async(req, res) => {
    try {
        const provider = await service.updateProvider(req.params.id, req.body, req.user.sub);
        return response.success(res, provider, 'Proveedor actualizado');
    } catch (e) {
        return response.error(res, e.message, e.statusCode || 500);
    }
}

exports.deleteProvider = (req, res) => {};

exports.getProviderByIdWithDetails = async(req, res) => {
    try {
        const provider = await providerService.getProviderByIdWithDetails(req.params.id);
        
        if(!provider) return response.error(res, "Proveedor no encontrado: ", 404, e);
        
        return response.success(res, provider, "Proveedor encontrado")
    } catch (e) {
        console.error("Error obtener al proveedor: ", e);
        return response.error(res, e.message, 500, e);
    }
}

// Historial público: trabajos ganados con los campos mínimos (spec 0004).
exports.getProviderHistory = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const provider = id && await Provider.findByPk(id, { attributes: ['id_provider'] });
        if (!provider) return response.error(res, 'Proveedor no encontrado.', 404);
        const history = await postulationService.getProviderHistory(provider.id_provider);
        return response.success(res, history, 'Historial del proveedor.');
    } catch (e) {
        console.error('Error: ', e);
        return response.error(res, 'Error interno', 500);
    }
}
