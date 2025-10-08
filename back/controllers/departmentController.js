const departmentService = require('../services/departmentService');
const { error, success } = require('../middlewares/response');

exports.getDepartmentsByProvinceId = async (req, res) => {
    try {
        const departments = await departmentService.getDepartmentsByProvinceId(req.params.id_province);
        return success(res, departments);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo departamentos por provincia');
    }
}

exports.getDepartments = async (req, res) => {
    try {
        const departments = await departmentService.getDepartments();
        return success(res, departments);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo departamentos');
    }
}

exports.getDepartmentById = async (req, res) => {
    try {
        const department = await departmentService.getDepartmentById(req.params.id);
        if (!department) {
            return error(res, 'Departamento no encontrado', 404);
        }
        return success(res, department);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo departamento por ID');
    }
}

exports.createDepartment = async (req, res) => {
    try {
        const newDepartment = await departmentService.createDepartment(req.body);
        return success(res, newDepartment, 'Departamento creado', 201);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error creando departamento');
    }
}

exports.updateDepartment = async (req, res) => {
    try {
        const updated = await departmentService.updateDepartment(req.params.id, req.body);
        if (!updated) {
            return error(res, 'Departamento no encontrado', 404);
        }
        return success(res, updated, 'Departamento actualizado');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error actualizando departamento');
    }
}

exports.deleteDepartment = async (req, res) => {
    try {
        const deleted = await departmentService.deleteDepartment(req.params.id);
        if (!deleted) {
            return error(res, 'Departamento no encontrado', 404);
        }
        return success(res, deleted, 'Departamento eliminado');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error eliminando departamento');
    }
}