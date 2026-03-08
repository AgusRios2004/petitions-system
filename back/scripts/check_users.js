const { User } = require('../models');

async function checkUsers() {
    try {
        const users = await User.findAll({ limit: 1 });
        if (users.length === 0) {
            console.log('No users found.');
            process.exit(0);
        }
        const u = users[0];
        console.log(`Testing user: ${u.email}`);

        const bcrypt = require('bcrypt');
        // We don't know the password, but we can test if the function exists and runs
        try {
            const ok = await u.comparePassword('any_password');
            console.log('bcrypt.compare executed successfully, result:', ok);
        } catch (bcryptErr) {
            console.error('bcrypt.compare FAILED:', bcryptErr);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
}

checkUsers();
