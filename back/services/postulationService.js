const { title } = require('process');
const { post } = require('../app');
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

    async createPostulation(data, userId, app) { // 1. Recibimos 'app' para acceder a io
        // --- DEPURACIÓN 2: Verificando si 'app' llega al servicio ---
        console.log(`[DEBUG] postulationService: Iniciando createPostulation. ¿Llegó app? ${!!app}`);

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

            // --- LÓGICA DE SOCKET.IO ---
            if (app) {
                const io = app.get('io');
                const userSocketMap = app.get('userSocketMap');
                const targetUserId = petition.id_user_create; // El ID del cliente que creó la petición

                const targetSocketId = userSocketMap.get(targetUserId);

                if (targetSocketId) {
                    // --- DEPURACIÓN 4: Confirmando que se va a emitir el evento ---
                    const postulationWithDetails = await this.getPostulationById(newPostulation.id_postulation);
                    io.to(targetSocketId).emit('new_postulation', postulationWithDetails);
                } else {
                    console.log(`[DEBUG] postulationService: FALLO. No se encontró un socket activo para el usuario con ID: ${targetUserId}. El cliente no está conectado o no está en el mapa.`);
                }
            }
            // --- FIN DE LÓGICA DE SOCKET.IO ---

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

    async acceptPostulation(id, userId, app) {
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

            // --- CORRECCIÓN ---
            // Llamamos a la función auxiliar con los parámetros correctos:
            // newState = 5 (Rechazada), y pasamos el ID del ganador para excluirlo.
            await this.cancelPostulationsForPetition(petition.id_petition, userId, t, 2, postulation.id_postulation, app);

            await t.commit()

            if (app){
                const io = app.get('io');
                const userSocketMap = app.get('userSocketMap');

                const targetUserId = postulation.id_user_create;
                const targetSocketId = userSocketMap.get(targetUserId);

                if (targetSocketId) {
                    console.log(`[DEBUG] Emitiendo 'postulation_accepted' al proveedor ${targetUserId}`);
                    const updatePostulation = await this.getPostulationById(postulation.id_postulation);
                    io.to(targetSocketId).emit('postulation_accepted', updatePostulation);
                } else {
                    console.log(`[DEBUG] FALLO. Proveedor ${targetUserId} no conectado para recibir notificación de aceptación.`);
                }
            }

            // Notificación persistente (para la "campanita") - Se ejecuta después del commit
            notificationService.createNotification({
                id_user: postulation.id_user_create, // El usuario del proveedor ganador
                title: "¡Postulación Aceptada!",
                message: `¡Felicidades! El cliente ha aceptado tu presupuesto para el trabajo: "${petition.description.substring(0, 30)}..."`,
                notification_type: "postulation_accepted", // Tipo para que el front muestre ícono verde/festejo
                settingKey: "postulation_accepted",        // Revisa la config del usuario
                related_postulation_id: postulation.id_postulation,
                related_petition_id: petition.id_petition,
                metadata: {
                    status: "winner",
                    petition_title: petition.title || petition.description,
                    descriptionPostulation: postulation.proposal // Usamos 'proposal' que es más consistente
                }
            }).catch(err => console.error("Error notificando al ganador:", err));

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
    async rejectPostulation(postulationId, userId, app) {
        try {
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
    
            if(app) {
                const io = app.get('io');
                const userSocketMap = app.get('userSocketMap');
    
                const targetUserId = postulation.id_user_create;
                const targetSocketId = userSocketMap.get(targetUserId);
    
                if (targetSocketId) {
                    io.to(targetSocketId).emit('postulation_rejected',{
                        id_postulation: postulation.id_postulation,
                        id_petition: postulation.id_petition,
                        title: 'Postulación rechazada',
                        message: 'El cliente ha decidido no continuar con esta propuesta.'
                    });
                }
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
            });
    
            return await postulation.update({
                winner: false,
                id_state: 2,
                id_user_update: userId,
                date_update: new Date(),
            });
        } catch (e) {
            console.error("Error en rejectPostulation:", e);
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }
    }

    /**
     * Un proveedor retira ("se da de baja") de su propia postulación.
     * No afecta el estado de la petición.
     */
    async withdrawPostulation(postulationId, userId, app) {
        const postulation = await Postulation.findByPk(postulationId, {
            include: {model: Petition, as: 'petition'}
        });

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

        if(app) {
            const io = app.get('io');
            const userSocketMap = app.get('userSocketMap');

            const targetSocketId = userSocketMap.get(targetUserId);
            const targetUserId = postulation.petition.id_user_create;

            if(targetSocketId) {
                
                io.to(targetSocketId).emit('postulation_withdrawn', {
                    title: "Postulación retirada",
                    message: `El proveedor ha retirado su propuesta para "${postulation.petition.title || 'tu petición'}".`,
                    id_petition: postulation.id_petition,
                    id_postulation: postulation.id_postulation,
                });
            }
        }

        notificationService.createNotification({
            id_user: postulation.petition.id_user_create,
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
     * Cancela o Rechaza postulaciones masivamente.
     * @param {number} petitionId 
     * @param {number} userId 
     * @param {object} transaction 
     * @param {number} newState - 6 (Cancelada) o 5 (Rechazada)
     * @param {number|null} winnerPostulationId - [NUEVO] ID del ganador para excluirlo.
     */
    async cancelPostulationsForPetition(petitionId, userId, transaction, newState = 6, winnerPostulationId = null, app) {
        
        // A. Configurar el filtro (Excluir ganador si existe)
        const whereCondition = {
            id_petition: petitionId,
            id_state: 3 // Pendientes
        };

        if (winnerPostulationId) {
            whereCondition.id_postulation = { [Op.ne]: winnerPostulationId };
        }

        // B. Buscar afectados
        const postulationsToCancel = await Postulation.findAll({
            attributes: ['id_user_create'], // Solo necesitamos el ID
            where: whereCondition,
            transaction
        });

        // C. Actualizar estado
        const updateResult = await Postulation.update(
            {
                id_state: newState,
                id_user_update: userId,
                date_update: new Date(),
            },
            {
                where: whereCondition,
                transaction
            }
        );

        // D. Notificaciones
        if (postulationsToCancel.length > 0) {
            if (newState === 6) {
                // Cancelación total
                notificationService.notifyPetitionCancelled(petitionId, postulationsToCancel, app)
                    .catch(e => console.error("Error notifyPetitionCancelled:", e));
            }
            // CORRECCIÓN: Usamos el estado 2 (Rechazada) y pasamos 'app'
            else if (newState === 2) {
                // Pasamos 'app' a la función que notifica a los proveedores rechazados
                notificationService.notificationRejectProviders(petitionId, winnerPostulationId, app)
                    .catch(e => console.error("Error notifyPostulationsRejected:", e));
            }
        }

        return updateResult;
    }

}

module.exports = new PostulationService();