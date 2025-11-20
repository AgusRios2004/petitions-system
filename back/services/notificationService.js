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

    async notificationMatchingProvider(petition){
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

            await Notification.bulkCreate(notificationData)
        } catch (e) {
            console.log("Error: ", e);
        }
    }

    async notificationRejectProviders(id_petition, postulation){
        try {
            const rejectedPostulations = await Postulation.findAll({
                where: {
                    id_petition: petitionId,
                    id_postulation: { [Op.ne]: acceptedPostulationId } // Op.ne = Not Equal
                },
                include: [{
                    model: Provider,
                    as: 'provider',
                    include: [{ model: User, as: 'user', attributes: ['id_user'] }]
                }]
            });
            
            if(rejectedPostulations.length === 0) return null;

            const notificationData = rejectedPostulations.map(postulation => ({
                id_user: postulation.provider.user.id_user,
                title: "Postulación rechazada",
                message: "Una postulación ha sido aceptada antes que la tuya",
                notification_type: "petition_rejected",
                related_postulation_id: postulation.id_postulation,
                related_petition_id: id_petition,
                is_read: false,
                create_at: new Date(),
                metadata: {
                    id_provider: postulation.provider.id_provider,
                    description: postulation.description,
                }
            }));

            await Notification.bulkCreate(notificationData)
    
        } catch (e) {
            console.error("Error: ", e);
        }
    }
}

module.exports = new NotificationService();