const { Category } = require('../models');

class CategoryService {
    async getCategories(){
        return await Category.findAll();
    };
    
    async getCategoryById(id){
        return await Category.findByPk(id);
    };

    async createCategory(data){
        return await Category.create({
            name: data.name,
            id_user_create: data.idUserCreate,
            id_user_update: data.idUserUpdate,
        });
    };
    
    async updateCategory(id, data){
        const ok = await Category.findByPk(id);
        if(!ok) return null;
        await Category.update({
            name: data.name,
            id_user_update: data.idUserUpdate,
            date_update: new Date(),
        }, {where: {id_category: id}});
        return await Category.findByPk(id);
    };

    //Verify if category is used in articles, professions, interests or provider categories
    async deleteCategory(id){
        const ok = await Category.findByPk(id);
        if(!ok) return null;
        await Category.destroy({where: {id_category: id}});
        return true;
    };
}

module.exports = new CategoryService();