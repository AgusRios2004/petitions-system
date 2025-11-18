const { Grade, GradeProvider, GradeCustomer, sequelize } = require('../models');

const createGrade = async (gradeData) => {
  const t = await sequelize.transaction();
  try {
    const { id_customer, id_provider, grade_number, comment, id_user_create, id_color } = gradeData;

    // Escenario 1: Un cliente está calificando a un PROVEEDOR.
    // Se identifica porque se reciben tanto el ID del proveedor (calificado) como el del cliente (autor).
    if (id_provider) {
      // 1.1. Validar que este cliente no haya calificado ya a este proveedor.
      const existingGrade = await Grade.findOne({
        where: { id_user_create: id_user_create }, // El autor es el usuario logueado
        include: [{
          model: GradeProvider,
          as: 'gradeProviders',
          where: { id_provider: id_provider }, // Y el calificado es este proveedor
          required: true
        }],
        transaction: t
      });

      if (existingGrade) {
        throw new Error('Ya has calificado a este proveedor.');
      }

      // 1.2. Crear la calificación principal (Grade)
      const newGrade = await Grade.create({
        grade_number,
        id_user_create,
        id_color,
        date_create: new Date(),
      }, { transaction: t });

      // 1.3. Asociar con el proveedor (el calificado)
      await GradeProvider.create({
        id_provider,
        id_grade: newGrade.id_grade,
        coment: comment, // El modelo GradeProvider usa 'coment'
        id_user_create,
        date_create: new Date(),
      }, { transaction: t });
      
      await t.commit();
      return newGrade;

    // Escenario 2: Un proveedor está calificando a un CLIENTE.
    // Se identifica porque se recibe el ID del cliente pero no el del proveedor (el proveedor es el autor).
    } else if (id_customer) {
      // 2.1. Validar que este proveedor no haya calificado ya a este cliente.
      const existingGrade = await Grade.findOne({
        where: { id_user_create: id_user_create }, // El autor es el usuario logueado (proveedor)
        include: [{
          model: GradeCustomer,
          as: 'gradeCustomers',
          where: { id_customer: id_customer }, // Y el calificado es este cliente
          required: true
        }],
        transaction: t
      });

      if (existingGrade) {
        throw new Error('Ya has calificado a este cliente.');
      }

      // 2.2. Crear la calificación principal (Grade)
      const newGrade = await Grade.create({
        grade_number,
        id_user_create,
        id_color,
        date_create: new Date(),
      }, { transaction: t });

      // 2.3. Asociar la calificación con el cliente (el calificado)
      await GradeCustomer.create({
        id_customer,
        id_grade: newGrade.id_grade,
        comment: comment,
        id_user_create,
        date_create: new Date(),
      }, { transaction: t });

      await t.commit();
      return newGrade;

    } else {
      throw new Error('Datos insuficientes para crear la calificación. Se requiere id_provider o id_customer.');
    }
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createGrade,
};
