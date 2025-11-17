const { Grade, GradeProvider } = require('../models');

const createGrade = async (gradeData) => {
  const { customerId, providerId, rating, comment } = gradeData;

  if (!customerId || !providerId || !rating) {
    throw new Error('customerId, providerId, and rating are required');
  }

  // Crear la calificación
  const newGrade = await Grade.create({
    comment,
    rating,
    customerId,
    providerId,
    date: new Date(),
  });

  // Asociar la calificación con el proveedor en la tabla intermedia
  await GradeProvider.create({
    gradeId: newGrade.id,
    providerId: providerId,
  });

  return newGrade;
};

module.exports = {
  createGrade,
};
