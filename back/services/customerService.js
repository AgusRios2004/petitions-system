const { Customer } = require('../models');
const models = require('../models');
const AddressService = require('../services/addressService');

class CustomerService {
    async getCustomerById(id){
        return await Customer.findByPk(id, {
            include: [
                'user',
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
    }

    async updateCustomer(id, data) {
        const { address, ...customerData } = data;
    
        const customer = await Customer.findByPk(id);
    
        if (!customer) {
            throw new Error('Cliente no encontrado.');
        }
    
        if (address) {
            let updatedAddress;
            if (address.id_address) {
                updatedAddress = await AddressService.update(address.id_address, address);
            } else {
                updatedAddress = await AddressService.create(address);
            }
            customer.address_id = updatedAddress.id_address;
        }
    
        await customer.update(customerData);
    
        return await Customer.findByPk(id, {
            include: ['user', 'address', 'interests'],
        });
    }

    async deleteCustomer(){};

}

module.exports = new CustomerService();