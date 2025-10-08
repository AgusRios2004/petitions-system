const jwt = require('jsonwebtoken')
const { User, Customer, Provider, Address, sequelize } = require('../models');
const { error, success } = require('../middlewares/response');

const signAccessToken = (payload) => 
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES || '1h'});

const signRefreshToken = (payload) => {
    const expiration = process.env.REFRESH_EXPIRES || '7d';
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: expiration});
}

// --- FUNCIÓN DE REGISTRO MODIFICADA ---
exports.register = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, lastname, email, password, role, dni, phone, professionId, typeProviderId, description, address } = req.body;
        const { street, number, floor, apartment, postal_code, id_city } = address;

        if (!name || !lastname || !email || !password || !role || !id_city || !postal_code || !number ||!street) {
            await transaction.rollback();
            return error(res, 'Faltan campos obligatorios para el registro y la dirección');
        }

        if (role === 'customer') {
            if (!dni || !phone) {
                await transaction.rollback();
                return error(res, 'Faltan campos obligatorios para el perfil de cliente (DNI, Teléfono)');
            }
        } else if (role === 'provider') {
            if (!professionId || !typeProviderId || !description) {
                await transaction.rollback();
                return error(res, 'Faltan campos obligatorios para el perfil de proveedor (Profesión, Tipo de Proveedor, Descripción)');
            }
        } else {
            await transaction.rollback();
            return error(res, 'Rol no válido. Debe ser "customer" o "provider"');
        }

        const exists = await User.findOne({ where: { email } });
        if (exists) {
            await transaction.rollback();
            return error(res, 'Email ya registrado');
        }

        // 1. Crear la dirección
        const newAddress = await Address.create({
            street: street,
            id_city: id_city,
            number: number,
            floor: floor,
            apartment: apartment,
            postal_code: postal_code,
        }, { transaction });

        // 2. Crear el usuario
        const is_staff = role === 'provider';
        const user = await User.create({
            name,
            lastname,
            email,
            password,
            is_staff,
            is_active: true,
            enabled: true,
        }, { transaction });

        // 3. Crear el perfil asociado (Customer o Provider)
        if (role === 'customer') {
            await Customer.create({
                user_id: user.id_user,
                dni: dni,
                phone: phone,
                address_id: newAddress.id_address,
            }, { transaction });
        } else if (role === 'provider') {
            await Provider.create({
                user_id: user.id_user,
                id_type_provider: typeProviderId,
                id_profession: professionId,
                address_id: newAddress.id_address,
                description: description,
            }, { transaction });
        }

        await transaction.commit();
        return success(res, { userId: user.id_user, role: role }, 'Usuario y perfil creados correctamente');

    } catch (e) {
        await transaction.rollback();
        console.error('Error en el registro: ', e);
        return error(res, 'Error registrando al usuario o creando su perfil');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) return error(res, 'Email y contraseña requeridos');

        const user = await User.findOne({where: {email}});        if(!user) return error(res, `Credenciales inválidas.`);

        if (!user.is_active || !user.enabled) return error(res, 'Usuario deshabilitado');

        const ok = await user.comparePassword(password);
        if(!ok) return error(res, 'Credenciales inválidas.');

        user.last_login = new Date();
        await user.save();

        const payload = {
            sub: user.id_user,
            email: user.email,
            is_staff: user.is_staff,
            is_superuser: user.is_superuser,
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        return res.json({
            accessToken,
            refreshToken,
            user: { id_user: user.id_user, name: user.name, lastname: user.lastname, email: user.email }
        });
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error en login');
    }
}

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findByPk(decoded.sub);

        const tokenPayload = {
            sub: user.id_user,
            email: user.email,
            is_staff: user.is_staff,
            is_superuser: user.is_superuser,
        };
        
        const accessToken = signAccessToken(tokenPayload);
        
        return success(res, accessToken, 'Token refrescado');
        
    } catch (e) {
        return error(res, e.message, 403);
    }
}
