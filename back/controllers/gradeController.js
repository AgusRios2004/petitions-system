const gradeService = require('../services/gradeService');
const { error, success } = require('../middlewares/response');

const createGrade = async (req, res, next) => {
  try {
    const { customerId, providerId, rating, comment } = req.body;
    const grade = await gradeService.createGrade({ customerId, providerId, rating, comment });
    success(res, grade, 'Calificación creada correctamente', 201);
  } catch (error) {
    console.log("Error: ", error)
    error(res, error.message, 500, error)
  }
};

module.exports = {
  createGrade,
};
