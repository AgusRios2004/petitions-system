const { Provider } = require('../models');
const userService = require('./userService');

class ProviderService {
    async getProviders(){
        return await Provider.findAll({
            include: [
                'user',
                {
                    association: 'availabilities',
                    include: ['week', 'fromHour', 'untilHour']
                },
                {
                    association: 'address',
                    include: ['city']
                }
            ],
        });
    }
    
    async getProviderById(id){
        return await Provider.findByPk(id, {
            include: [
                'user',
                {
                    association: 'availabilities',
                    include: ['week', 'fromHour', 'untilHour']
                },
                'profession',
                'typeProvider',
                {
                    association: 'address',
                    include: ['city']
                },
                'portfolios',
                'providerCategories'
            ],
        });
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
            password: userData.password,
            is_staff: userData.isStaff,
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

    async getPublicProfile(id){
        return await Provider.findByPk(id, {
            include: [
                'user',
                'profession',
                'typeProvider',
                {
                    association: 'address',
                    include: ['city']
                },
                'providerCategories',
                {
                    association: 'availabilities',
                    include: ['week', 'fromHour', 'untilHour']
                },
                'grades',
                'portfolios'
            ],
        });
    }
}

module.exports = new ProviderService();