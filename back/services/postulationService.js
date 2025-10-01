const { Postulation } = require('../models');

class PostulationService {
    
    async getAllPostulations(filter = {}) {
        return await Postulation.findAll({
            include: ['petitions', 'inventories', 'createdBy', 'updatedBy'],
            where: filter,
        });
    }

    async getPostulationById(id) {
        return await Postulation.findByPk(id, {
            include: ['petitions', 'inventories', 'createdBy', 'updatedBy'],
        });
    }

    async createPostulation(data) {
        return await Postulation.create({
            id_customer: data.id_customer,
            id_petition: data.id_petition,
            proposal: data.proposal,
            cost: data.cost,
            current: data.current,
        });
    }

    async updatePostulation(id, data) {
        const postulation = await Postulation.findByPk(id);
        if(!postulation) return null;
        return await postulation.update({ 
            proposal: data.proposal,
            cost: data.cost,
            current: data.current,
            id_state: data.id_state,
            id_user_update: data.id_user_update,
         });
    }

    async deletePostulation(id, data) {
        const postulation = await Postulation.findByPk(id);
        if(!postulation) return null;
        await postulation.update({
            id_state: data.id_state,
            id_user_update: data.id_user_update,
        });
        return await postulation.findByPk(id);
    }

    async changePostulationState(id, data) {
        const postulation = await Postulation.findByPk(id);
        if(!postulation) return null;
        return await postulation.update({
            id_state: data.id_state,
            id_user_update: data.id_user_update,
        });
    }
}

module.exports = new PostulationService();