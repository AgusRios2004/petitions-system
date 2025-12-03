const { title } = require('process');
const { Notification, NotificationSettings, sequelize, User, Provider, Postulation } = require('../models');
const { where, Op} = require('sequelize');

class NotificationService {
    async createNotification(dataNotification) {
        try {
            const [settings] = await NotificationSettings.findOrCreate({
                where: { id_user: dataNotification.id_user },
                defaults: { id_user: dataNotification.id_user },
            });

            if (dataNotification.settingKey && settings && settings[dataNotification.settingKey] === false) {
                // CORRECCIÓN 3: dataNotification.id_user
                console.log(`Notificación omitida por configuración de usuario ${dataNotification.id_user}`);
                return null;
            };

            const createdNotification = await Notification.create({
                id_user: dataNotification.id_user,
                title: dataNotification.title,
                message: dataNotification.message,
                notification_type: dataNotification.notification_type,
                related_postulation_id: dataNotification.related_postulation_id,
                related_petition_id: dataNotification.related_petition_id,
                metadata: dataNotification.metadata,
            });
            
            return createdNotification;
        } catch (e) {
            console.log("Error al crear notificación (Ignorado): ", e);
            return null;
        }
    }
 
    async getNotifications(id_user, limit = 20, offset = 0){
        try {
            const notifications = await Notification.findAll({
                where: { id_user: id_user },
                order: [['created_at', 'DESC']],
                limit,
                offset,
            });

            return notifications;
        } catch (e) {
            console.error("Error: ", e);
            throw e;
        }
    }

    async getUnreadNotifications(id_user){
        try {
            const notifications = await Notification.findAll({
                where: { id_user: id_user, is_read: false },
                order: [['created_at', 'DESC']],
            });

            return notifications;
        } catch (error) {
            console.log("Error: ", error);
            throw error;
        }
    }

    async markRead(id_user, id_notification){
        try {
            const notification = await Notification.update(
                {is_read: true, read_at: new Date()},
                {where: {id_user: id_user, id: id_notification}},
            );

            return notification;
        } catch (e) {
            console.log("Error: ", e)
            throw e;
        }
    }

    async markAllRead(id_user){
        try {
            const notifications = await Notification.update(
                {is_read: true, read_at: new Date()},
                {where: {id_user: id_user }},
            );

            return notifications;
        } catch (e) {
            console.log("Error: ", e)
            throw e;
        }
    }

    async notificationMatchingProvider(petition, eventBus){
        try {
            const matchingProviders = await Provider.findAll({
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id_user'],
                    },
                ],
                where: {
                    [Op.and]: [
                        sequelize.literal(`
                            EXISTS (
                                SELECT 1 
                                FROM n_provider_cateogory pc
                                JOIN n_interest i ON i.id_category = pc.category_id
                                WHERE i.id_customer = ${sequelize.escape(petition.id_customer)}
                                AND pc.provider_id = \`Provider\`.\`id_provider\`
                            )
                        `)
                    ]
                }
            });

            if (!matchingProviders || matchingProviders.length === 0) return null;

            // --- LÓGICA DE EVENTOS (DESACOPLADA) ---
            if (eventBus) {
                eventBus.emit('notification:new-petition-match', {
                    petition: petition,
                    matchingProviders: matchingProviders
                });
            }

            const notificationData = matchingProviders.map(provider => ({
                id_user: provider.user.id_user,
                title: "Nueva opostunidad laboral",
                message: `Un cliente hizo una petición con una categoría que manejas: ${petition.description.substring(0,30)}`,
                notification_type: "petition_created",
                related_petition_id: petition.id_petition,
                is_read: false,
                create_at: new Date(),
                metadata: {
                    id_provider: provider.id_provider,
                    description: petition.description,
                }
            }));

