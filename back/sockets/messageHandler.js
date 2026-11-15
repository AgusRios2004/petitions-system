const { Conversation, User } = require('../models');
const messageService = require('../services/messageService');

const ROOM_PATTERN = /^conversation:([1-9]\d{0,9})$/;

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

    // Solo se une a la sala un participante de la conversación; lo demás se ignora y se loguea.
    socket.on('joinConversation', async (roomName) => {
        try {
            const match = typeof roomName === 'string' ? ROOM_PATTERN.exec(roomName) : null;
            if (!match) {
                console.warn(`User ${socket.userId} intentó unirse a una sala inválida: ${JSON.stringify(roomName)}`);
                return;
            }
            const allowed = await messageService.isUserParticipant(socket.userId, Number(match[1]));
            if (!allowed) {
                console.warn(`User ${socket.userId} intentó unirse a ${roomName} sin ser participante`);
                return;
            }
            socket.join(roomName);
            console.log(`User ${socket.userId} manually joined room: ${roomName}`);
        } catch (error) {
            console.error('Error en joinConversation:', error);
        }
    });

    socket.on('leaveConversation', (roomName) => {
        socket.leave(roomName);
        console.log(`User ${socket.userId} left room: ${roomName}`);
    });
};

module.exports = {
    initialize
};
