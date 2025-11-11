const { where } = require('sequelize');
const { Interest, Category } = require('../models');

class InterestService { 
    async getInterestsByCustomer(id_customer) {
        try {
            const interests = await Interest.findAll({
                where: { id_customer: id_customer },
                include: {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                }
            });
            if(!interests) {
                return [];
            };
            return interests;
        } catch (e) {
            console.error("Error al obtener los intreses por categoria", e);
            throw e;
        }
    }
    async createInterest(interestData) {
        try {
           const existingInterest = await Interest.findOne({
            where: {
                id_customer: interestData.id_customer,
                id_category: interestData.id_category,
            }
           });

           if (existingInterest) throw new Error("El cliente ya tiene este interés agregado.");

           return await Interest.create(interestData);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async deleteInterest(id_interest) {
        try {
            const interest = Interest.findByPk(id_interest);
            
            if(!interest) return 0;

            return await Interest.destroy({
                where: {
                    id_interest: id_interest,
                }
            });
        } catch (e) {
            console.error("Error al eliminar el ineterés: ", e);
            throw e;
        }
    }
}

module.exports = new InterestService();