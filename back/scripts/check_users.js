const { User, Customer, Provider } = require('../models');

async function checkUsers() {
    try {
        const users = await User.findAll({
            include: [{ model: Customer, as: 'customer' }, { model: Provider, as: 'provider' }]
        });
        console.log('Total users found:', users.length);
        users.forEach(u => {
            const role = u.customer ? 'Customer' : (u.provider ? 'Provider' : (u.is_superuser ? 'Admin' : 'None'));
            console.log(`ID: ${u.id_user}, Email: ${u.email}, Role: ${role}, Prof/DNI: ${u.provider?.id_profession || u.customer?.dni || 'N/A'}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
}

checkUsers();
