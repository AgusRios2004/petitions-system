const { Customer } = require('../models');
const UserService = require('../services/userService');

class CustomerService {
    async getCustomers(){
        return await Customer.findAll();
    }

    async getCustomerById(id){
        return await Customer.findByPk(id);
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

    async updateCustomer(id, data){
        const exist = Customer.findByPk(id);
        if(!exist) return null;
        Customer.update(data);
        return Customer.findByPk(id);
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