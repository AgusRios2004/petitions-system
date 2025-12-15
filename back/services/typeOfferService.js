const { TypeOffer } = require('../models');
const { Op } = require('sequelize');

class TypeOfferService {

    async getAllTypeOffers(filter = {}) {
        const where = { ...filter };
        
        // Si quieres filtrar por nombre parcial
        if (where.name) {
            where.name = { [Op.like]: `%${where.name}%` };
        }

        return await TypeOffer.findAll({
            where,
            order: [['name', 'ASC']]
        });
    }

    async getTypeOfferById(id) {
        return await TypeOffer.findByPk(id);
    }

    async createTypeOffer(data) {
        return await TypeOffer.create({
            ...data,
            date_create: new Date(),
            date_update: new Date()
        });
    }

    async updateTypeOffer(id, data) {
        const typeOffer = await TypeOffer.findByPk(id);
        if (!typeOffer) return null;

        await typeOffer.update({
            ...data,
            date_update: new Date()
        });

        return typeOffer;
    }

    async deleteTypeOffer(id) {
        // Nota: En tu SQL esta tabla no tiene 'is_deleted', así que hacemos borrado físico
        // Ojo con la integridad referencial si ya hay ofertas usando este tipo.
        const deleted = await TypeOffer.destroy({
            where: { id_type_offer: id }
        });
        return deleted > 0;
    }
}

module.exports = new TypeOfferService();