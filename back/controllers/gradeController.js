const gradeService = require('../services/gradeService');
const { error, success } = require('../middlewares/response');

const createGrade = async (req, res, next) => {
  try {
    // Usamos los nombres correctos que vienen del front: grade_number y comment.
    // El frontend envía id_provider y id_customer.
    const { id_provider, id_customer, grade_number, comment, id_color } = req.body;
    const id_user_create = req.user.sub; // req.user.sub es el ID del usuario.
    // Pasamos un objeto con los nombres que espera el servicio/modelo.
    const grade = await gradeService.createGrade({ id_provider, id_customer, grade_number, comment, id_user_create, id_color });
    success(res, grade, 'Calificación creada correctamente', 201);
  } catch (error) {
    console.log("Error: ", error)
    // Si el error es por duplicado, enviamos un 409 (Conflict)
    if (error.message.includes('ya ha calificado')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message || 'Error al crear la calificación' });
  }
};

module.exports = {
  createGrade,
};
