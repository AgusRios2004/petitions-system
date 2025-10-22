const { Article, Category, User } = require('../models');

class ArticleService {

    async getAllArticles(filter = {}) {
        return await Article.findAll({
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'createdBy' },
                { model: User, as: 'updatedBy' },
            ],
            where: filter,
        });
    }

    async getArticleById(id) {
        return await Article.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'createdBy' },
                { model: User, as: 'updatedBy' },
            ],
        });
    }
}

module.exports = new ArticleService();
