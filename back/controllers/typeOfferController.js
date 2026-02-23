const service = require('../services/typeOfferService');
const { error, success } = require('../middlewares/response');

exports.getTypeOffers = async (req, res) => {
    try {
        const { name } = req.query;
        const filter = {};
        
        if (name) filter.name = name;

        const typeOffers = await service.getAllTypeOffers(filter);
        return success(res, typeOffers);
    } catch (e) {
        console.error('Error getting type offers:', e);
        return error(res, e.message, 500);
    }
};

exports.getTypeOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const typeOffer = await service.getTypeOfferById(id);
        
        if (!typeOffer) return error(res, 'Tipo de oferta no encontrado', 404);
        
        return success(res, typeOffer);
    } catch (e) {
        console.error('Error getting type offer by id:', e);
        return error(res, e.message, 500);
    }
};

exports.createTypeOffer = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return error(res, 'El nombre es requerido');
        }

        const newTypeOffer = await service.createTypeOffer({
            name,
            id_user_create: req.user.sub, // Usuario del token
            id_user_update: req.user.sub
        });

        return success(res, newTypeOffer, 'Tipo de oferta creado correctamente', 201);
    } catch (e) {
        console.error('Error creating type offer:', e);
        return error(res, e.message, 500);
    }
};

exports.updateTypeOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return error(res, 'El nombre es requerido para actualizar');
        }

        const updated = await service.updateTypeOffer(id, {
            name,
            id_user_update: req.user.sub
        });

        if (!updated) return error(res, 'Tipo de oferta no encontrado', 404);

        return success(res, updated, 'Tipo de oferta actualizado correctamente');
    } catch (e) {
        console.error('Error updating type offer:', e);
        return error(res, e.message, 500);
    }
};

exports.deleteTypeOffer = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar si existen ofertas asociadas antes de borrar podría ser buena práctica aquí,
        // pero dependerá de si tu DB tiene ON DELETE CASCADE o RESTRICT.
        
        const deleted = await service.deleteTypeOffer(id);
        
        if (!deleted) return error(res, 'Tipo de oferta no encontrado', 404);
        
        return success(res, null, 'Tipo de oferta eliminado correctamente');
    } catch (e) {
        console.error('Error deleting type offer:', e);
        // Manejo específico si falla por FK constraint
        if (e.name === 'SequelizeForeignKeyConstraintError') {
            return error(res, 'No se puede eliminar porque hay ofertas asociadas a este tipo', 400);
        }
        return error(res, e.message, 500);
    }
};