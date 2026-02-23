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
    // --- VALIDACIÓN DE SOLAPAMIENTO ---
    const { id_provider, id_week, id_from_hour, id_until_hour } = data;

    // 1. Obtener los objetos Hour para saber el tiempo real
    const fromHour = await db.Hour.findByPk(id_from_hour);
    const untilHour = await db.Hour.findByPk(id_until_hour);

    if (!fromHour || !untilHour) {
        const error = new Error('Horas seleccionadas inválidas.');
        error.status = 400;
        throw error;
    }

    const getMinutes = (timeStr) => {
        const [h, m] = timeStr.split(' ')[0].split(':').map(Number);
        return h * 60 + m;
    };

    const newStart = getMinutes(fromHour.name);
    const newEnd = getMinutes(untilHour.name);

    // 2. Buscar disponibilidades existentes para ese proveedor y día
    // Nota: Reutilizamos getAllAvailabilities o hacemos una consulta directa más ligera
    const existing = await this.getAllAvailabilities({ id_provider, id_week });

    // 3. Comprobar intersección
    const hasOverlap = existing.some(avail => {
        const existStart = getMinutes(avail.fromHour.name);
        const existEnd = getMinutes(avail.untilHour.name);
        return (newStart < existEnd && newEnd > existStart);
    });

    if (hasOverlap) {
        const error = new Error('El rango horario se superpone con una disponibilidad existente.');
        error.status = 409; // Conflict
        throw error;
    }

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
