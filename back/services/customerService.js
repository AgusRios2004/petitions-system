const { Customer } = require('../models');
const models = require('../models');
const AddressService = require('../services/addressService');
const { httpError, parseId } = require('../middlewares/ownership');
const { activateProfile } = require('./profileActivation');

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

    // Activa el perfil de cliente de un usuario que ya tiene otra cuenta de proveedor (spec 0002).
    // `current` son los perfiles cargados por loadProfiles ({ customer, provider }).
    async activateCustomer(userId, data, current) {
        const { dni, phone } = data || {};
        const missing = [['dni', dni], ['phone', phone]].filter(([, v]) => !v).map(([k]) => k);
        if (missing.length) throw httpError(400, `Faltan campos obligatorios: ${missing.join(', ')}`);
        return activateProfile({
            userId, data, current, kind: 'customer',
            create: (address_id, transaction) =>
                Customer.create({ user_id: userId, dni, phone, address_id }, { transaction }),
        });
    }

    async deleteCustomer(){};

}

module.exports = new CustomerService();