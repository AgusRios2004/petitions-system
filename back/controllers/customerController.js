const service = require('../services/customerService');
const { success, error } = require('../middlewares/response');

exports.getCustomerById = async(req, res) => {
    try {
        const customer = await service.getCustomerById(req.params.id);
        return success(res, customer, 'Cliente obtenido.');
    } catch (e) {
        return error(res, e.message, 500)
    }
}

exports.updateCustomer = async(req, res) => {
    try {
        const customer = await service.updateCustomer(req.params.id, req.body);
        if(!customer) error(res, 'Cliente no encontrado.', 404)
        success(res, customer, 'Cliente actualizado');
    } catch (e) {
        return error(res, e.message, 500);
    }
}

exports.deleteCustomer = (req, res) => {};