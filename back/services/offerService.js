const { Offer, TypeOffer, Provider, User, sequelize } = require('../models');
const { Op, where } = require('sequelize');

class OfferService {

    _getOfferIncludes() {
        return [
            {
                model: TypeOffer,
                as: 'typeOffer',
                attributes: ['id_type_offer', 'name'] // Ajusta según tu modelo real
            },
            {
                model: Provider,
                as: 'provider',
                include: [{
                    model: User,
                    as: 'user', // Asumiendo relación Provider -> User
                    attributes: ['name', 'lastname', 'profile_image']
                }]
            }
        ];
    }

    async getOffers(filter = {}, options = {}) {
        const { page = 1, limit = 10, sortBy = 'date_create', order = 'DESC' } = options;
        const offset = (page - 1) * limit;

        const where = { is_deleted: false, ...filter };

        if (where.name) {
            where.name = { [Op.like]: `%${where.name}%` };
        }
        
        // Filtro por rango de fechas (ejemplo: ofertas activas hoy)
        if (where.activeNow) {
            const now = new Date();
            where.date_open = { [Op.lte]: now };
            where.date_close = { [Op.gte]: now };
            where.status = 'active';
            delete where.activeNow;
        }

        // Filtro por categorías de interés del cliente (Categorías del Proveedor)
        if (where.categories && where.categories.length > 0) {
            const categoryIds = where.categories.join(',');
            where[Op.and] = [
                ...(where[Op.and] || []),
                sequelize.literal(`
                    EXISTS (
                        SELECT 1 
                        FROM n_provider_cateogory AS pc 
                        WHERE pc.provider_id = \`Offer\`.\`id_provider\` 
                        AND pc.category_id IN (${categoryIds})
                    )
                `)
            ];
            delete where.categories;
        }

        return await Offer.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, order]],
            include: this._getOfferIncludes(),
        });
    }

    async getOfferById(id) {
        return await Offer.findOne({
            where: { offer_id: id, is_deleted: false },
            include: this._getOfferIncludes()
        });
    }

    async createOffer(data) {
        return await Offer.create(data);
    }

    async updateOffer(id, data) {
        const offer = await Offer.findByPk(id);
        if (!offer || offer.is_deleted) return null;

        await offer.update({
            ...data,
            date_update: new Date()
        });

        return this.getOfferById(id);
    }

    async deleteOffer(id, userId) {
        const offer = await Offer.findByPk(id);
        if (!offer) return null;

        // Soft delete
        await offer.update({
            is_deleted: true,
            user_update_id: userId,
            date_update: new Date()
        });

        return offer;
    }
    async getOfferByProviderId(id) {
        return await Offer.findAll({
            where: { id_provider: id },
            include: this._getOfferIncludes(),
            order: [['date_create', 'DESC']]
        });
    }
}

module.exports = new OfferService();