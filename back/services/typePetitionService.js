const { TypePetition } = require('../models');

class TypePetitionService {

    async getTypePetitions() {
        return await TypePetition.findAll();
    }

    async getTypePetitionById(id) {
        return await TypePetition.findByPk(id);
    }

    async createTypePetition(data) {
        return await TypePetition.create(data);
    }

    async updateTypePetition(id, data) {
        const typePetition = await TypePetition.findByPk(id);
        if (!typePetition) {
            return null;
        }
        return await typePetition.update(data);
    }

    async deleteTypePetition(id) {
        const typePetition = await TypePetition.findByPk(id);
        if (!typePetition) {
            return null;
        }
        await typePetition.destroy();
        return true;
    }
}

module.exports = new TypePetitionService();
