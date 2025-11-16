const portfolioService = require('../services/portfolioService');
const { success, error } = require('../middlewares/response');

exports.createPortfolio = async (req, res) => {    
    try {
        const { name, description, providerId } = req.body;
        const id_user_create = req.user.sub;

        const portfolioData = {
            id_provider: providerId,
            name: name,
            description: description,
            id_user_create: id_user_create,
        }

        const file = req.file;

        if (!file) return error(res, "No se ha subido ningún archivo", 400);

        const newPortfolio = await portfolioService.createPortfolio(portfolioData, file);

        return success(res, newPortfolio, "Porfolio creado correctamente.", 201)

    } catch (e) {
        console.error('Error: ', e);
        error(res, "Error", 500, e);
    }
}

exports.getPortfoliosByProvider = async (req, res) => {
    try {
        const { id_provider } = req.params;
        
        if (!id_provider) return error(res, "id provider null");

        const portfolios = await portfolioService.getPortfoliosByProvider(id_provider);

        success(res, portfolios, "Porfolios obtenidos correctamente", 200)
    } catch (e) {
        console.error("Error: ", e);
        error(res, "Error al obtener los porfolio", 500, e)
    }
}

exports.deletePortfolio = async (req, res) => {
    try {
        const {id} = req.params;
        const {id_provider} = req.body;
        await portfolioService.deletePortfolio(id, id_provider);
        success(res, null, "Borrado exitosamente", 200);
    } catch (e) {
        console.error("Error: ", e);
        error(res, e.message, 500, e);
    }
}