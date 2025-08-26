// services/userService.js
const { User } = require('../models');

class UserService {
    static async createUser(userData) {
        try {
            const existingUser = await User.findOne({ where: { email: userData.email } });
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }

            const user = await User.create(userData);
            return user;
        } catch (error) {
            throw error;
        }
    }

    static async getUserById(id_user) {
        return await User.findByPk(id_user);
    }

    static async getUserByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    static async updateUser(id_user, data) {
        const user = await User.findByPk(id_user);
        if (!user) throw new Error('Usuario no encontrado');
        await user.update(data);
        return user;
    }

    static async deleteUser(id_user) {
        const user = await User.findByPk(id_user);
        if (!user) throw new Error('Usuario no encontrado');
        await user.destroy();
        return true;
    }
}

module.exports = UserService;
