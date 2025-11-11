const interestService = require('../services/interestService');
const { success, error } = require('../middlewares/response');

exports.getInterestsByCustomer = async (req, res) => {
    try {
        const interests = await interestService.getInterestsByCustomer(req.params.id_customer);
        return success(res, interests, "Intereses obtenidos correctamente");
    } catch (e) {
        console.error("Error: ", e);
        return error(res, e);
    }
}

exports.createInterest = async (req, res) => {
    try {
        const {id_category, id_customer} = req.body;
        const id_user_create = req.user.sub;
        const interest = await interestService.createInterest({
            id_category: id_category,
            id_customer: id_customer,
            id_user_create: id_user_create,
            date_create: new Date(),
            is_deleted: 0, // Añadimos el valor por defecto
        });
        return success(res, interest, "Interés creado correctamente", 201);
    } catch (e) {
        console.error(e);
        return error(res, e.message);
    }
}

exports.deleteInterest = async (req, res) => {
    try {
        const { id_interest } = req.params;
        const result = await interestService.deleteInterest(id_interest);
        if(result == 0) return error(res, "El interés no fue encontrado", 404);
        return success(res, { deleted: id_interest, count: result }, "Interés eliminado correctamente");
    } catch (e) {
        console.error(e);
        return error(res, e.message, 500);
    }
}