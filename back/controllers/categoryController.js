const service = require('../services/categoryService');
const { error, success } = require('../middlewares/response');

exports.getCategories = async (req, res) => {
    try {
        const categories = await service.getCategories();
        return success(res, categories);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo categorías');
    }
}

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await service.getCategoryById(id);
        if(!category) return error(res, 'Categoría no encontrada', 404);
        return success(res, category);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error obteniendo categoría');
    }
}

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if(!name) return error(res, 'Nombre es requerido');
        const category = await service.createCategory({
            name,
            idUserCreate: req.user.sub,
            idUserUpdate: req.user.sub,
        });
        return success(res, category, 'Categoría creada correctamente', 201);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error creando categoría');
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if(!name) return error(res, 'Nombre es requerido');
        const category = await service.updateCategory(id, {
            name,
            idUserUpdate: req.user.sub,
        });
        if(!category) return error(res, 'Categoría no encontrada', 404);
        return success(res, category, 'Categoría actualizada correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error actualizando categoría');
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const ok = await service.deleteCategory(id);
        if(!ok) return error(res, 'Categoría no encontrada', 404);
        return success(res, null, 'Categoría eliminada correctamente', 204);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, 'Error eliminando categoría');
    }
}
