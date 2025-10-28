const { Article, Category, User } = require('../models');

class ArticleService {

    async getAllArticles(filter = {}) {
        const whereClause = {};
        const includeClause = [
            { model: Category, as: 'category' },
            { model: User, as: 'createdBy' },
            { model: User, as: 'updatedBy' },
        ];

        if (filter.id_category) {
            whereClause.id_category = filter.id_category;
        }

        if (filter.name) {
            whereClause.name = filter.name;
        }

        // Any other direct filters on Article model will also be applied
        // No need to destructure categoryName anymore
        Object.assign(whereClause, filter);

        return await Article.findAll({
            include: includeClause,
            where: whereClause,
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
