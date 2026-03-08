const {
    sequelize, Role, State, Category, Profession, TypeProvider,
    Country, Province, City, TypePetition, User, UserRole,
    Color, Department, Address, Customer, Provider,
    ProviderCategory, Petition, PetitionCategory, Postulation,
    Article, Inventory, Grade, GradeProvider, GradeCustomer
} = require('../models');

async function seed() {
    try {
        console.log('--- Iniciando Sincronización de Base de Datos ---');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🟢 Base de datos limpia.');

        // 1. Datos Básicos
        console.log('--- Insertando Configuraciones ---');

        const roles = await Role.bulkCreate([
            { name: 'admin' },
            { name: 'customer' },
            { name: 'provider' }
        ]);

        const adminUser = await User.create({
            name: 'Admin', lastname: 'Principal', email: 'admin@sistema.com',
            password: 'admin123', is_superuser: true, is_staff: true, is_active: true, enabled: true
        });
        await UserRole.create({ id_user: adminUser.id_user, id_role: roles[0].id_role });

        const colors = await Color.bulkCreate([
            { id_color: 1, color_name: 'Malo', id_user_create: adminUser.id_user },
            { id_color: 2, color_name: 'Regular', id_user_create: adminUser.id_user },
            { id_color: 3, color_name: 'Bueno', id_user_create: adminUser.id_user },
            { id_color: 28, color_name: 'Excelente', id_user_create: adminUser.id_user },
            { id_color: 31, color_name: 'Muy Bueno', id_user_create: adminUser.id_user }
        ]);

        const states = await State.bulkCreate([
            { id_state: 1, state: 'Pendiente', code: 'PEN', id_user_create: adminUser.id_user },
            { id_state: 2, state: 'Aceptado', code: 'ACE', id_user_create: adminUser.id_user },
            { id_state: 3, state: 'Rechazado', code: 'REC', id_user_create: adminUser.id_user },
            { id_state: 4, state: 'Cancelado', code: 'CAN', id_user_create: adminUser.id_user },
            { id_state: 5, state: 'Baja', code: 'BJA', id_user_create: adminUser.id_user }
        ]);

        const typePetitions = await TypePetition.bulkCreate([
            { name: 'Servicio', id_user_create: adminUser.id_user },
            { name: 'Producto', id_user_create: adminUser.id_user }
        ]);

        const categories = await Category.bulkCreate([
            { name: 'Hogar', id_user_create: adminUser.id_user },
            { name: 'Tecnología', id_user_create: adminUser.id_user },
            { name: 'Construcción', id_user_create: adminUser.id_user },
            { name: 'Jardinería', id_user_create: adminUser.id_user }
        ]);

        const professions = await Profession.bulkCreate([
            { name: 'Plomero' }, { name: 'Electricista' },
            { name: 'Programador' }, { name: 'Carpintero' },
            { name: 'Jardinero' }
        ]);

        const typeProviders = await TypeProvider.bulkCreate([
            { name: 'Independiente' }, { name: 'Empresa' }
        ]);

        // 2. Localización
        const arg = await Country.create({ name: 'Argentina', code: 'AR', id_user_create: adminUser.id_user });
        const mza = await Province.create({ name: 'Mendoza', id_country: arg.id_country, id_user_create: adminUser.id_user });
        const cap = await Department.create({ name: 'Capital', id_country: arg.id_country, id_province: mza.id_province });
        const mzaCity = await City.create({ name: 'Mendoza Capital', id_department: cap.id_department, postal_code: '5500' });

        // 3. Usuarios (Clientes y Proveedores)
        console.log('--- Creando Usuarios ---');

        const createFullUser = async (name, lastname, email, roleName, extra = {}) => {
            const user = await User.create({
                name, lastname, email, password: 'password123',
                is_staff: roleName === 'provider', is_active: true, enabled: true
            });
            const role = roles.find(r => r.name === roleName);
            await UserRole.create({ id_user: user.id_user, id_role: role.id_role });

            const addr = await Address.create({ street: 'Calle ' + name, number: '123', id_city: mzaCity.id_city });

            if (roleName === 'customer') {
                return await Customer.create({ user_id: user.id_user, dni: '123' + user.id_user, phone: '261000' + user.id_user, address_id: addr.id_address });
            } else {
                const prov = await Provider.create({
                    user_id: user.id_user, address_id: addr.id_address,
                    id_type_provider: typeProviders[0].id_type_provider,
                    id_profession: extra.profId || professions[0].id_profession,
                    description: 'Experto en su área'
                });
                if (extra.cats) {
                    await ProviderCategory.bulkCreate(extra.cats.map(cId => ({ provider_id: prov.id_provider, category_id: cId })));
                }
                return prov;
            }
        };

        const c1 = await createFullUser('Juan', 'Pérez', 'cliente@ejemplo.com', 'customer');
        const c2 = await createFullUser('Ana', 'García', 'ana@ejemplo.com', 'customer');

        const p1 = await createFullUser('Mario', 'Goméz', 'proveedor@ejemplo.com', 'provider', { profId: professions[0].id_profession, cats: [1, 3] });
        const p2 = await createFullUser('Roberto', 'Sánchez', 'roberto@ejemplo.com', 'provider', { profId: professions[1].id_profession, cats: [1] });
        const p3 = await createFullUser('Laura', 'Mesa', 'laura@ejemplo.com', 'provider', { profId: professions[2].id_profession, cats: [2] });

        // 4. Artículos
        const art1 = await Article.create({ name: 'Cano de PVC 1/2', id_category: 1, id_user_create: adminUser.id_user });
        const art2 = await Article.create({ name: 'Cinta Aisladora', id_category: 1, id_user_create: adminUser.id_user });
        const art3 = await Article.create({ name: 'Válvula Esférica', id_category: 1, id_user_create: adminUser.id_user });

        // 5. Peticiones y Postulaciones
        console.log('--- Creando Peticiones y Flujos ---');

        // Petición 1: Petición Pendiente con varias postulaciones
        const pet1 = await Petition.create({
            id_customer: c1.id_customer, description: 'Reparación de cañería en baño principal.',
            id_type_petition: 1, id_profession: professions[0].id_profession, id_state: 1,
            date_since: new Date(), date_until: new Date(Date.now() + 86400000 * 7),
            id_user_create: c1.user_id, id_type_provider: 1
        });
        await PetitionCategory.create({ id_petition: pet1.id_petition, id_category: 1 });

        // Mario (p1) se postula a pet1
        const pos1 = await Postulation.create({
            id_petition: pet1.id_petition, id_provider: p1.id_provider, proposal: 'Lo arreglo en 2 horas.',
            cost: 5000, id_state: 1, id_user_create: p1.user_id, winner: false, date_create: new Date()
        });
        await Inventory.create({ id_article: art1.id_article, quantity: 2, cost: 200, id_postulation: pos1.id_postulation, id_user_create: p1.user_id });

        // Petición 2: Petición Ganada (Aceptada)
        const pet2 = await Petition.create({
            id_customer: c1.id_customer, description: 'Instalar tomacorriente exterior.',
            id_type_petition: 1, id_profession: professions[1].id_profession, id_state: 2, // ACE
            date_since: new Date(), date_until: new Date(Date.now() + 86400000 * 3),
            id_user_create: c1.user_id, id_type_provider: 1
        });
        await PetitionCategory.create({ id_petition: pet2.id_petition, id_category: 1 });

        const pos2 = await Postulation.create({
            id_petition: pet2.id_petition, id_provider: p2.id_provider, proposal: 'Llevo mis propios cables.',
            cost: 7500, id_state: 2, id_user_create: p2.user_id, winner: true, date_create: new Date(Date.now() - 86400000)
        });
        await Inventory.create({ id_article: art2.id_article, quantity: 1, cost: 500, id_postulation: pos2.id_postulation, id_user_create: p2.user_id });

        // 6. Calificaciones (Para el flujo terminado)
        console.log('--- Calificando ---');
        const g1 = await Grade.create({ grade_number: 5, id_color: 28, id_user_create: c1.user_id, id_petition: pet2.id_petition });
        await GradeProvider.create({ id_provider: p2.id_provider, id_grade: g1.id_grade, coment: 'Excelente trabajo, muy rápido.', id_user_create: c1.user_id, date_create: new Date() });

        // Petición 3: Petición de otro cliente (Ana)
        const pet3 = await Petition.create({
            id_customer: c2.id_customer, description: 'Necesito una landing page para mi negocio.',
            id_type_petition: 1, id_profession: professions[2].id_profession, id_state: 1,
            date_since: new Date(), date_until: new Date(Date.now() + 86400000 * 15),
            id_user_create: c2.user_id, id_type_provider: 1
        });
        await PetitionCategory.create({ id_petition: pet3.id_petition, id_category: 2 });

        // Laura (p3) se postula
        await Postulation.create({
            id_petition: pet3.id_petition, id_provider: p3.id_provider, proposal: 'Desarrollo en Next.js.',
            cost: 150000, id_state: 1, id_user_create: p3.user_id, winner: false, date_create: new Date()
        });

        console.log('\n🚀 ¡Database SEEDED con éxito! Artículos, Postulaciones y Calificaciones creadas.');
        process.exit(0);

    } catch (error) {
        console.error('🔴 Error seeding:', error);
        process.exit(1);
    }
}

seed();
