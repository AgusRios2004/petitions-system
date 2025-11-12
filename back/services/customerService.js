const { Customer } = require('../models');
const models = require('../models');
const UserService = require('../services/userService');
const AddressService = require('../services/addressService');

class CustomerService {
    async getCustomers(){
        return await Customer.findAll({
            include: ['user'],
        });
    }

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
                'interests',
            ],
        });
    }

    async createCustomer(data){
        const existUser = User.findByPk(data.userId);
        if(!existUser) return null;
        const customer = await Customer.create({
            user_id: data.userId,
            dni: data.dni,
            phone: data.phone,
            address_id: data.addressId,
        });
        return customer;
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

    async registerCustomer(userData, customerData) {
        const user = await UserService.createUser({
            name: userData.name,
            lastname: userData.lastname,
            email: userData.email,
            password: userData.password
        });

        const customer = await Customer.create({
            dni: customerData.dni,
            phone: customerData.phone,
            address_id: customerData.addressId,
            user_id: user.id_user
        });

        return { user, customer };
    }

}

module.exports = new CustomerService();