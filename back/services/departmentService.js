const { Department } = require('../models');

class DepartmentSerice {
  /**
   * Obtiene todos los departamentos.
   * @returns {Promise<Array>} Lista de departamentos.
   */
  async getAllDepartments() {
    return await Department.findAll();
  }

  /**
   * Obtiene un departamento por su ID.
   * @param {number} id_department - ID del departamento.
   * @returns {Promise<Object>} Departamento encontrado.
   */
  async getDepartmentById(id_department) {
    return await Department.findByPk(id_department);
  }

  /**
   * Obtiene departamentos por el ID de la provincia.
   * @param {number} id_province - ID de la provincia.
   * @returns {Promise<Array>} Lista de departamentos de la provincia.
   */
  async getDepartmentsByProvinceId(id_province) {
    return await Department.findAll({
      where: { id_province },
    });
  }

  /**
   * Crea un nuevo departamento.
   * @param {Object} departmentData - Datos del departamento a crear.
   * @returns {Promise<Object>} Nuevo departamento creado.
   */
  async createDepartment(departmentData) {
    return await Department.create(departmentData);
  }

  /**
   * Actualiza un departamento existente.
   * @param {number} id_department - ID del departamento a actualizar.
   * @param {Object} departmentData - Nuevos datos del departamento.
   * @returns {Promise<Array>} [numeroDeFilasActualizadas, departamentosActualizados].
   */
  async updateDepartment(id_department, departmentData) {
    return await Department.update(departmentData, {
      where: { id_department },
      returning: true,
    });
  }

  /**
   * Elimina un departamento.
   * @param {number} id_department - ID del departamento a eliminar.
   * @returns {Promise<number>} Número de filas eliminadas.
   */
  async deleteDepartment(id_department) {
    return await Department.destroy({
      where: { id_department },
    });
  }
};

module.exports = new DepartmentSerice();
