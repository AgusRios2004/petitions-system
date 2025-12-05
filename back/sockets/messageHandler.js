const { Conversation, User } = require('../models');

const initialize = (io, socket) => {
    console.log(`🔌 Sockets de Mensajes inicializados para el usuario: ${socket.userId}`);

    // Función para unir al usuario a las salas de sus conversaciones
    const joinConversationRooms = async () => {
        try {
            const conversations = await Conversation.findAll({
                include: [{
                    model: User,
                    as: 'users',
                    where: { id_user: socket.userId },
                    attributes: [], // No necesitamos los atributos del usuario aquí
                    through: { attributes: [] } // No necesitamos los atributos de la tabla de unión
                }]
            });

            conversations.forEach(conv => {
                const roomName = `conversation:${conv.id_conversation}`;
                socket.join(roomName);
                console.log(`User ${socket.userId} joined room: ${roomName}`);
            });

        } catch (error) {
            console.error('Error al unir al usuario a las salas de conversación:', error);
        }
    };

    // Unir al usuario a sus salas al conectarse
    joinConversationRooms();

    // (Opcional) Escuchar un evento para enviar mensajes directamente vía socket
    // Aunque el enfoque principal será vía API REST para persistencia.
    socket.on('sendMessage', (data) => {
        // Esta es una alternativa. En nuestro enfoque principal, la API REST emitirá el evento.
        // const { conversation_id, content } = data;
        // const roomName = `conversation:${conversation_id}`;
        // io.to(roomName).emit('newMessage', { content, sender_id: socket.userId, conversation_id });
    });
};

module.exports = {
    initialize
};
