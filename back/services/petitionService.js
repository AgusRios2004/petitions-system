const { Petition } = require('../models');

class PetitionService {
    
    /**
     * Method to get all petitions or filter by specific criteria
     * @param {*} filter 
     * @returns all petitions that match the filter
     */
    async getPetitions(filter = {}) {
        return await Petition.findAll({
            where: filter,
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    /**
     * method to get a petition by its id
     * @param {*} id 
     * @returns petition by its id
     */
    async getPetitionById(id) {
        return await Petition.findByPk(id, {
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    /**
     * mehtod to get petitions by customer id with optional filter
     * @param {*} id_customer 
     * @param {*} filter 
     * @returns all petitions by customer id and optional filter(type or state)
     */
    async getPetitionsByCustomerId(id_customer, filter = {}) {
        return await Petition.findAll({
            where: { id_customer, ...filter },
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    /**
     * method to get petitions by state
     * @param {*} id_state 
     * @returns all petitions by state
     */
    async getPetitionsByState(id_state) {
        return await Petition.findAll({
            where: { id_state },
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    /**
     * method to get petitions by type
     * @param {*} id_type_petition 
     * @returns all petitions by type
     */
    async getPetitionsByType(id_type_petition) {
        return await Petition.findAll({
            where: { id_type_petition },
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    /**
     * method to get petitions by state and type
     * @param {*} id_state 
     * @param {*} id_type_petition 
     * @returns all petitions by state and type
     */
    async getPetitionsByStateAndType(id_state, id_type_petition) {
        return await Petition.findAll({
            where: { id_state, id_type_petition },
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    /**
     * method to create a new petition
     * @param {*} petitionData 
     * @returns a new petition
     */
    async createPetition(petitionData) {
        return await Petition.create(petitionData);
    }

    /**
     * method to update a petition by its id
     * @param {*} id 
     * @param {*} petitionData 
     * @returns petition updated with its relations
     */
    async updatePetition(id, petitionData) {
        const petition = await Petition.findByPk(id);
        if (!petition) return null;
        await petition.update(petitionData);
        return await Petition.findByPk(id, {
            include: ['attachments', 'customers', 'typePetitions', 'states']
        });
    }

    /**
     * method to delete (soft delete) a petition by its id
     * @param {*} id 
     * @param {*} data 
     * @returns a petition with its state updated to deleted
     */
    async deletePetition(id, data) {
        const petition = await Petition.findByPk(id);
        if (!petition) return null;
        return await petition.update({ 
            id_state: data.id_state,
            id_user_update: data.id_user_update,
        });
    }
}

module.exports = new PetitionService();