const { error, success } = require('../middlewares/response');
const jwt = require('jsonwebtoken');

exports.authRequired = (req, res, next) => {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if(!token) return error(res, 'Token requerido', 401);
    
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; //{ sub, email, is_staff, is_superuser }    
        next();
    } catch (e) {
        return error(res, e.message, 403);
    }
}

exports.onlyStaff = (req, res, next) => {
    if(!req.user?.is_staff && !req.user?.is_superuser) return error(res, 'Requere staff');
    next();
}

exports.onlySuperuser = (req, res, next) => {
    if(!req.user?.is_superuser) return error(res, 'Requiere superuser');
    next();
}