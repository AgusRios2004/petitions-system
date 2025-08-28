const { Petition } = require('../models');

class PetitionService {
    
    async getPetitions(filter = {}) {
        return await Petition.findAll({
            where: filter,
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    async getPetitionById(id) {
        return await Petition.findByPk(id, {
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    async getPetitionsByCustomerId(id_customer, filter = {}) {
        return await Petition.findAll({
            where: { id_customer, ...filter },
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    async getPetitionsByState(id_state) {
        return await Petition.findAll({
            where: { id_state },
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    async getPetitionsByType(id_type_petition) {
        return await Petition.findAll({
            where: { id_type_petition },
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    async getPetitionsByStateAndType(id_state, id_type_petition) {
        return await Petition.findAll({
            where: { id_state, id_type_petition },
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    async createPetition(petitionData) {
        return await Petition.create(petitionData);
    }

    async updatePetition(id, petitionData) {
        const petition = await Petition.findByPk(id);
        if (!petition) return null;
        await petition.update(petitionData);
        return await Petition.findByPk(id, {
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    async deletePetition(id, id_state) {
        const petition = await Petition.findByPk(id);
        if (!petition) return null;
        return await petition.update({ id_state }); // 💡 mejor así que pasando id_state "crudo"
    }
}

module.exports = new PetitionService();
