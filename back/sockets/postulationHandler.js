function initialize(app) {
    const eventBus = app.get('eventBus');
    const io = app.get('io');
    const userSocketMap = app.get('userSocketMap');

    // Escuchamos el evento que el servicio emitirá cuando se cree una postulación
    eventBus.on('postulation:created', ({ postulation, targetUserId }) => {
        const targetSocketId = userSocketMap.get(targetUserId);
        if (targetSocketId) {
            console.log(`[SocketHandler] Emitting 'new_postulation' to user ${targetUserId}`);
            io.to(targetSocketId).emit('new_postulation', postulation);
        } else {
            console.log(`[SocketHandler] User ${targetUserId} not connected. Cannot send 'new_postulation'.`);
        }
    });

    // Escuchamos cuando una postulación es aceptada
    eventBus.on('postulation:accepted', ({ postulation, targetUserId }) => {
        const targetSocketId = userSocketMap.get(targetUserId);
        if (targetSocketId) {
            console.log(`[SocketHandler] Emitting 'postulation_accepted' to user ${targetUserId}`);
            io.to(targetSocketId).emit('postulation_accepted', postulation);
        } else {
            console.log(`[SocketHandler] User ${targetUserId} not connected. Cannot send 'postulation_accepted'.`);
        }
    });

    // Escuchamos cuando una postulación es rechazada
    eventBus.on('postulation:rejected', ({ postulation, targetUserId }) => {
        const targetSocketId = userSocketMap.get(targetUserId);
        if (targetSocketId) {
            console.log(`[SocketHandler] Emitting 'postulation_rejected' to user ${targetUserId}`);
            io.to(targetSocketId).emit('postulation_rejected', {
                id_postulation: postulation.id_postulation,
                id_petition: postulation.id_petition,
                title: 'Postulación rechazada',
                message: 'El cliente ha decidido no continuar con esta propuesta.'
            });
        } else {
            console.log(`[SocketHandler] User ${targetUserId} not connected. Cannot send 'postulation_rejected'.`);
        }
    });

    // Escuchamos cuando un proveedor retira su postulación
    eventBus.on('postulation:withdrawn', ({ postulation, targetUserId }) => {
        const targetSocketId = userSocketMap.get(targetUserId);
        if (targetSocketId) {
            console.log(`[SocketHandler] Emitting 'postulation_withdrawn' to user ${targetUserId}`);
            io.to(targetSocketId).emit('postulation_withdrawn', {
                title: 'Postulación retirada',
                message: `El proveedor ha retirado su propuesta para "${postulation.petition.title || 'tu petición'}".`,
                id_petition: postulation.id_petition,
                id_postulation: postulation.id_postulation,
            });
        }
    });
}

module.exports = { initialize };