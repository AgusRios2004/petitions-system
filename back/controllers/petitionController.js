const service = require('../services/petitionService');
const { error, success } = require('../middlewares/response');

exports.getPetitions = async (req, res) => {
    try {
        const { id_state, id_type_petition, id_customer } = req.query;

        const filter = {};
        if (id_state) filter.id_state = id_state;
        if (id_type_petition) filter.id_type_petition = id_type_petition;
        if (id_customer) filter.id_customer = id_customer;

        const petitions = await service.getPetitions(filter);
        return success(res, petitions);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};

exports.getPetitionById = async (req, res) => {
    try {
        const { id } = req.params;
        const petition = await service.getPetitionById(id);
        if (!petition) return error(res, 'Petición no encontrada', 404);
        return success(res, petition);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};

exports.getPetitionsByCustomerId = async (req, res) => {
    try {
        const { id_customer } = req.params;
        const petitions = await service.getPetitionsByCustomerId(id_customer);
        if (petitions.length === 0) return error(res, 'No se encontraron peticiones para este cliente', 404);
        return success(res, petitions);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};

exports.getPetitionsByState = async (req, res) => {
    try {   
        const { id_state } = req.params;
        const petitions = await service.getPetitionsByState(id_state);
        if (petitions.length === 0) return error(res, 'No se encontraron peticiones para este estado', 404);
        return success(res, petitions);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};

exports.getPetitionsByStateAndType = async (req, res) => {
    try {
        const { id_state, id_type_petition } = req.params;
        const petitions = await service.getPetitionsByStateAndType(id_state, id_type_petition);
        if (petitions.length === 0) return error(res, 'No se encontraron peticiones para este estado y tipo', 404);
        return success(res, petitions);
    } catch (e) {
        console.log('Error:', e);
        return error(res, e.message, 500);
    }
}

exports.createPetition = async (req, res) => {
    try {
        const { id_customer, id_type_petition, description, date_since, date_until, id_state } = req.body;

        if (!id_customer || !id_type_petition || !description || !date_since || !date_until || !id_state) {
            return error(res, 'Todos los campos son requeridos');
        }

        const petition = await service.createPetition({
            id_customer,
            id_type_petition,
            description,
            date_since,
            date_until,
            id_state,
            id_user_create: req.user.sub,
            id_user_update: req.user.sub,
        });

        return success(res, petition, 'Petición creada correctamente', 201);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};

exports.updatePetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_customer, id_type_petition, description, date_since, date_until, id_state } = req.body;

        if (!id_customer || !id_type_petition || !description || !date_since || !date_until || !id_state) {
            return error(res, 'Todos los campos son requeridos');
        }

        const petition = await service.updatePetition(id, {
            id_customer,
            id_type_petition,
            description,
            date_since,
            date_until,
            id_state,
            id_user_update: req.user.sub,
        });

        if (!petition) return error(res, 'Petición no encontrada', 404);
        return success(res, petition, 'Petición actualizada correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};

exports.deletePetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_state } = req.body;

        if (!id_state) return error(res, 'Estado es requerido');

        const ok = await service.deletePetition(id, { id_state, id_user_update: req.user.sub });
        if (!ok) return error(res, 'Petición no encontrada', 404);

        return success(res, ok, 'Petición eliminada correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};
