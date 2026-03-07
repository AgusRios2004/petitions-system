const { sequelize, Role, State, Category, Profession, TypeProvider, Country, Province, City, TypePetition } = require('../models');

async function seed() {
    try {
        console.log('--- Configuración Actual ---');
        console.log('Host:', sequelize.options.host);
        console.log('Database:', sequelize.options.database);
        console.log('----------------------------');

        console.log('--- Iniciando Sincronización de Base de Datos ---');

        // Desactivar temporalmente las restricciones de llave foránea para poder limpiar las tablas
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // force: true borrará todas las tablas y las recreará
        await sequelize.sync({ force: true });

        // Volver a activar las restricciones
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('🟢 Base de datos limpiada y recreada.');

        console.log('--- Insertando Datos Básicos ---');

        const { User, UserRole } = require('../models');

        // 1. Roles
        const roles = await Role.bulkCreate([
            { name: 'admin' },
            { name: 'customer' },
            { name: 'provider' }
        ]);
        console.log('✅ Roles insertados.');

        // 2. Usuario Administrador Inicial (para las FK de id_user_create)
        const adminUser = await User.create({
            name: 'Admin',
            lastname: 'General',
            email: 'admin@sistema.com',
            password: 'admin123', // El hook de User lo hasheará
            is_superuser: true,
            is_staff: true,
            is_active: true,
            enabled: true,
            date_create: new Date()
        });

        // Asignar rol de admin
        await UserRole.create({
            id_user: adminUser.id_user,
            id_role: roles[0].id_role
        });

        console.log('✅ Usuario Administrador inicial creado.');

        // 3. Estados (Usados en postulaciones y peticiones)
        await State.bulkCreate([
            { state: 'Pendiente', code: 'PEN', description: 'Petición o postulación pendiente', id_user_create: adminUser.id_user },
            { state: 'Aceptado', code: 'ACE', description: 'Petición o postulación aceptada', id_user_create: adminUser.id_user },
            { state: 'Rechazado', code: 'REC', description: 'Postulación rechazada', id_user_create: adminUser.id_user },
            { state: 'Cancelado', code: 'CAN', description: 'Acción cancelada', id_user_create: adminUser.id_user },
            { state: 'Baja', code: 'BJA', description: 'Dado de baja', id_user_create: adminUser.id_user }
        ]);
        console.log('✅ Estados insertados.');

        // 4. Tipos de Petición
        await TypePetition.bulkCreate([
            { name: 'Servicio', description: 'Solicitud de un servicio profesional', id_user_create: adminUser.id_user },
            { name: 'Producto', description: 'Solicitud de un producto específico', id_user_create: adminUser.id_user }
        ]);
        console.log('✅ Tipos de Petición insertados.');

        // 5. Categorías
        await Category.bulkCreate([
            { name: 'Hogar', description: 'Servicios para el hogar', id_user_create: adminUser.id_user },
            { name: 'Tecnología', description: 'Soporte y desarrollo técnico', id_user_create: adminUser.id_user },
            { name: 'Construcción', description: 'Obras y reparaciones mayores', id_user_create: adminUser.id_user }
        ]);
        console.log('✅ Categorías insertadas.');

        // 6. Profesiones
        await Profession.bulkCreate([
            { name: 'Plomero' },
            { name: 'Electricista' },
            { name: 'Programador' },
            { name: 'Carpintero' }
        ]);
        console.log('✅ Profesiones insertadas.');

        // 7. Tipos de Proveedor
        await TypeProvider.bulkCreate([
            { name: 'Independiente' },
            { name: 'Empresa' }
        ]);
        console.log('✅ Tipos de Proveedor insertados.');

        // 8. Localización (Datos mínimos para probar)
        const { Department } = require('../models');
        const argentina = await Country.create({ name: 'Argentina', code: 'AR', id_user_create: adminUser.id_user });
        const mendoza = await Province.create({ name: 'Mendoza', id_country: argentina.id_country, id_user_create: adminUser.id_user });
        const capitalDep = await Department.create({
            name: 'Capital',
            id_country: argentina.id_country,
            id_province: mendoza.id_province,
        });

        await City.create({
            name: 'Mendoza Capital',
            id_department: capitalDep.id_department,
            postal_code: '5500',
        });

        console.log('✅ Datos de localización insertados (Argentina -> Mendoza -> Capital -> Mendoza Capital).');

        console.log('\n🚀 ¡Base de datos configurada con éxito!');
        process.exit(0);

    } catch (error) {
        console.error('🔴 Error durante el seeding:', error);
        process.exit(1);
    }
}

seed();
