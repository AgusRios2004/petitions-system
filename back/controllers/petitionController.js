const service = require('../services/petitionService');
const { error, success } = require('../middlewares/response');
const notificationService = require('../services/notificationService');

exports.getPetitions = async (req, res) => {
    try {
        const { 
            id_state, id_type_petition, id_customer, id_profession, providerId,
            id_type_provider, description, page, limit, sortBy, order 
        } = req.query;

        // Build filter object
        const filter = {};
        if (id_state) filter.id_state = id_state;
        if (id_type_petition) filter.id_type_petition = id_type_petition;
        if (id_customer) filter.id_customer = id_customer;
        if (id_profession) filter.id_profession = id_profession;
        if (id_type_provider) filter.id_type_provider = id_type_provider;
        if (providerId) filter.providerId = providerId; // Añadimos el nuevo filtro
        if (description) filter.description = description;

        // Build options object for pagination and sorting
        const options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            sortBy: sortBy || 'date_create',
            order: order || 'DESC'
        };

        const { count, rows } = await service.getPetitions(filter, options);

        const response = {
            totalItems: count,
            totalPages: Math.ceil(count / options.limit),
            currentPage: options.page,
            petitions: rows
        };

        return success(res, response);
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
        // 1. Extraemos categoryIds del body
        const { 
            id_customer, 
            id_type_petition, 
            description, 
            date_since, 
            date_until, 
            id_state, 
            id_profession, 
            id_type_provider,
            categoryIds // <--- NUEVO CAMPO (Array de IDs, ej: [1, 5, 8])
        } = req.body;

        if (!id_customer || !id_type_petition || !description || !date_since || !date_until || !id_state) {
            return error(res, 'Los campos id_customer, id_type_petition, description, date_since, date_until, id_state son requeridos');
        }

        // 2. Pasamos categoryIds como segundo argumento al servicio
        const petition = await service.createPetition({
            id_customer,
            id_type_petition,
            description,
            date_since,
            date_until,
            id_state: 3, // Estado inicial (ej: Pendiente)
            id_profession, 
            id_type_provider, 
            id_user_create: req.user.sub,
            id_user_update: req.user.sub,
            is_deleted: false,
        }, categoryIds); // <--- AQUÍ LO PASAMOS

        const eventBus = req.app.get('eventBus');
        notificationService.notificationMatchingProvider(petition, eventBus);

        return success(res, petition, 'Petición creada correctamente', 201);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};

exports.updatePetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_customer, id_type_petition, description, date_since, date_until, id_state, id_profession, id_type_provider } = req.body;

        // Manteniendo la validación original para los campos centrales
        if (!id_customer || !id_type_petition || !description || !date_since || !date_until || !id_state) {
            return error(res, 'Los campos id_customer, id_type_petition, description, date_since, date_until, id_state son requeridos');
        }

        const petition = await service.updatePetition(id, {
            id_customer,
            id_type_petition,
            description,
            date_since,
            date_until,
            id_state,
            id_profession, // Se actualizará si se proporciona
            id_type_provider, // Se actualizará si se proporciona
            id_user_update: req.user.sub,
        });

        if (!petition) return error(res, 'Petición no encontrada', 404);
        return success(res, petition, 'Petición actualizada correctamente');
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};


exports.cancelPetition = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub; // O req.user.id, dependiendo de cómo esté en tu token
        const eventBus = req.app.get('eventBus');

        const petition = await service.cancelPetition(Number(id), userId, eventBus);
        
        return success(res, petition, 'Petición y postulaciones asociadas canceladas correctamente.');

    } catch (e) {
        console.error('Error en el controlador de cancelación de petición:', e);
        return error(res, e.message, e.statusCode || 500);
    }
};