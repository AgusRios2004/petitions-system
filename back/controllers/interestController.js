const interestService = require('../services/interestService');
const { success, error } = require('../middlewares/response');

exports.getInterestByCategory = async (req, res) => {
    try {
        const interests = await interestService.getInterestByCategorY(req.params.id_category);
        return success(res, interests, "Intereses obtenidos correctamente");
    } catch (e) {
        console.error("Error: ", e);
        return error(res, e);
    }
}