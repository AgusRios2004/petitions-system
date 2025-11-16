const { Provider, Addrress } = require('../models');
const userService = require('./userService');
const addressService = require('./addressService')

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

    async getProviderByIdWithDetails(id){
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
                    include: {
                        association: 'city',
                        include: {
                            association: 'department',
                            include: {
                                association: 'province',
                                include: ['country'],
                           }
                        }
                    }
                },
                'portfolios',
                {
                    association: 'providerCategories',
                    include: ['category',]
                }
            ],
        });
    }


    async createProvider(data){
        return await Provider.create(data);
    }

    async updateProvider(id, data){
        const { address, ...providerData} = data;

        const provider = await Provider.findByPk(id);

        if(!provider) {
            throw new Error('Proveedor no encontrado.')
        }

        if(address) {
            let savedAddress;
            if(address.id_address){
                savedAddress = await addressService.update(address.id_address, address);
            } else {
                savedAddress = await addressService.create(address);
            }
            provider.address_id = savedAddress.id_address;
        }

        await provider.update(providerData);

        return await this.getProviderById(provider.id_provider);
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
                {
                    association: 'providerCategories',
                    include: ['category']
                },
                {
                    association: 'availabilities',
                    include: ['week', 'fromHour', 'untilHour']
                },
                {
                    association: 'grades',
                    include: ['userCreate', 'grades']
                },
                {
                    association: 'portfolios',
                    include: ['attachments']
                }
            ],
        });
    }
}

module.exports = new ProviderService();