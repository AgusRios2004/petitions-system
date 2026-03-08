const { State, User, sequelize } = require('../models');

async function addFinalizadoState() {
    try {
        console.log('--- Añadiendo Estado Finalizado ---');

        const adminUser = await User.findOne({ where: { is_superuser: true } }) || await User.findOne();
        if (!adminUser) {
            console.error('🔴 No se encontró usuario admin.');
            process.exit(1);
        }

        const [state, created] = await State.findOrCreate({
            where: { code: 'FIN' },
            defaults: {
                state: 'Finalizado',
                code: 'FIN',
                description: 'Cerrado y entregado',
                id_user_create: adminUser.id_user
            }
        });

        if (created) {
            console.log('✅ Estado Finalizado (FIN) creado.');
        } else {
            console.log('ℹ️ El estado Finalizado (FIN) ya existía.');
        }

        process.exit(0);
    } catch (error) {
        console.error('🔴 Error:', error);
        process.exit(1);
    }
}

addFinalizadoState();
