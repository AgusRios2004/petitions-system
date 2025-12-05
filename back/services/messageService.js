const { Conversation, Message, User, ConversationParticipants, sequelize } = require('../models');
const { Op } = require('sequelize');

const isUserParticipant = async (userId, conversationId) => {
    const participant = await ConversationParticipants.findOne({
        where: { user_id: userId, conversation_id: conversationId }
    });
    return !!participant;
};

const getConversationsForUser = async (userId) => {
    const conversations = await Conversation.findAll({
        // 1. Filtro principal: Asegura que el usuario actual es participante.
        where: {
            '$users.id_user$': userId
        },
        include: [
            {
                model: User,
                as: 'users',
                attributes: ['id_user', 'name', 'lastname', 'profile_image'],
                through: { attributes: [] },
                // No filtramos aquí para traer a todos los participantes.
                // El frontend se encargará de mostrar al otro usuario.
            }
        ],
        attributes: [
            'id_conversation',
            [sequelize.literal('(SELECT content FROM n_message WHERE n_message.conversation_id = `Conversation`.`id_conversation` ORDER BY created_at DESC LIMIT 1)'), 'last_message_content'],
            [sequelize.literal('(SELECT created_at FROM n_message WHERE n_message.conversation_id = `Conversation`.`id_conversation` ORDER BY created_at DESC LIMIT 1)'), 'last_message_date']
        ],
        order: [[sequelize.literal('last_message_date'), 'DESC']]
    });
    return conversations;
};

const getMessagesByConversation = async (conversationId) => {
    const messages = await Message.findAll({
        where: { conversation_id: conversationId },
        include: [{ model: User, as: 'sender', attributes: ['id_user', 'name', 'lastname', 'profile_image'] }],
        order: [['created_at', 'ASC']]
    });
    return messages;
};

const createMessage = async (conversationId, senderId, content) => {
    const message = await Message.create({
        conversation_id: conversationId,
        sender_id: senderId,
        content
    });

    // Hacemos un findByPk para obtener el mensaje con la información del remitente (sender)
    // que necesitamos para emitir por el socket.
    const messageWithSender = await Message.findByPk(message.id_message, {
        include: [{ model: User, as: 'sender', attributes: ['id_user', 'name', 'lastname', 'profile_image'] }]
    });

    return messageWithSender;
};

/**
 * Busca una conversación existente entre dos usuarios. Si no existe, la crea.
 * @param {number} userOneId - ID del primer usuario (generalmente el usuario autenticado).
 * @param {number} userTwoId - ID del segundo usuario.
 * @returns {Promise<Conversation>} La conversación encontrada o creada.
 */
const findOrCreateConversation = async (userOneId, userTwoId, petitionId) => {
    // Busca una conversación que ya exista para esta petición específica entre estos dos usuarios.
    const conversation = await Conversation.findOne({
        where: {
            petition_id: petitionId
        },
        include: [
            {
                model: User,
                as: 'users',
                where: { id_user: userOneId },
                required: true
            },
            {
                model: User,
                as: 'users',
                where: { id_user: userTwoId },
                required: true
            }
        ]
    });

    if (conversation) {
        return conversation;
    }

    // Si no, creamos una nueva.
    const newConversation = await createConversation(userOneId, userTwoId, petitionId);
    return newConversation;
};

const createConversation = async (userOneId, userTwoId, petitionId) => {
    const transaction = await sequelize.transaction();
    try {
        const conversation = await Conversation.create({ petition_id: petitionId }, { transaction });

        await ConversationParticipants.bulkCreate([
            { conversation_id: conversation.id_conversation, user_id: userOneId },
            { conversation_id: conversation.id_conversation, user_id: userTwoId }
        ], { transaction });

        await transaction.commit();
        return conversation;
    } catch (error) {
        console.log("Error: ", error);
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    isUserParticipant,
    getConversationsForUser,
    getMessagesByConversation,
    createMessage,
    createConversation,
    findOrCreateConversation,
};