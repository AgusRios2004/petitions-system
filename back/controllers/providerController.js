const service = require('../services/providerService');
const response = require('../middlewares/response');
const providerService = require('../services/providerService');

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

exports.registerProvider = async(req, res) => {
    try {
        const {name, lastname, email, password, idTypeProvider, idProfession, addressId, description, isStaff} = req.body;

        const result = await service.registerProvider(
            {name, lastname, email, password, isStaff}, //user data
            {idTypeProvider, idProfession, addressId, description} //provider data
        )
        
        return response.success(res, result, 'Registrado correctamente', 201);
    } catch (e) {
        return response.error(res, e.message, 500);
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