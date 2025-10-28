const articleService = require('../services/articleService');
const { success, error } = require('../middlewares/response');

exports.getAllArticles = async (req, res) => {
    try {
        const articles = await articleService.getAllArticles(req.query);
        success(res, articles, 'Artículos obtenidos correctamente');
    } catch (e) {
        error(res, 'Error obteniendo los artículos', 500, e);
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const article = await articleService.getArticleById(req.params.id);
        if (!article) {
            return error(res, 'Artículo no encontrado', 404);
        }
        success(res, article, 'Artículo obtenido correctamente');
    } catch (e) {
        error(res, 'Error obteniendo el artículo', 500, e);
    }
};
