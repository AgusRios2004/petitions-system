const { Customer } = require('../models');
const models = require('../models');
const AddressService = require('../services/addressService');
const { httpError, parseId } = require('../middlewares/ownership');

const CUSTOMER_FIELDS = ['dni', 'phone'];
const USER_ATTRS = ['id_user', 'name', 'lastname', 'email', 'profile_image'];

class CustomerService {
    async getCustomerById(id, userId){
        const pk = parseId(id);
        if (pk === null) throw httpError(404, 'Cliente no encontrado.');
        const customer = await Customer.findByPk(pk, {
            include: [
                { association: 'user', attributes: USER_ATTRS },
                'petitions',
                {
                    model: models.Address,
                    as: 'address',
                    include: {
                        model: models.City,
                        as: 'city',
                        include: {
                            model: models.Department,
                            as: 'department',
                            include: [
                                {
                                    model: models.Province,
                                    as: 'province',
                                    include: {
                                        model: models.Country,
                                        as: 'country'
                                    }
                                },
                                {
                                    model: models.Country,
                                    as: 'country'
                                }
                            ]
                        }
                    }
                },
                {
                    model: models.Interest,
                    as: 'interests',
                    include: {
                        model: models.Category,
                        as: 'category'
                    }
                },
            ],
        });
        if (!customer) throw httpError(404, 'Cliente no encontrado.');
        if (customer.user_id !== userId) throw httpError(403, 'No es tu perfil.');
        return customer;
    }

    async updateCustomer(id, data, userId) {
        const pk = parseId(id);
        const customer = pk === null ? null : await Customer.findByPk(pk);
        if (!customer) throw httpError(404, 'Cliente no encontrado.');
        if (customer.user_id !== userId) throw httpError(403, 'No es tu perfil.');

        const { address } = data || {};
        const customerData = {};
        for (const f of CUSTOMER_FIELDS) {
            if (data && data[f] !== undefined) customerData[f] = data[f];
        }
        const hasAddress = address && typeof address === 'object';
        if (!hasAddress && Object.keys(customerData).length === 0) {
            throw httpError(400, 'No se proporcionaron datos para actualizar');
        }

        if (hasAddress) {
            // El domicilio a editar es siempre el propio, nunca el id_address del body.
            const saved = customer.address_id
                ? await AddressService.update(customer.address_id, address)
                : await AddressService.create(address);
            customerData.address_id = saved.id_address;
        }

        await customer.update(customerData);

        return await Customer.findByPk(pk, {
            include: [{ association: 'user', attributes: USER_ATTRS }, 'address', 'interests'],
        });
    }

    async deleteCustomer(){};

}

module.exports = new CustomerService();