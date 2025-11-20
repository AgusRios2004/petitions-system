const { Postulation, Inventory, sequelize, User, Provider, Petition, State, Customer } = require('../models');
const notificationService = require('./notificationService');
const { Op } = require('sequelize');

class PostulationService {

    // --- MÉTODOS DE LECTURA (sin cambios mayores) ---

    async getAllPostulations(filter = {}) {
        // ... (código original sin cambios)
        const whereClause = {};
        const includeClause = [
            { 
                model: Petition, 
                as: 'petition',
                include: [
                    {
                        model: Customer,
                        as: 'customers' 
                    }
                ]
            },
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

            try {
                await notificationService.createNotification({
                    id_user: petition.id_user_create,
                    title: "Nueva Postulación Recibida",
                    message: `Un proveedor se ha postulado a tu petición con una propuesta de $${cost}.`,
                    notification_type: "POSTULATION_CREATED",
                    settingKey: "postulation_created",
                    related_postulation_id: newPostulation.id_postulation,
                    related_petition_id: petition.id_petition,
                    metadata: {
                        id_customer: petition.id_customer,
                        description: petition.description,
                        id_provider: provider.id_provider,
                        proposal: proposal
                    },
                });
            } catch (notifyError) {
                // Capturamos error silenciosamente para no fallar el request si la notificación falla
                console.error("Error enviando notificación:", notifyError);
            }
            
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

            await notificationService.createNotification({
                id_user: postulation.id_user_create,
                title: 'Postulación aceptada',
                message: `El cliente aceptó tu presupuesto para "${petition.title}".`,
                notification_type: 'SUCCESS',
                settingKey: 'postulation_accepted',
                related_postulation_id: postulation.id_postulation,
                related_petition_id: petition.id_petition,
                metadata: {
                    descriptionPetition: petition.description,
                    descriptionPostulation: postulation.description
                }
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

        notificationService.createNotification({
            id_user: postulation.id_user_create,
            title: 'Postulación rechazada',
            message: 'Postulación rechazada por el cliente.',
            notification_type: 'WARNING',
            settingKey: 'postulation_rejected',
            related_postulation_id: postulation.id_postulation,
            related_petition_id: postulation.id_petition,
            metadata: {
            id_provider: postulation.id_provider,
            proposal: postulation.proposal,
            }
        })

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

        notificationService.createNotification({
            id_user: postulation.id_user_create,
            title: 'Postulación retirada',
            message: 'Postulación retirada por el proveedor.',
            notification_type: 'INFO',
            settingKey: 'postulation_state_changed',
            related_postulation_id: postulation.id_postulation,
            related_petition_id: postulation.id_petition,
            metadata: {
                id_provider: postulation.id_provider,
                proposal: postulation.proposal,
            },
        });

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
    async cancelPostulationsForPetition(petitionId, userId, transaction, newState = 6) {
        // 1. Buscamos a los afectados (dentro de la transacción para asegurar consistencia de lectura)
        const postulationsToCancel = await Postulation.findAll({
            attributes: ['id_user_create'],
            where: {
                id_petition: petitionId,
                id_state: 3 // Pendientes
            },
            transaction
        });

        // 2. Actualizamos el estado (dentro de la transacción)
        const updateResult = await Postulation.update(
            {
                id_state: newState, // Usamos el estado dinámico (5 o 6)
                id_user_update: userId,
                date_update: new Date(),
            },
            {
                where: {
                    id_petition: petitionId,
                    id_state: 3
                },
                transaction
            }
        );

        // 3. Notificaciones (SIN Transacción, "Fire & Forget")
        if (postulationsToCancel.length > 0) {
            
            // Definimos el mensaje según lo que estemos haciendo
            const isRejection = newState === 2; // Asumiendo 5 = Rechazado
            
            const notifTitle = isRejection 
                ? "Postulación Cerrada" 
                : "Petición Cancelada";
            
            const notifMessage = isRejection
                ? "El cliente ha seleccionado a otro profesional para este trabajo. Gracias por tu tiempo."
                : "La petición a la que te postulaste ha sido cancelada por el cliente.";

            const notifType = isRejection 
                ? "POSTULATION_REJECTED" 
                : "POSTULATION_CANCELLED";

            const notificationsData = postulationsToCancel.map(p => ({
                id_user: p.id_user_create,
                title: notifTitle,
                message: notifMessage,
                notification_type: notifType,
                settingKey: 'postulation_state_changed',
                related_petition_id: petitionId,
                is_read: false,
                created_at: new Date()
            }));

            // Llamamos al servicio SIN pasarle la 'transaction'.
            // Esto cumple tu requisito de no vincularlo al commit de la BD.
            // (Nota: Asegúrate de que tu método bulkCreate en el servicio acepte solo 1 argumento si no le pasas options)
            notificationService.bulkCreate(notificationsData).catch(e => console.error("Error enviando notificaciones masivas:", e));
        }

        return updateResult;
    }
}

module.exports = new PostulationService();