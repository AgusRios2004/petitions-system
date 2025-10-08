const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: API para la gestión de departamentos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       required:
 *         - name_department
 *         - id_country
 *         - id_province
 *         - id_user_create
 *       properties:
 *         id_department:
 *           type: integer
 *           description: ID auto-generado del departamento.
 *         name_department:
 *           type: string
 *           description: Nombre del departamento.
 *         id_country:
 *           type: integer
 *           description: ID del país al que pertenece el departamento.
 *         id_province:
 *           type: integer
 *           description: ID de la provincia a la que pertenece el departamento.
 *         id_user_create:
 *           type: integer
 *           description: ID del usuario que creó el registro.
 *         id_user_update:
 *           type: integer
 *           description: ID del usuario que actualizó el registro por última vez.
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro.
 *         date_update:
 *           type: string
 *           format: date-time
 *           description: Fecha de la última actualización del registro.
 *       example:
 *         id_department: 1
 *         name_department: "Capital"
 *         id_country: 1
 *         id_province: 1
 *         id_user_create: 1
 *         id_user_update: 1
 *         date_create: "2023-01-01T12:00:00Z"
 *         date_update: "2023-01-01T12:00:00Z"
 *     DepartmentInput:
 *       type: object
 *       required:
 *         - name_department
 *         - id_country
 *         - id_province
 *         - id_user_create
 *       properties:
 *         name_department:
 *           type: string
 *           description: Nombre del departamento.
 *         id_country:
 *           type: integer
 *           description: ID del país al que pertenece el departamento.
 *         id_province:
 *           type: integer
 *           description: ID de la provincia a la que pertenece el departamento.
 *         id_user_create:
 *           type: integer
 *           description: ID del usuario que creó el registro.
 *         id_user_update:
 *           type: integer
 *           description: ID del usuario que actualizó el registro por última vez.
 *       example:
 *         name_department: "Capital"
 *         id_country: 1
 *         id_province: 1
 *         id_user_create: 1
 */

// Rutas para Departamentos
router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', departmentController.createDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

// Nueva ruta para obtener departamentos por ID de provincia
router.get('/:id_province/provinces', departmentController.getDepartmentsByProvinceId);

module.exports = router;
