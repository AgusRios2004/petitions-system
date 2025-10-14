const { Petition } = require('../models');
const { Op } = require('sequelize');

class PetitionService {
    
    /**
     * Method to get all petitions with filtering, pagination, and sorting
     * @param {object} filter - The filter criteria.
     * @param {object} options - The pagination and sorting options.
     * @param {number} options.page - The current page.
     * @param {number} options.limit - The number of items per page.
     * @param {string} options.sortBy - The field to sort by.
     * @param {string} options.order - The sorting order ('ASC' or 'DESC').
     * @returns {Promise<object>} - An object with the petitions and the total count.
     */
    async getPetitions(filter = {}, options = {}) {
        const { page = 1, limit = 10, sortBy = 'date_create', order = 'DESC' } = options;
        const offset = (page - 1) * limit;

        const where = { ...filter };

        if (where.description) {
            where.description = { [Op.like]: `%${where.description}%` };
        }

        return await Petition.findAndCountAll({
            where,
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider'],
            limit,
            offset,
            order: [[sortBy, order]]
        })
    }

    /**
     * method to get a petition by its id
     * @param {*} id 
     * @returns petition by its id
     */
    async getPetitionById(id) {
        return await Petition.findByPk(id, {
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider']
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
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider']
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
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider']
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
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider']
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
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider']
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
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider']
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