function initialize(app) {
    const eventBus = app.get('eventBus');
    const io = app.get('io');
    const userSocketMap = app.get('userSocketMap');
    // Escucha cuando hay una nueva petición que matchea con proveedores
    eventBus.on('notification:new-petition-match', ({ petition, matchingProviders }) => {
        if (!matchingProviders || matchingProviders.length === 0) return;
        matchingProviders.forEach(provider => {
            const targetUserId = provider.user.id_user;
            const targetSocketId = userSocketMap.get(targetUserId);
            if (targetSocketId) {
                console.log(`[SocketHandler] Emitting 'new_petition' to provider ${targetUserId}`);
                io.to(targetSocketId).emit('new_petition', {
                    title: "Nueva oportunidad laboral",
                    message: "Nueva petición en tus categorías de intereses",
                    id_petition: petition.id_petition,
                });
            }
        });
    });

    // Escucha cuando se deben notificar a los proveedores rechazados
    eventBus.on('notification:postulations-rejected', ({ rejectedPostulations }) => {
        if (!rejectedPostulations || rejectedPostulations.length === 0) return;

        rejectedPostulations.forEach(post => {
            const targetUserId = post.provider.user.id_user;
            const targetSocketId = userSocketMap.get(targetUserId);
            if (targetSocketId) {
                console.log(`[SocketHandler] Emitting 'postulation_rejected' to provider ${targetUserId}`);
                io.to(targetSocketId).emit('postulation_rejected', {
                    message: "Tu postulación no fue seleccionada esta vez.",
                    petition_id: post.id_petition,
                    postulation_id: post.id_postulation
                });
            }
        });
    });

    // Escucha cuando una petición es cancelada y hay que notificar a los postulantes
    eventBus.on('notification:petition-cancelled', ({ petitionId, affectedPostulations }) => {
        if (!affectedPostulations || affectedPostulations.length === 0) return;

        affectedPostulations.forEach(post => {
            const targetUserId = post.id_user_create;
            const targetSocketId = userSocketMap.get(targetUserId);
            if (targetSocketId) {
                console.log(`[SocketHandler] Emitting 'postulation_cancelled' to provider ${targetUserId}`);
                io.to(targetSocketId).emit('postulation_cancelled', {
                    title: "Postulación cancelada",
                    message: "Postulación cancelada porque se canceló la petición",
                    id_petition: petitionId,
                });
            }
        });
    });
}

module.exports = { initialize };