            await Notification.bulkCreate(notificationData);
        } catch (e) {
            console.log("Error: ", e);
        }
    }

    /**
     * Notifica a los proveedores que NO fueron elegidos.
     * @param {number} id_petition - El ID de la petición que se cerró.
     * @param {number} acceptedPostulationId - El ID de la postulación ganadora (para excluirla).
     */
    async notificationRejectProviders(id_petition, acceptedPostulationId, eventBus) {
        try {
            // 1. LÓGICA CLAVE: Buscar a los "perdedores"
            // Traduce a: "Dame todas las postulaciones de esta petición DONDE el ID NO SEA el del ganador"
            const rejectedPostulations = await Postulation.findAll({
                where: {
                    id_petition: id_petition,
                    id_postulation: { [Op.ne]: acceptedPostulationId }
                },
                include: [{
                    model: Provider,
                    as: 'provider',
                    include: [{ 
                        model: User, 
                        as: 'user', 
                        attributes: ['id_user'] // Solo necesitamos el ID para notificar
                    }]
                }]
            });
            
            // Si no hay perdedores (ej: solo se postuló uno y ganó), no hacemos nada.
            if (!rejectedPostulations || rejectedPostulations.length === 0) return null;

            console.log(`Encontrados ${rejectedPostulations.length} proveedores para notificar rechazo.`);

            // --- 2. LÓGICA DE SOCKETS EN TIEMPO REAL ---
            if (eventBus) {
                eventBus.emit('notification:postulations-rejected', {
                    rejectedPostulations: rejectedPostulations
                });
            }

            // 3. Mapear los datos para la notificación persistente
            const notificationData = rejectedPostulations.map(post => ({
                id_user: post.provider.user.id_user, // El destinatario
                title: "Postulación cerrada",
                message: "El cliente ha aceptado otra propuesta para este trabajo. Gracias por tu interés.",
                notification_type: "postulation_rejected",
                related_postulation_id: post.id_postulation,
                related_petition_id: id_petition,
                is_read: false,
                creat_at: new Date(), // O create_at según tu BD
                metadata: {
                    id_provider: post.provider.id_provider,
                    // Usamos un texto genérico o la propuesta si existe
                    info: "Tu postulación no fue seleccionada."
                }
            }));

            // 4. Inserción Masiva
            await Notification.bulkCreate(notificationData);
    
        } catch (e) {
            console.error("Error en notificationRejectProviders: ", e);
            // No lanzamos error para no afectar el flujo principal
        }
    }
    
    /**
     * Notifica a los proveedores que su postulación fue cancelada porque la petición se cerró.
     * @param {number} petitionId - ID de la petición cancelada.
     * @param {Array} affectedPostulations - Array de objetos con { id_user_create }.
     */
    async notifyPetitionCancelled(petitionId, affectedPostulations, eventBus) {
        try {
            // 1. Validación básica: Si no hay nadie a quien avisar, salimos.
            if (!affectedPostulations || affectedPostulations.length === 0) return;

            console.log(`Generando notificaciones de cancelación para ${affectedPostulations.length} proveedores...`);

            if(eventBus) {
                eventBus.emit('notification:petition-cancelled', {
                    petitionId: petitionId,
                    affectedPostulations: affectedPostulations
                });
            }

            // 2. Preparamos los datos masivos
            const notificationsData = affectedPostulations.map(postulation => ({
                id_user: postulation.id_user_create,
                title: "Petición Cancelada",
                message: "El cliente ha cancelado la petición a la que te postulaste. Tu postulación ha sido cerrada.",
                notification_type: "postulation_canceled",
                settingKey: "postulation_state_changed",
                related_petition_id: petitionId,
                is_read: false,
                created_at: new Date(), 
                metadata: {
                    reason: "Petition closed by client"
                }
            }));

            // 3. Inserción Masiva (Fire & Forget)
            await Notification.bulkCreate(notificationsData);
            
        } catch (e) {
            console.error("Error en notifyPetitionCancelled:", e);
        }
    }
    
}

module.exports = new NotificationService();