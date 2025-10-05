const jwt = require('jsonwebtoken')
const { User, Customer, Provider } = require('../models'); // Importar Customer y Provider
const { error, success } = require('../middlewares/response');

const signAccessToken = (payload) => 
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES || '1h'});

const signRefreshToken = (payload) => {
    const expiration = process.env.REFRESH_EXPIRES || '7d';
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: expiration});
}

// --- FUNCIÓN DE REGISTRO MODIFICADA ---
exports.register = async (req, res) => {
    try {
        // 1. Recibir el nuevo campo 'role' desde el frontend
        const { name, lastname, email, password, role } = req.body;
        if(!name || !lastname || !email || !password || !role) {
            return error(res, 'Faltan campos (name, lastname, email, password, role)');
        }

        if (role !== 'customer' && role !== 'provider') {
            return error(res, 'El rol debe ser "customer" o "provider"');
        }
        
        const exists = await User.findOne({where: {email}});
        if(exists) return error(res, 'Email ya registrado');

        // 2. Asignar is_staff basado en el rol
        const is_staff = role === 'provider';

        // 3. Crear el usuario con el campo is_staff
        const user = await User.create({
            name, 
            lastname, 
            email, 
            password, 
            is_staff, // Asignar el valor
            is_active: true, 
            enabled: true
        });

        // 4. Crear el perfil asociado (Customer o Provider)
        if (role === 'customer') {
            await Customer.create({ id_user: user.id_user });
        } else {
            await Provider.create({ id_user: user.id_user });
        }

        // 5. Devolver una respuesta exitosa
        return success(res, { userId: user.id_user, role: role }, 'Usuario y perfil creados correctamente');

    } catch (e) {
        console.error('Error en el registro: ', e);
        // Si algo falla, el error ahora será más específico
        return error(res, 'Error registrando al usuario o creando su perfil');
    };
}

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
