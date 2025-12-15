const { PetitionCategory, Category } = require('../models');

class PetitionCategoryService {
    // Agregar múltiples categorías a una petición (Usado por PetitionService)
    async addCategoriesToPetition(id_petition, categoryIds, transaction = null) {
        const records = categoryIds.map(id_category => ({
            id_petition,
            id_category
        }));
        return await PetitionCategory.bulkCreate(records, { transaction });
    }

    // Obtener categorías de una petición
    async getByPetitionId(id_petition) {
        return await PetitionCategory.findAll({
            where: { id_petition },
            include: [{ model: Category, as: 'category' }]
        });
    }

    // Eliminar
    async remove(id_petition, id_category) {
        return await PetitionCategory.destroy({
            where: { id_petition, id_category }
        });
    }
}

module.exports = new PetitionCategoryService();