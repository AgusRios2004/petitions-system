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
                const roomName = `conversation:${conv.id_conversation}`; //Crea un nombre distinto para cada sala
                socket.join(roomName);
                console.log(`User ${socket.userId} joined room: ${roomName}`);
            });

        } catch (error) {
            console.error('Error al unir al usuario a las salas de conversación:', error);
        }
    };

    // Unir al usuario a sus salas al conectarse
    joinConversationRooms();

    // [MEJORA 1] Escuchar cuando el front pide unirse a una sala específica.
    // Útil si se crea una conversación mientras el usuario está conectado.
    socket.on('joinConversation', (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.userId} manually joined room: ${roomName}`);
    });

    // [MEJORA 2] Escuchar cuando el front pide salir de una sala.
    // Buena práctica para limpiar suscripciones.
    socket.on('leaveConversation', (roomName) => {
        socket.leave(roomName);
        console.log(`User ${socket.userId} left room: ${roomName}`);
    });
};

module.exports = {
    initialize
};
