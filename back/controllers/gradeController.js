const gradeService = require('../services/gradeService');
const { success, error } = require('../middlewares/response'); // Asumiendo que usas este helper

const getGrades = async (req, res) => {
    try {
        const filter = req.query;
        const grades = await gradeService.getGrades(filter);
        return success(res, grades);
    } catch (e) {
        console.error("Error obteniendo calificaciones:", e);
        return error(res, 'Error al obtener el historial de calificaciones');
    }
};

const createGrade = async (req, res) => {
    try {
        const data = req.body;
        // Asignamos el usuario que crea la calificación desde el token de autenticación
        data.id_user_create = req.user.sub; 
        data.date_create = new Date();
        
        const newGrade = await gradeService.createGrade(data);
        return success(res, newGrade, 'Calificación enviada con éxito', 201);
    } catch (e) {
        console.error("Error creando calificación:", e);
        return error(res, 'Error al enviar la calificación');
    }
};

module.exports = { getGrades, createGrade };