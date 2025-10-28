const { Postulation, Inventory, sequelize, User, Provider, Petition, State } = require('../models');
const { Op } = require('sequelize');

class PostulationService {

    // --- MÉTODOS DE LECTURA (sin cambios mayores) ---

    async getAllPostulations(filter = {}) {
        // ... (código original sin cambios)
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

    async getPostulationById(id) {
        return await Postulation.findByPk(id, {
            include: [
                { 
                    model: Petition, 
                    as: 'petition', 
                    include: ['customers'] 
                },
                {
                    model: Inventory,
                    as: 'inventories',
                    include: ['article']
                },
                'createdBy',
                'updatedBy',
                'states'
            ],
        });
    }

    // --- MÉTODOS DE ESCRITURA (REFACTORIZADOS Y CORREGIDOS) ---

    async createPostulation(data, userId) {
        // ... (código original sin cambios, ya era robusto)
        const { id_petition, proposal, cost, articles } = data;
        const t = await sequelize.transaction();
        try {
            const provider = await Provider.findOne({ where: { user_id: userId } }, { transaction: t });
            if (!provider) {
                const error = new Error('Proveedor no encontrado para el usuario dado');
                error.statusCode = 403;
                throw error;
            }
            const petition = await Petition.findByPk(id_petition, { transaction: t });
            if (!petition) {
                const error = new Error('Petición no encontrada');
                error.statusCode = 404;
                throw error;
            }
            if (petition.id_state !== 3) { // Asumiendo 3 = 'Abierta' o 'Pendiente' para la petición
                const error = new Error('No se pueden crear postulaciones para una petición que no está abierta');
                error.statusCode = 400;
                throw error;
            }
            const existingPostulation = await Postulation.findOne({
                where: {
                    id_petition: id_petition,
                    id_provider: provider.id_provider,
                }
            }, { transaction: t });

            if (existingPostulation) {
                const error = new Error('Ya existe una postulación para esta petición por parte de este proveedor');
                error.statusCode = 409;
                throw error;
            }
            
            const newPostulation = await Postulation.create({
                id_petition: id_petition,
                id_provider: provider.id_provider,
                proposal: proposal,
                cost: cost,
                id_state: 3, // 3 = pendiente
                id_user_create: userId,
                winner: false,
                date_create: new Date(),
            }, { transaction: t });

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
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }
    }

    async updatePostulation(id, data) {
        // ... (código original sin cambios)
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
                date_update: new Date(),
            }, { transaction: t });

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

    async acceptPostulation(id, userId) {
        // ... (código original sin cambios, la lógica es correcta para aceptar)
        const t = await sequelize.transaction();
        try {
            const postulation = await Postulation.findByPk(id, {transaction: t});
            if(!postulation) {
                const error = new Error("Postulación no encontrada.")
                error.statusCode = 404; 
                throw error;
            }
            
            await postulation.update({
                winner: true,
                id_state: 1, // 1 = aceptada
                id_user_update: userId,
                data_update: new Date(),
            }, { transaction: t });

            const petition = await Petition.findByPk(postulation.id_petition, { transaction: t});
            if(!petition){
                const e = new Error("Petición no encontrada");
                e.statusCode = 404;
                throw e;
            }

            await petition.update({
                id_state: 1, // Asumiendo 1 = 'Cerrada' o 'Asignada' para la petición
                id_user_update: userId,
                date_update: new Date(),
            }, {transaction: t});

            await t.commit()

            return await this.getPostulationById(id);
        } catch (e) {
            await t.rollback();
            console.error("Error: ", e);
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }
    }

    /**
     * [CORREGIDO] Rechaza una postulación. Solo el cliente dueño de la petición puede hacerlo.
     * No afecta el estado de la petición.
     */
    async rejectPostulation(postulationId, userId) {
        const postulation = await Postulation.findByPk(postulationId, {
            include: [{ model: Petition, as: 'petition' }]
        });

        if (!postulation) {
            const error = new Error("Postulación no encontrada.");
            error.statusCode = 404;
            throw error;
        }

        const petitionOwner = await postulation.petition.getCustomers();
        if (petitionOwner.user_id !== userId) {
            const error = new Error("No tienes permiso para rechazar esta postulación.");
            error.statusCode = 403;
            throw error;
        }

        return await postulation.update({
            winner: false,
            id_state: 2,
            id_user_update: userId,
            date_update: new Date(),
        });
    }

    /**
     * Un proveedor retira ("se da de baja") de su propia postulación.
     * No afecta el estado de la petición.
     */
    async withdrawPostulation(postulationId, userId) {
        const postulation = await Postulation.findByPk(postulationId);

        if (!postulation) {
            const error = new Error("Postulación no encontrada.");
            error.statusCode = 404;
            throw error;
        }

        const provider = await Provider.findOne({ where: { user_id: userId } });
        if (!provider || postulation.id_provider !== provider.id_provider) {
            const error = new Error("No tienes permiso para retirar esta postulación.");
            error.statusCode = 403; // Forbidden
            throw error;
        }

        // LÓGICA CORRECTA:
        return await postulation.update({
            id_state: 4, // 4 = dado de baja / retirado
            id_user_update: userId,
            date_update: new Date(),
        });
    }

    /**
     * [NUEVO] Cambia el estado de todas las postulaciones pendientes de una petición a "cancelada".
     * Este método está diseñado para ser llamado por petitionService durante una transacción.
     */
    async cancelPostulationsForPetition(petitionId, userId, transaction) {
        return await Postulation.update(
            {
                id_state: 6, // 6 = cancelada
                id_user_update: userId,
                date_update: new Date(),
            },
            {
                where: {
                    id_petition: petitionId,
                    id_state: 3 // Solo se cancelan las que están 'pendientes'
                },
                transaction
            }
        );
    }
}

module.exports = new PostulationService();