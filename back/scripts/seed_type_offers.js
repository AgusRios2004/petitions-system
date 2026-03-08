const {
    sequelize, TypeOffer, User
} = require('../models');

async function seedTypeOffers() {
    try {
        console.log('--- Iniciando Carga Manual de Tipos de Oferta ---');

        // Buscamos al admin para la auditoría (o cualquier usuario si no hay admin)
        const adminUser = await User.findOne({ where: { is_superuser: true } }) || await User.findOne();

        if (!adminUser) {
            console.error('🔴 Error: No se encontró ningún usuario para asignar id_user_create. Por favor, corre el seed principal primero.');
            process.exit(1);
        }

        const typeOffers = [
            { name: 'Promoción Temporal', id_user_create: adminUser.id_user },
            { name: 'Descuento Especial', id_user_create: adminUser.id_user },
            { name: 'Pack de Servicios', id_user_create: adminUser.id_user },
            { name: 'Oferta de Lanzamiento', id_user_create: adminUser.id_user }
        ];

        for (const type of typeOffers) {
            // findOrCreate para no duplicar datos y no borrar nada
            const [instance, created] = await TypeOffer.findOrCreate({
                where: { name: type.name },
                defaults: type
            });
            if (created) {
                console.log(`✅ Creado: ${type.name}`);
            } else {
                console.log(`ℹ️ Ya existía: ${type.name}`);
            }
        }

        console.log('\n🚀 Carga de Tipos de Oferta finalizada sin alterar datos existentes.');
        process.exit(0);

    } catch (error) {
        console.error('🔴 Error durante la carga:', error);
        process.exit(1);
    }
}

seedTypeOffers();
