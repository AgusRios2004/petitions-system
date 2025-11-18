const { Grade, GradeProvider, GradeCustomer, sequelize } = require('../models');

const createGrade = async (gradeData) => {
  const t = await sequelize.transaction();
  try {
    // Usamos los nombres correctos que nos pasa el controlador
    const { id_customer, id_provider, grade_number, comment, id_user_create, id_color } = gradeData;

    // 1. Verificar si ya existe una calificación de este cliente para este proveedor.
    const existingGrade = await Grade.findOne({
      include: [
        {
          model: GradeProvider,
          as: 'gradeProviders',
          where: { id_provider: id_provider },
          required: true,
        },
        {
          model: GradeCustomer,
          as: 'gradeCustomers',
          where: { id_customer: id_customer },
          required: true,
        },
      ],
      transaction: t,
    });

    if (existingGrade) {
      throw new Error('Este cliente ya ha calificado a este proveedor.');
    }

    // 2. Crear la calificación principal (Grade)
    const newGrade = await Grade.create({
      grade_number,
      id_user_create,
      id_color,
      date_create: new Date(),
    }, { transaction: t });

    // 3. Asociar la calificación con el proveedor (GradeProvider)
    await GradeProvider.create({
      id_provider,
      id_grade: newGrade.id_grade,
      coment: comment,
      id_user_create,
      date_create: new Date(),
    }, { transaction: t });

    // 4. Asociar la calificación con el cliente (GradeCustomer)
    const newGradeCustomer = await GradeCustomer.create({
      id_customer,
      id_grade: newGrade.id_grade,
      comment: comment, // También guardamos el comentario aquí si es relevante
      id_user_create,
      date_create: new Date(),
    }, { transaction: t });

    await t.commit();
    return newGradeCustomer; // Devolvemos la relación con el cliente
  } catch (error) {
    await t.rollback();
    throw error; // Re-lanzamos el error para que el controlador lo maneje
  }
};

module.exports = {
  createGrade,
};
