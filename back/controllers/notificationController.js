const notificationService = require('../services/notificationService')
const { error, success } = require('../middlewares/response');

exports.createNotification = async (req, res) => {
    try {
        const { title, message, notification_type, related_postulation_id, related_petition_id, metadata } = req.body;
        const id_user = req.user.sub;

        const notification = await notificationService.createNotification({
            id_user: id_user,
            title,
            message,
            notification_type,
            related_postulation_id,
            related_petition_id,
            metadata,
        });

        return success(res, notification, "Notificación creada correctamente", 201);
        
    } catch (e) {
        console.log("Error: ", e);
    }
}

exports.getNotifications = async (req, res) => {
    try {
        const id_user = req.user.sub;
        const { page = 1 } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const notifications = await notificationService.getNotifications(id_user, limit, offset); // Asumiendo que el servicio devuelve solo las notificaciones
        const unreadNotifications = await notificationService.getUnreadNotifications(id_user);

        return success(res, {notifications, unreadNotifications}, "Notificaciones obtenidas correctamente", 200);
        } catch (e) {
        console.log("Error: ", e);
        error(res, e.message, 500, e);
    }
};

exports.markRead = async (req, res) => {
    try {
        const id_user = req.user.sub;
        const { id } = req.params; // La ruta es /:id/read
        
        const notification = await notificationService.markRead(id_user, id);

        return success(res, notification, "Notificación marcada como leída correctamente", 200);
    } catch (e) {
        console.log("Error: ", e);
        error(res, e.message, 500, e);
    }
};

exports.markAllRead = async (req, res) => {
    try {
        const id_user = req.user.sub;

        const notifications = await notificationService.markAllRead(id_user);

        return success(res, notifications, "Todas las notificaciones marcadas como leídas correctamente", 200);
    } catch (e) {
        console.log("Error: ", e);
        error(res, e.message, 500, e);
    }
}