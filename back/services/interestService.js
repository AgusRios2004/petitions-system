const { Interest } = require('../models');

class InterestService { 
    async getInterestByCategorY(id_category) {
        try {
            const interests = await Interest.findAll({
                where: { id_category: id_category }
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
}

module.exports = new InterestService();