const gradeService = require('../services/gradeService');
const { error, success } = require('../middlewares/response');
const { ConflictError } = require('../middlewares/customErrors');

const createGrade = async (req, res, next) => {
  try {
    const { id_provider, id_customer, grade_number, comment, id_color } = req.body;
    const id_user_create = req.user.sub;
    
    const grade = await gradeService.createGrade({ id_provider, id_customer, grade_number, comment, id_user_create, id_color });
    success(res, grade, 'Calificación creada correctamente', 201);
  } catch (e) {
    // Capturamos nuestro error personalizado
    if (e instanceof ConflictError) {
      return error(res, e.message, e.statusCode);
    }
    // ¡Línea clave para depuración!
    // Imprime el error completo en la consola del servidor.
    console.error('[ERROR] gradeController:', e); 

    error(res, e.message || 'Error al crear la calificación', 500, e);
  }
};

module.exports = {
  createGrade,
};
