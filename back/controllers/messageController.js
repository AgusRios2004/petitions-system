const messageService = require('../services/messageService');
const { success, error } = require('../middlewares/response');

exports.getConversations = async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const conversations = await messageService.getConversationsForUser(userId);
        return success(res, conversations, "Conversaciones obtenidas correctamente", 200);
    } catch (e) {
        console.log("Error: ", e);
        next(e);
    }
}

exports.getMessagesByConversation = async (req, res, next) => {
    try {
        const { idConversation } = req.params;
        const userId = req.user.sub;

        const isParticipant = await messageService.isUserParticipant(userId, idConversation);
        if (!isParticipant) {
            return error(res, "Acceso denegado a esta conversación.", "Forbidden", 403);
        }

        const messages = await messageService.getMessagesByConversation(idConversation);
        return success(res, messages, "Mensajes obtenidos correctamente", 200);
    } catch (e) {
        console.log("Error: ", e);
        next(e);
    }
}

exports.createMessage = async (req, res, next) => {
    try {
        const { idConversation, content } = req.body;
        const userId = req.user.sub;

        const isParticipant = await messageService.isUserParticipant(userId, idConversation);
        if (!isParticipant) {
            return error(res, "No puedes enviar mensajes a esta conversación.", "Forbidden", 403);
        }

        const messageWithSender = await messageService.createMessage(idConversation, userId, content);

        const io = req.app.get('io');
        io.to(`conversation:${idConversation}`).emit('newMessage', messageWithSender);

        return success(res, messageWithSender, "Mensaje creado correctamente", 201);
    } catch (e) {
        console.log("Error: ", e);
        next(e);
    }
}

/**
 * Inicia una conversación con otro usuario.
 * Busca si ya existe una conversación entre el usuario autenticado y el `recipientId`.
 * Si no existe, la crea. Devuelve los datos de la conversación.
 */
exports.startConversation = async (req, res, next) => {
    try {
        const senderId = req.user.sub;
        const { recipientId } = req.body;

        if (!recipientId || senderId === recipientId) {
            return error(res, "Se requiere un ID de destinatario válido y distinto al remitente.", "Bad Request", 400);
        }

        const conversation = await messageService.findOrCreateConversation(senderId, Number(recipientId));
        return success(res, conversation, "Conversación iniciada/obtenida correctamente.", 200);
    } catch (e) {
        next(e);
    }
};
