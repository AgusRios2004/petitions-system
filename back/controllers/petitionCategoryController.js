const service = require('../services/petitionCategoryService');
const { success, error } = require('../middlewares/response');

exports.getByPetition = async (req, res) => {
    try {
        const data = await service.getByPetitionId(req.params.id_petition);
        return success(res, data);
    } catch (e) {
        return error(res, e.message, 500);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id_petition, id_category } = req.params;
        await service.remove(id_petition, id_category);
        return success(res, null, 'Categoría eliminada de la petición');
    } catch (e) {
        return error(res, e.message, 500);
    }
};