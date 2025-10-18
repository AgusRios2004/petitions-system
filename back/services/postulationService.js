const { Postulation, Inventory, sequelize, User, Provider, Petition, State } = require('../models');

class PostulationService {
    
    async getAllPostulations(filter = {}) {
        const whereClause = {};
        const includeClause = [
            { model: Petition, as: 'petition' },
            { model: Inventory, as: 'inventories', include: ['article'] },
            { 
                model: User, 
                as: 'createdBy', 
                include: [
                    { 
                        model: Provider, 
                        as: 'provider',
                    }
                ] 
            },
            { model: User, as: 'updatedBy' },
            { model: State, as: 'states' }
        ];

        if (filter.id_state) {
            whereClause.id_state = filter.id_state;
        }
        if (filter.id_customer) {
            whereClause.id_customer = filter.id_customer;
        }
        if (filter.id_petition) {
            whereClause.id_petition = filter.id_petition;
        }
        if (filter.id_provider) {
            // This is a nested where clause to filter by provider id
            const providerWhere = { '$createdBy.provider.id_provider$': filter.id_provider };
            Object.assign(whereClause, providerWhere);
        }

        return await Postulation.findAll({
            include: includeClause,
            where: whereClause,
        });
    }

    async getPostulationByPetitionId(id_petitiion) {
        return await Postulation.findAll({
            include: ['petition', 'inventories', 'createdBy', 'updatedBy'],
            where: { id_petition: id_petitiion },
        });
    }

    async getPostulationById(id) {
        return await Postulation.findByPk(id, {
            include: [
                'petition',
                {
                    model: Inventory,
                    as: 'inventories',
                    include: ['article']
                },
                'createdBy',
                'updatedBy'
            ],
        });
    }

    async createPostulation(data) {
        const t = await sequelize.transaction();
        try {
            const newPostulation = await Postulation.create({
                id_petition: data.id_petition,
                proposal: data.proposal,
                cost: data.cost,
                id_state: data.id_state,
                id_user_create: data.id_user_create,
            }, { transaction: t });
            if (data.articles && data.articles.length > 0) {
                const inventoryData = data.articles.map(article => ({
                    id_article: article.id_article,
                    quantity: article.quantity,
                    cost: article.cost,
                    id_postulation: newPostulation.id_postulation,
                    id_user_create: data.id_user_create,
                    date_create: new Date(),                    
                }));
                await Inventory.bulkCreate(inventoryData, { transaction: t });
            }
            await t.commit();
            return await this.getPostulationById(newPostulation.idpostulation);
        } catch (e) {
            await t.rollback();
            console.error("Error en el servicio", e);
            throw e;
        }
    }

    async updatePostulation(id, data) {
        const postulation = await Postulation.findByPk(id);
        if(!postulation) return null;
        return await postulation.update({ 
            proposal: data.proposal,
            cost: data.cost,
            id_state: data.id_state,
            id_user_update: data.id_user_update,
         });
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