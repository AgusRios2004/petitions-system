const jwt = require('jsonwebtoken')
const { User } = require('../models');
const { error, success } = require('../middlewares/response');

const signAccessToken = (payload) => 
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES || '1h'});

const signRefreshToken = (payload) => {
    const expiration = process.env.REFRESH_EXPIRES || '7d';
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: expiration});
}
exports.register = async (req, res) => {
    try {
        const { name, lastname, email, password } = req.body;
        if(!name || !lastname || !email || !password) return error(res, 'Faltan campos');
        
        const exists = await User.findOne({where: {email}});
        if(exists) return error(res, 'Email ya registrado');

        const user = await User.create({name, lastname, email, password, is_active: true, enabled: true});
        return success(res, user, 'Usuario creado correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error registrando al usuario');
    };
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) return error(res, 'Email y contraseña requeridos');

        const user = await User.findOne({where: {email}});
        if(!user) return error(res, `Credenciales inválidas. Email: ${email}. Contraseña: ${password}.`);

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