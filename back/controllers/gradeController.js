const gradeService = require('../services/gradeService');
const { error, success } = require('../middlewares/response');

const createGrade = async (req, res, next) => {
  try {
    const { id_provider, id_customer, grade_number, comment, id_color } = req.body;
    const id_user_create = req.user.sub;
    
    const grade = await gradeService.createGrade({ id_provider, id_customer, grade_number, comment, id_user_create, id_color });
    success(res, grade, 'Calificación creada correctamente', 201);
  } catch (e) {
    if (e.message.includes('ya ha calificado')) {
      // Usamos la función 'error' para enviar una respuesta de error semánticamente correcta.
      return error(res, "No puede calificar dos veces al mismo proveedor.", 409);
    }
    error(res, 'Error al crear la calificación', 500, e);
  }
};

module.exports = {
  createGrade,
};
