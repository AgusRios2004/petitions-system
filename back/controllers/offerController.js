const service = require('../services/offerService');
const { error, success } = require('../middlewares/response');

exports.getOffers = async (req, res) => {
    try {
        const { 
            id_type_offer, id_provider, status, name, activeNow, categories,
            page, limit, sortBy, order 
        } = req.query;

        const filter = {};
        if (id_type_offer) filter.id_type_offer = id_type_offer;
        if (id_provider) filter.id_provider = id_provider;
        if (status) filter.status = status;
        if (name) filter.name = name;
        if (activeNow === 'true') filter.activeNow = true;
        if (categories && categories !== 'undefined') {
            const parsedCategories = categories.split(',').map(Number).filter(n => !isNaN(n));
            if (parsedCategories.length > 0) filter.categories = parsedCategories;
        }

        const options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            sortBy: sortBy || 'date_create',
            order: order || 'DESC'
        };

        const { count, rows } = await service.getOffers(filter, options);

        const response = {
            totalItems: count,
            totalPages: Math.ceil(count / options.limit),
            currentPage: options.page,
            offers: rows
        };

        return success(res, response);
    } catch (e) {
        console.error('Error getting offers:', e);
        return error(res, e.message, 500);
    }
};

exports.getOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await service.getOfferById(id);
        if (!offer) return error(res, 'Oferta no encontrada', 404);
        return success(res, offer);
    } catch (e) {
        console.error('Error getting offer by id:', e);
        return error(res, e.message, 500);
    }
};

exports.getOfferByProviderId = async (req, res) => {
    try {
        const { id_provider } = req.params;
        const id = id_provider;
        const offers = await service.getOfferByProviderId(id);
        return success(res, offers, "Ofertas encontradas", 200)
    } catch (e) {
        console.error('Error getting offer by provider id:', e);
        return error(res, e.message, 500);
    }
}

exports.createOffer = async (req, res) => {
    try {
        let { id_type_offer, name, title, description, date_open, date_close, id_provider } = req.body;

        // Mapear title a name si name no existe
        if (!name && title) name = title;

        if (!id_type_offer || !name || !description || !id_provider) {
            return error(res, 'Faltan campos requeridos (id_type_offer, name/title, description, id_provider)');
        }

        // Valores por defecto para fechas si no se envían
        if (!date_open) date_open = new Date();
        if (!date_close) date_close = new Date(new Date().setFullYear(new Date().getFullYear() + 10)); // 10 años por defecto

        const newOffer = await service.createOffer({
            id_type_offer,
            name,
            description,
            date_open,
            date_close,
            id_provider,
            user_create_id: req.user.sub, // ID del usuario logueado
            status: 'active'
        });

        return success(res, newOffer, 'Oferta creada correctamente', 201);
    } catch (e) {
        console.error('Error creating offer:', e);
        return error(res, e.message, 500);
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, date_open, date_close, status, id_type_offer } = req.body;

        const updatedOffer = await service.updateOffer(id, {
            name, description, date_open, date_close, status, id_type_offer,
            user_update_id: req.user.sub
        });

        if (!updatedOffer) return error(res, 'Oferta no encontrada', 404);
        return success(res, updatedOffer, 'Oferta actualizada correctamente');
    } catch (e) {
        console.error('Error updating offer:', e);
        return error(res, e.message, 500);
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await service.deleteOffer(id, req.user.sub);
        
        if (!deleted) return error(res, 'Oferta no encontrada', 404);
        return success(res, null, 'Oferta eliminada correctamente');
    } catch (e) {
        console.error('Error deleting offer:', e);
        return error(res, e.message, 500);
    }
};