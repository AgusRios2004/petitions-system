const genderService = require('../services/genderService');
const { success, error } = require('../middlewares/response') 

exports.getGenders = async (req, res) => {
    try {
        const genders = await genderService.getGenders();
        return success(res, genders, 'Genders obtenidos exitosamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message);
    }
}