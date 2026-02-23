const { Attachment } = require('../models');

/**
 * Crea un nuevo adjunto en la base de datos.
 * @param {object} data - Datos del adjunto.
 * @returns {Promise<Attachment>}
 */
exports.createAttachment = async (data) => {
    return await Attachment.create(data);
};

/**
 * Obtiene un adjunto por su ID.
 * @param {number} id_attachment - ID del adjunto.
 * @returns {Promise<Attachment>}
 */
exports.getAttachmentById = async (id_attachment) => {
    return await Attachment.findByPk(id_attachment);
};

/**
 * Obtiene todos los adjuntos asociados a una petición.
 * @param {number} id_petition - ID de la petición.
 * @returns {Promise<Attachment[]>}
 */
exports.getAttachmentsByPetitionId = async (id_petition) => {
    return await Attachment.findAll({ where: { id_petition } });
};

/**
 * Obtiene todos los adjuntos asociados a un portafolio.
 * @param {number} id_portfolio - ID del portafolio.
 * @returns {Promise<Attachment[]>}
 */
exports.getAttachmentsByPortfolioId = async (id_portfolio) => {
    return await Attachment.findAll({ where: { id_portfolio } });
};

/**
 * Elimina un adjunto de la base de datos.
 * @param {number} id_attachment - ID del adjunto a eliminar.
 * @returns {Promise<number>} - El número de filas eliminadas.
 */
exports.deleteAttachment = async (id_attachment) => {
    return await Attachment.destroy({ where: { id_attachment } });
};
