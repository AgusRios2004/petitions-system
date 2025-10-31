const db = require('../models');
const { Availability } = db;

class AvailabilityService {

  async getAllAvailabilities(filter = {}) {
    const whereClause = {};
    // Incluir modelos relacionados para obtener información completa
    const includeClause = [
      { model: db.Provider, as: 'provider', 
        include: [{ model: db.User, as: 'user' }]
       },
      { model: db.Hour, as: 'fromHour' },
      { model: db.Hour, as: 'untilHour' },
      { model: db.Week, as: 'week' },
    ];

    // Aplicar filtros de forma segura
    if (filter.id_provider) {
      whereClause.id_provider = filter.id_provider;
    }
    if (filter.id_week) {
      whereClause.id_week = filter.id_week;
    }
    
    return await Availability.findAll({
      include: includeClause,
      where: whereClause,
    });
  }

  async getAvailabilityById(id) {
    return await Availability.findByPk(id, {
      include: [
        {
          model: db.Provider,
          as: 'provider',
          include: [{ model: db.User, as: 'user' }]
        },
        { model: db.Hour, as: 'fromHour' },
        { model: db.Hour, as: 'untilHour' },
        { model: db.Week, as: 'week' },
      ],
    });
  }

  async createAvailability(data) {
    return await Availability.create(data);
  }

  async updateAvailability(id, providerId, data) {
    const availability = await Availability.findByPk(id);
    if (!availability) {
      const error = new Error('Disponibilidad no encontrada.');
      error.status = 404;
      throw error;
    }

    // Verificación de propiedad: el providerId de la disponibilidad debe coincidir con el del usuario
    if (availability.id_provider !== providerId) {
      const error = new Error('No tienes permiso para actualizar esta disponibilidad.');
      error.status = 403; // Forbidden
      throw error;
    }

    return await availability.update(data);
  }

  async deleteAvailability(id, providerId) {
    const availability = await Availability.findByPk(id);
    if (!availability) {
      const error = new Error('Disponibilidad no encontrada.');
      error.status = 404;
      throw error;
    }

    // Verificación de propiedad
    if (availability.id_provider !== providerId) {
      const error = new Error('No tienes permiso para eliminar esta disponibilidad.');
      error.status = 403; // Forbidden
      throw error;
    }

    return await availability.destroy();
  }
}

module.exports = new AvailabilityService();
