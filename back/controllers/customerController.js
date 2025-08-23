const service = require('../services/customerService');
const { success, error } = require('../middlewares/response');

exports.getAllCustomers = async(req, res) => {
    try {
        const customers = await service.getCustomers();
        return success(res, customers, 'Lista de clientes.');  
    } catch (e) {
        return error(res, e.message, 500);
    } 
}

exports.getCustomerById = async(req, res) => {
    try {
        const customer = await service.getCustomerById(req.params.id);
        return success(res, customer, 'Cliente obtenido.');
    } catch (e) {
        return error(res, e.message, 500)
    }
}

exports.createCustomer = async(req, res) => {
    try {
        const customer = await service.createCustomer(req.body);
        return success(res, customer, 'Cliente creado', 201);
    } catch (e) {
        return error(res, e.message, 400);
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

exports.registerCustomer = async (req, res) => {
    try {
        const { name, lastname, email, password, dni, phone, addressId } = req.body;

        const result = await service.registerCustomer(
            { name, lastname, email, password }, //user data
            { dni, phone, addressId } //customer data
        );

        return success(res, result, 'Registro completado correctamente', 201);
    } catch (e) {
        return error(res, e.message, 400);
    }
};

exports.deleteCustomer = (req, res) => {};