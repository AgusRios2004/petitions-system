const service = require('../services/addressService');
const { error, success } = require('../middlewares/response');

exports.getAddresses = async (req, res) => {
    try {
        const addresses = await service.getAll();
        return success(res, addresses);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo direcciones');
    }
}

exports.getAddresById = async (req, res) => {
    try {
        const address = await service.getById(req.params.id);
        if(!address) return error(res, 'Dirección no encontrada', 404);
        return success(res, address);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo dirección');
    }
}

exports.createAddress = async (req, res) => {
    try {
        const { street, number, floor, apartment, postal_code, id_city } = req.body;
        if(!street || !number || !postal_code || !id_city) return error(res, 'Faltan datos obligatorios');
        const address = await service.create({
            street,
            number,
            floor,
            apartment,
            postal_code,
            id_city,
            date_create: new Date(),
        });
        return success(res, address, 'Dirección creada correctamente', 201);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error creando dirección');
    }
}

exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { street, number, floor, apartment, postal_code, id_city } = req.body;
        if(!street || !number || !postal_code || !id_city) return error(res, 'Faltan datos obligatorios');
        const address = await service.update(id, {
            street,
            number,
            floor,
            apartment,
            postal_code,
            id_city,
            date_update: new Date(),
        });
        if(!address) return error(res, 'Dirección no encontrada', 404);
        return success(res, address, 'Dirección actualizada correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error actualizando dirección');
    }   
}

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const ok = await service.delete(id);
        if(!ok) return error(res, 'Dirección no encontrada', 404);
        return success(res, null, 'Dirección eliminada correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error eliminando dirección');
    }
}

exports.getAddressesByCityId = async (req, res) => {
    try {
        const { id_city } = req.params;
        const addresses = await service.getAddressByCity(id_city);
        return success(res, addresses);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo direcciones por ciudad');
    }
}