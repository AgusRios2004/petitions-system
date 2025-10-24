const { where } = require('sequelize');
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
            const providerWhere = { '$createdBy.provider.id_provider$': filter.id_provider };
            Object.assign(whereClause, providerWhere);
        }

        return await Postulation.findAll({
            include: includeClause,
            where: whereClause,
        });
    }

    async getPostulationByPetitionId(id_petition) {
        return await Postulation.findAll({
            include: ['petition', 'inventories', 'createdBy', 'updatedBy'],
            where: { id_petition: id_petition },
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

    async createPostulation(data, userId) {
        const { id_petition, proposal, cost, articles } = data;
        const t = await sequelize.transaction();
        try {
            // 1. VALIDACIÓN: Usamos el 'userId' del token (seguro) para encontrar al proveedor.
            const provider = await Provider.findOne({ where: { user_id: userId } }, { transaction: t });
            if (!provider) {
                const error = new Error('Proveedor no encontrado para el usuario dado');
                error.statusCode = 403;
                throw error;
            }

            // 2. VALIDACIÓN: Usamos el 'id_petition' del body para encontrar la petición.
            const petition = await Petition.findByPk(id_petition, { transaction: t });
            if (!petition) {
                const error = new Error('Petición no encontrada');
                error.statusCode = 404;
                throw error;
            }

            // 3. VALIDACIÓN: Chequeamos el estado de la petición. (Asumiendo 1 = 'Abierta')
            if (petition.id_state !== 3) {
                const error = new Error('No se pueden crear postulaciones para una petición que no está en estado "Abierta"');
                error.statusCode = 400;
                throw error;
            }
            
            // 4. VALIDACIÓN: Verificamos si ya existe una postulación.
            const existingPostulation = await Postulation.findOne({
                where: {
                    id_petition: id_petition, // Usamos la variable validada
                    id_provider: provider.id_provider, // Usamos el ID del proveedor validado
                }
            }, { transaction: t });

            if (existingPostulation) {
                const error = new Error('Ya existe una postulación para esta petición por parte de este proveedor');
                error.statusCode = 409;
                throw error;
            }
            
            // 5. CREACIÓN: Usamos las variables seguras y validadas, NO el objeto 'data' directamente.
            const newPostulation = await Postulation.create({
                id_petition: id_petition,
                id_provider: provider.id_provider,
                proposal: proposal,
                cost: cost,
                id_state: 3,
                id_user_create: userId,
                winner: false
            }, { transaction: t });

            // Lógica de inventario (ya estaba bien, solo ajustamos id_user_create)
            if (articles && articles.length > 0) {
                const inventoryData = articles.map(article => ({
                    id_article: article.id_article,
                    quantity: article.quantity,
                    cost: article.cost,
                    id_postulation: newPostulation.id_postulation,
                    id_user_create: userId,
                    date_create: new Date(),                    
                }));
                await Inventory.bulkCreate(inventoryData, { transaction: t });
            }

            await t.commit();
            return await this.getPostulationById(newPostulation.id_postulation);
        } catch (e) {
            await t.rollback();
            console.error("Error en el servicio de creación de postulación:", e);
            // Asignamos el statusCode si no viene uno en el error
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }
    }

    async updatePostulation(id, data) {
        const {proposal, cost, articles, id_user_update} = data;
        const t = await sequelize.transaction();
        try {
            const postulation = await Postulation.findByPk(id, {transaction: t});
            if(!postulation){
                const error = new Error('Postulacion no encontrada');
                error.statusCode = 404;
                throw error;
            }

            await postulation.update({
                proposal,
                cost,
                id_user_update,
            }, {transaction: t});

            await Inventory.destroy({where: {id_postulation: id}, transaction: t});

            if(articles && articles.length > 0) {
                const inventoryData = articles.map(article => ({
                    id_article: article.id_article,
                    quantity: article.quantity,
                    cost: article.cost,
                    id_postulation: postulation.id_postulation,
                    id_user_create: id_user_update,
                    date_create: new Date(),
                }));
                await Inventory.bulkCreate(inventoryData, {transaction: t});
            }

            await t.commit();
            return await this.getPostulationById(postulation.id_postulation);
        } catch (e) {
            await t.rollback();
            console.error("Error: " ,e.message);
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }
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
