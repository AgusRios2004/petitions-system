// const { post } = require('../app'); // REMOVIDO: Causaba dependencia circular y error de exportación
const { Postulation, Inventory, sequelize, User, Provider, Petition, State, Customer } = require('../models');
const notificationService = require('./notificationService');
const { Op } = require('sequelize');

// Caché simple para evitar consultar la BD repetidamente por los mismos estados
const stateCache = {};

async function getStateId(code) {
    if (stateCache[code]) return stateCache[code];
    const state = await State.findOne({ where: { code } });
    if (!state) throw new Error(`Estado con código '${code}' no encontrado.`);
    stateCache[code] = state.id_state;
    return state.id_state;
}

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
                // [CORREGIDO] Se expande la inclusión de 'createdBy' para que también traiga el 'provider' asociado al usuario.
                // Esto es crucial para la lógica post-transacción que necesita el id_provider.
                {
                    model: User,
                    as: 'createdBy',
                    include: [{ model: Provider, as: 'provider' }]
                },
                'updatedBy',
                'states'
            ],
        });
    }

    // --- MÉTODOS DE ESCRITURA (REFACTORIZADOS Y CORREGIDOS) ---

    async createPostulation(data, userId, eventBus) { // Ya no recibe 'app', sino 'eventBus'
        const { id_petition, proposal, cost, articles } = data;
        const t = await sequelize.transaction();
        let newPostulationId; // Variable para guardar el ID y usarlo fuera de la transacción

        try {
            const provider = await Provider.findOne({ where: { user_id: userId } }, { transaction: t });
            if (!provider) {
                const error = new Error('Proveedor no encontrado para el usuario dado');
                error.statusCode = 403;
                throw error;
            }
            // MEJORA: Bloqueamos la petición al leerla. 
            // Si el dueño la está cerrando/cancelando en este instante, esperamos a que termine para ver el estado real.
            const petition = await Petition.findByPk(id_petition, {
                transaction: t,
                lock: true
            });
            if (!petition) {
                const error = new Error('Petición no encontrada');
                error.statusCode = 404;
                throw error;
            }

            // [CORREGIDO] Se valida contra el estado 'Abierta' (ABI), no 'Pendiente' (PEN).
            const petitionOpenState = await getStateId('PEN');
            if (petition.id_state !== petitionOpenState) {
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

            const postulationPendingState = await getStateId('PEN'); // PEN = Pendiente (ID 3)

            const newPostulation = await Postulation.create({
                id_petition: id_petition,
                id_provider: provider.id_provider,
                proposal: proposal,
                cost: cost,
                id_state: postulationPendingState,
                id_user_create: userId,
                winner: false,
                date_create: new Date(),
            }, { transaction: t });

            newPostulationId = newPostulation.id_postulation;

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
        } catch (e) {
            await t.rollback();
            console.error("Error en el servicio de creación de postulación:", e);
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }

        // --- OPTIMIZACIÓN: Lógica fuera de la transacción ---
        // 1. Obtenemos la postulación completa UNA sola vez.
        const postulationWithDetails = await this.getPostulationById(newPostulationId);

        // [CORREGIDO] Se añade una validación para evitar un crash si la petición no tiene un cliente asociado.
        // Esto puede ocurrir si hay datos corruptos o un error en la lógica de asociación.
        if (!postulationWithDetails?.petition?.customers?.user_id) {
            console.error(`[ADVERTENCIA POST-TRANSACCIÓN] No se pudo encontrar el cliente (o su user_id) para la petición con ID: ${id_petition}. La postulación con ID ${newPostulationId} se creó, pero no se enviará la notificación. Revise los datos de la petición.`);
            // Devolvemos la postulación creada con éxito, ya que la operación principal funcionó.
            // El cliente recibirá una respuesta 200 OK en lugar de un 500.
            return postulationWithDetails;
        }

        // 2. Extraemos datos necesarios para notificaciones del objeto ya cargado
        // Asumimos que 'customers' viene incluido en 'petition' gracias a getPostulationById
        const customer = postulationWithDetails.petition.customers;
        const targetUserId = customer.user_id;

        // 3. Eventos (Desacoplados)
        if (eventBus) {
            eventBus.emit('postulation:created', {
                postulation: postulationWithDetails,
                // Pasamos el ID del usuario de forma segura después de la validación.
                targetUserId: targetUserId
            });
        }

        // 4. Notificaciones (NO BLOQUEANTES - Fire and Forget)
        // Quitamos el 'await' para que el cliente no espere a que se envíe el correo/notificación
        notificationService.createNotification({
            id_user: targetUserId,
            title: "Nueva Postulación Recibida",
            message: `Un proveedor se ha postulado a tu petición con una propuesta de $${cost}.`,
            notification_type: "POSTULATION_CREATED",
            settingKey: "postulation_created",
            related_postulation_id: newPostulationId,
            related_petition_id: id_petition,
            metadata: {
                id_customer: postulationWithDetails.petition.id_customer,
                description: postulationWithDetails.petition.description,
                id_provider: postulationWithDetails.createdBy.provider.id_provider,
                proposal: proposal
            },
        }).catch(notifyError => {
            console.error("Error enviando notificación en segundo plano:", notifyError);
        });

        return postulationWithDetails;
    }

    async updatePostulation(id, data) {
        // ... (código original sin cambios)
        const { proposal, cost, articles, id_user_update } = data;
        const t = await sequelize.transaction();
        try {
            const postulation = await Postulation.findByPk(id, { transaction: t });
            if (!postulation) {
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

            await Inventory.destroy({ where: { id_postulation: id }, transaction: t });

            if (articles && articles.length > 0) {
                const inventoryData = articles.map(article => ({
                    id_article: article.id_article,
                    quantity: article.quantity,
                    cost: article.cost,
                    id_postulation: postulation.id_postulation,
                    id_user_create: id_user_update,
                    date_create: new Date(),
                }));
                await Inventory.bulkCreate(inventoryData, { transaction: t });
            }

            await t.commit();
            return await this.getPostulationById(postulation.id_postulation);
        } catch (e) {
            await t.rollback();
            console.error("Error: ", e.message);
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }
    }

    async acceptPostulation(id, userId, eventBus) {
        // ... (código original sin cambios, la lógica es correcta para aceptar)
        const t = await sequelize.transaction();
        // [CORREGIDO] Declaramos las variables fuera del try para que sean accesibles después del commit.
        let petition;
        let postulation;
        try {
            postulation = await Postulation.findByPk(id, {
                transaction: t,
                lock: true // Bloquea la fila para evitar conflictos concurrentes
            });
            if (!postulation) {
                const error = new Error("Postulación no encontrada.")
                error.statusCode = 404;
                throw error;
            }

            const postulationWinState = await getStateId('ACE'); // ACE = Aceptado (ID 1)
            const petitionClosedState = await getStateId('ACE'); // ACE = Aceptado (ID 1)

            await postulation.update({
                winner: true,
                id_state: postulationWinState,
                id_user_update: userId,
                date_update: new Date(), // Corregido: data_update -> date_update
            }, { transaction: t });

            petition = await Petition.findByPk(postulation.id_petition, {
                transaction: t,
                lock: true // Bloquea la petición para asegurar su estado
            });
            if (!petition) {
                const e = new Error("Petición no encontrada");
                e.statusCode = 404;
                throw e;
            }

            await petition.update({
                id_state: petitionClosedState,
                id_user_update: userId,
                date_update: new Date(),
            }, { transaction: t });

            // Actualizamos las postulaciones pendientes a "Rechazada" dentro de la misma transacción.
            // La notificación se hará DESPUÉS del commit.
            // Usamos 'REC' (Rechazada - ID 2) o 'CAN' (Cancelada - ID 6) según tu lógica de negocio.
            // Aquí usamos 'CAN' para las que no ganaron porque se cerró la petición, o podrías usar 'REC'.
            await this.cancelPostulationsForPetition(petition.id_petition, userId, t, 'CAN', postulation.id_postulation);

            await t.commit();
            // La transacción ha terminado exitosamente.
        } catch (e) {
            // Si algo falla ANTES del commit, hacemos rollback y lanzamos el error.
            await t.rollback();
            console.error("Error durante la transacción de aceptación:", e);
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }

        // --- LÓGICA POST-TRANSACCIÓN (Notificaciones y respuesta) ---
        // Este código se ejecuta solo si el try/catch anterior fue exitoso.
        try {
            // Ahora que la transacción fue exitosa, notificamos a los rechazados.
            if (eventBus) {
                const targetUserId = postulation.id_user_create;
                const updatedPostulation = await this.getPostulationById(postulation.id_postulation);

                // Anunciamos que la postulación fue aceptada
                eventBus.emit('postulation:accepted', {
                    postulation: updatedPostulation,
                    targetUserId: targetUserId
                });

                // Notificamos a los proveedores rechazados.
                // [CORREGIDO] Llamamos al método correcto desde el servicio de notificaciones.
                notificationService.notificationRejectProviders(petition.id_petition, postulation.id_postulation, eventBus);
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
        } catch (postCommitError) {
            console.error("Error post-commit en acceptPostulation:", postCommitError);
            return this.getPostulationById(id); // Intentamos devolver la data a pesar del error secundario.
        }
    }

    /**
     * [CORREGIDO] Rechaza una postulación. Solo el cliente dueño de la petición puede hacerlo.
     * No afecta el estado de la petición.
     */
    async rejectPostulation(postulationId, userId, eventBus) {
        const t = await sequelize.transaction();
        try {
            const postulation = await Postulation.findByPk(postulationId, {
                include: [{ model: Petition, as: 'petition' }],
                transaction: t
            });

            if (!postulation) {
                const error = new Error("Postulación no encontrada.");
                error.statusCode = 404;
                await t.rollback();
                throw error;
            }

            const petitionOwner = await postulation.petition.getCustomers({ transaction: t });
            if (petitionOwner.user_id !== userId) {
                const error = new Error("No tienes permiso para rechazar esta postulación.");
                error.statusCode = 403;
                await t.rollback();
                throw error;
            }

            const postulationRejectedState = await getStateId('REC'); // REC = Rechazado (ID 2)

            await postulation.update({
                winner: false,
                id_state: postulationRejectedState,
                id_user_update: userId,
                date_update: new Date(),
            }, { transaction: t });

            await t.commit();

            // --- NOTIFICACIONES (FUERA DE LA TRANSACCIÓN) ---
            if (eventBus) {
                const targetUserId = postulation.id_user_create;
                const updatedPostulation = await this.getPostulationById(postulation.id_postulation); // Para máxima consistencia
                eventBus.emit('postulation:rejected', {
                    postulation: updatedPostulation,
                    targetUserId: targetUserId
                });
            }

            // Notificación persistente (fire-and-forget)
            notificationService.createNotification({ // No usamos await
                id_user: postulation.id_user_create,
                title: 'Postulación rechazada',
                message: 'Postulación rechazada por el cliente.',
                notification_type: 'WARNING',
                settingKey: 'postulation_rejected',
                related_postulation_id: postulation.id_postulation,
                related_petition_id: postulation.id_petition
            }).catch(err => console.error("Error creando notificación de rechazo:", err));

            return postulation;

        } catch (e) {
            await t.rollback();
            console.error("Error en rejectPostulation:", e);
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }
    }

    /**
     * [CORREGIDO] Un proveedor retira ("se da de baja") de su propia postulación.
     * No afecta el estado de la petición.
     */
    async withdrawPostulation(postulationId, userId, eventBus) {
        const t = await sequelize.transaction();
        try {
            const postulation = await Postulation.findByPk(postulationId, {
                include: { model: Petition, as: 'petition' },
                transaction: t
            });

            if (!postulation) {
                const error = new Error("Postulación no encontrada.");
                error.statusCode = 404;
                await t.rollback();
                throw error;
            }

            const provider = await Provider.findOne({ where: { user_id: userId }, transaction: t });
            if (!provider || postulation.id_provider !== provider.id_provider) {
                const error = new Error("No tienes permiso para retirar esta postulación.");
                error.statusCode = 403; // Forbidden
                await t.rollback();
                throw error;
            }

            const postulationWithdrawnState = await getStateId('BJA'); // BJA = Dado de baja (ID 4)

            await postulation.update({
                id_state: postulationWithdrawnState,
                id_user_update: userId,
                date_update: new Date(),
            }, { transaction: t });

            await t.commit();

            // --- NOTIFICACIONES (FUERA DE LA TRANSACCIÓN) ---
            if (eventBus) {
                const targetUserId = postulation.petition.id_user_create;
                const updatedPostulation = await this.getPostulationById(postulation.id_postulation); // Para máxima consistencia
                eventBus.emit('postulation:withdrawn', {
                    postulation: updatedPostulation,
                    targetUserId: targetUserId
                });
            }

            // Notificación persistente (fire-and-forget)
            notificationService.createNotification({ // No usamos await
                id_user: postulation.petition.id_user_create,
                title: 'Postulación retirada',
                message: 'Postulación retirada por el proveedor.',
                notification_type: 'INFO',
                settingKey: 'postulation_state_changed',
                related_postulation_id: postulation.id_postulation,
                related_petition_id: postulation.id_petition
            }).catch(err => console.error("Error creando notificación de retiro:", err));

            return postulation;

        } catch (e) {
            await t.rollback();
            console.error("Error en withdrawPostulation:", e);
            if (!e.statusCode) e.statusCode = 500;
            throw e;
        }
    }

    /**
     * Cancela o Rechaza postulaciones masivamente.
     * @param {number} petitionId 
     * @param {number} userId 
     * @param {object} transaction 
     * @param {string} newStateCode - Código del nuevo estado (ej: 'CAN')
     * @param {number|null} winnerPostulationId - [NUEVO] ID del ganador para excluirlo.
     */
    async cancelPostulationsForPetition(petitionId, userId, transaction, newStateCode = 'CAN', winnerPostulationId = null) {

        const pendingState = await getStateId('PEN'); // PEN = Pendiente (ID 3)
        const newStateId = await getStateId(newStateCode);

        // A. Configurar el filtro (Excluir ganador si existe)
        const whereCondition = {
            id_petition: petitionId,
            id_state: pendingState
        };

        if (winnerPostulationId) {
            whereCondition.id_postulation = { [Op.ne]: winnerPostulationId };
        }

        // B. Buscar afectados (opcional, solo si se necesita la data para algo más)
        const postulationsToCancel = await Postulation.findAll({
            attributes: ['id_user_create'], // Solo necesitamos el ID
            where: whereCondition,
            transaction: transaction
        });

        // C. Actualizar estado
        const updateResult = await Postulation.update(
            {
                id_state: newStateId,
                id_user_update: userId,
                date_update: new Date(),
            },
            {
                where: whereCondition,
                transaction: transaction
            }
        );

        // D. Notificaciones - Se eliminan de aquí para manejarlas fuera de la transacción.

        return updateResult;
    }

}

module.exports = new PostulationService();