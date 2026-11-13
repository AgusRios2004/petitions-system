const service = require('../services/customerService');
const { success, error } = require('../middlewares/response');

exports.getCustomerById = async(req, res) => {
    try {
        const customer = await service.getCustomerById(req.params.id, req.user.sub);
        return success(res, customer, 'Cliente obtenido.');
    } catch (e) {
        return error(res, e.message, e.statusCode || 500)
    }
}

exports.updateCustomer = async(req, res) => {
    try {
        const customer = await service.updateCustomer(req.params.id, req.body, req.user.sub);
        return success(res, customer, 'Cliente actualizado');
    } catch (e) {
        return error(res, e.message, e.statusCode || 500);
    }
}

exports.deleteCustomer = (req, res) => {};