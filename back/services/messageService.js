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
        include: [
            {
                model: User,
                as: 'users',
                where: { id_user: userId },
                attributes: [],
                through: { attributes: [] }
            },
            //User con el que estamos hablando
            {
                model: User,
                as: 'users',
                attributes: ['id_user', 'name', 'lastname', 'profile_image'],
                through: { attributes: [] },
                where: { id_user: { [Op.ne]: userId } }
            }
        ],
        attributes: [
            'id_conversation',
            [sequelize.literal('(SELECT content FROM n_message WHERE n_message.conversation_id = `Conversation`.`id_conversation` ORDER BY n_message.created_at DESC LIMIT 1)'), 'last_message_content'],
            [sequelize.literal('(SELECT created_at FROM n_message WHERE n_message.conversation_id = `Conversation`.`id_conversation` ORDER BY n_message.created_at DESC LIMIT 1)'), 'last_message_date']
        ],
        order: [[sequelize.literal('last_message_date'), 'DESC']]
    });
    return conversations;
};

const getMessagesByConversation = async (conversationId) => {
    const messages = await Message.findAll({
        where: { conversation_id: conversationId },
        include: [{ model: User, as: 'sender', attributes: ['id_user', 'name', 'last_name', 'profile_image'] }],
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
        include: [{ model: User, as: 'sender', attributes: ['id_user', 'name', 'last_name', 'profile_image'] }]
    });

    return messageWithSender;
};

/**
 * Busca una conversación existente entre dos usuarios. Si no existe, la crea.
 * @param {number} userOneId - ID del primer usuario (generalmente el usuario autenticado).
 * @param {number} userTwoId - ID del segundo usuario.
 * @returns {Promise<Conversation>} La conversación encontrada o creada.
 */
const findOrCreateConversation = async (userOneId, userTwoId) => {
    // Busca una conversación donde ambos usuarios sean participantes.
    const conversation = await Conversation.findOne({
        include: [{
            model: User,
            as: 'users',
            where: { id_user: { [Op.in]: [userOneId, userTwoId] } },
            attributes: [], // No necesitamos los datos de los usuarios aquí
            through: { attributes: [] }
        }],
        group: ['Conversation.id_conversation'],
        having: sequelize.literal(`COUNT(DISTINCT \`users\`.\`id_user\`) = 2`)
    });

    // Si se encuentra una conversación, la devolvemos.
    if (conversation) {
        return conversation;
    }

    // Si no, creamos una nueva.
    const newConversation = await createConversation(userOneId, userTwoId);
    return newConversation;
};

const createConversation = async (userOneId, userTwoId) => {
    const transaction = await sequelize.transaction();
    try {
        const conversation = await Conversation.create({}, { transaction });

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