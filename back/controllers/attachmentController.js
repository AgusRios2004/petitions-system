const service = require('../services/attachmentService');
const { error, success } = require('../middlewares/response');
const fs = require('fs');
const path = require('path');

/**
 * Sube y crea un nuevo adjunto.
 */
exports.createAttachment = async (req, res) => {
    // 1. Validar que se haya subido un archivo
    if (!req.file) {
        return error(res, 'No se ha subido ningún archivo.', 400);
    }

    const { name } = req.body;

    // --- Validación Estricta de IDs ---
    // Se parsean los IDs para asegurar que sean números válidos.
    const petitionId = req.body.id_petition ? parseInt(req.body.id_petition, 10) : null;
    const portfolioId = req.body.id_portfolio ? parseInt(req.body.id_portfolio, 10) : null;

    const isPetitionIdValid = petitionId && !isNaN(petitionId) && petitionId > 0;
    const isPortfolioIdValid = portfolioId && !isNaN(portfolioId) && portfolioId > 0;

    // 2. Validar que pertenezca a una petición O un portafolio, y que los IDs sean válidos.
    if ((!isPetitionIdValid && !isPortfolioIdValid) || (isPetitionIdValid && isPortfolioIdValid)) {
        // Si la validación falla, eliminamos el archivo que se subió para no dejar basura
        fs.unlinkSync(req.file.path);
        return error(res, 'El adjunto debe estar asociado a un ID de petición o de portafolio que sea válido y numérico, pero no a ambos.', 400);
    }

    try {
        const attachmentData = {
            id_petition: isPetitionIdValid ? petitionId : null,
            id_portfolio: isPortfolioIdValid ? portfolioId : null,
            name: name || req.file.originalname, // Usar el título del body o el nombre original como fallback
            path: req.file.path, // Path donde multer lo guardó
            id_user_create: req.user.sub, // Asumiendo que el id del usuario viene en el token
        };

        const newAttachment = await service.createAttachment(attachmentData);
        return success(res, newAttachment, 'Adjunto creado correctamente.', 201);

    } catch (e) {
        // Si hay un error en la BD, también eliminamos el archivo subido
        fs.unlinkSync(req.file.path);
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};

/**
 * Elimina un adjunto.
 */
exports.deleteAttachment = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar el adjunto en la BD para obtener el path del archivo
        const attachment = await service.getAttachmentById(id);
        if (!attachment) {
            return error(res, 'Adjunto no encontrado.', 404);
        }

        // 2. Eliminar el archivo físico del servidor
        // Se comprueba que el archivo exista antes de intentar borrarlo
        if (fs.existsSync(attachment.path)) {
            fs.unlinkSync(attachment.path);
        } else {
            console.warn(`El archivo físico no se encontró en la ruta: ${attachment.path}, se procederá a borrar solo el registro de la BD.`);
        }

        // 3. Eliminar el registro de la base de datos
        await service.deleteAttachment(id);

        return success(res, true, 'Adjunto eliminado correctamente.');

    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};

/**
 * Obtiene un adjunto por su ID.
 */
exports.getAttachmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const attachment = await service.getAttachmentById(id);
        if (!attachment) {
            return error(res, 'Adjunto no encontrado', 404);
        }
        return success(res, attachment);
    } catch (e) {
        console.error('Error: ', e);
        return error(res, e.message, 500);
    }
};
