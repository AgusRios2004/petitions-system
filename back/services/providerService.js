const { Provider } = require('../models');
const userService = require('./userService');

class ProviderService {
    async getProviders(){
        return await Provider.findAll({
            include: ['user'],
        });
    }
    
    async getProviderById(id){
        return await Provider.findByPk(id), {
            include: ['user'],
        };
    }

    async createProvider(data){
        return await Provider.create(data);
    }

    async updateProvider(id, data){
        const ok = Provider.findByPk(id);
        if(!ok) return null;
        Provider.update(data);
        return await Provider.findByPk(id);
    }

    async registerProvider(userData, providerData){
        const user = await userService.createUser({
            name: userData.name,
            lastname: userData.lastname,
            email: userData.email,
            password: userData.password
        });
        const provider = await Provider.create({
            user_id: user.id_user,
            id_type_provider: providerData.idTypeProvider,
            id_profession: providerData.idProfession,
            address_id: providerData.addressId,
            description: providerData.description,
        });

        return {user, provider};
    }

    async deleteProvider(id){};
}

module.exports = new ProviderService();