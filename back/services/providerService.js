const { Provider, Addrress } = require('../models');
const addressService = require('./addressService')
const { httpError, parseId } = require('../middlewares/ownership');
const { activateProfile } = require('./profileActivation');

const PROVIDER_FIELDS = ['id_type_provider', 'id_profession', 'description'];

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


    async updateProvider(id, data, userId){
        const pk = parseId(id);
        const provider = pk === null ? null : await Provider.findByPk(pk);
        if(!provider) throw httpError(404, 'Proveedor no encontrado.');
        if(provider.user_id !== userId) throw httpError(403, 'No es tu perfil.');

        const { address } = data || {};
        const providerData = {};
        for (const f of PROVIDER_FIELDS) {
            if (data && data[f] !== undefined) providerData[f] = data[f];
        }
        const hasAddress = address && typeof address === 'object';
        if (!hasAddress && Object.keys(providerData).length === 0) {
            throw httpError(400, 'No se proporcionaron datos para actualizar');
        }

        if(hasAddress) {
            // El domicilio a editar es siempre el propio, nunca el id_address del body.
            const saved = provider.address_id
                ? await addressService.update(provider.address_id, address)
                : await addressService.create(address);
            providerData.address_id = saved.id_address;
        }

        await provider.update(providerData);

        return await this.getProviderById(provider.id_provider);
    }

    // Activa el perfil de proveedor de un usuario que ya es cliente (spec 0002).
    async activateProvider(userId, data, current) {
        const { id_profession, id_type_provider, description } = data || {};
        const missing = [['id_profession', id_profession], ['id_type_provider', id_type_provider], ['description', description]]
            .filter(([, v]) => !v).map(([k]) => k);
        if (missing.length) throw httpError(400, `Faltan campos obligatorios: ${missing.join(', ')}`);
        return activateProfile({
            userId, data, current, kind: 'provider',
            create: (address_id, transaction) =>
                Provider.create({ user_id: userId, id_profession, id_type_provider, description, address_id }, { transaction }),
        });
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