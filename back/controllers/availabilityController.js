const service = require('../services/availabilityService');
const { success, error } = require('../middlewares/response');
const { Provider } = require('../models');

// Helper para encontrar el providerId a partir del userId
const getProviderIdFromUser = async (userId) => {
  const provider = await Provider.findOne({ where: { user_id: userId } });
  if (!provider) {
    const e = new Error('Usuario no es un proveedor o no fue encontrado.');
    e.status = 403; // Forbidden
    throw e;
  }
  return provider.id_provider;
};

exports.getAvailability = async (req, res) => {
  try {
    const providerId = await getProviderIdFromUser(req.user.sub);
    const availabilities = await service.getAllAvailabilities({ id_provider: providerId });
    return success(res, availabilities, 'Disponibilidad obtenida.');
  } catch (e) {
    return error(res, e.message, e.status || 500);
  }
};

exports.getAvailabilityById = async (req, res) => {
  try {
    const { id } = req.params; // ID de la disponibilidad
    const availability = await service.getAvailabilityById(id);
    return success(res, availability, 'Disponibilidad obtenida por ID.');
  } catch (e) {
    return error(res, e.message, e.status || 500);
  }
};

exports.createAvailability = async (req, res) => {
  try {
    const userId = req.user.sub;
    const providerId = await getProviderIdFromUser(userId);
    const { id_from_hour, id_until_hour, id_week } = req.body;

    if (!id_from_hour || !id_until_hour || !id_week) {
      return error(res, 'Faltan datos obligatorios: id_from_hour, id_until_hour, id_week.', 400);
    }

    const newAvailability = await service.createAvailability({
      id_provider: providerId,
      id_from_hour,
      id_until_hour,
      id_week,
      id_user_create: userId,
    });

    return success(res, newAvailability, 'Disponibilidad creada.', 201);
  } catch (e) {
    return error(res, e.message, e.status || 500);
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const userId = req.user.sub;
    const providerId = await getProviderIdFromUser(userId);
    const { id } = req.params; // ID de la disponibilidad
    const dataToUpdate = req.body;

    const updatedAvailability = await service.updateAvailability(id, providerId, {
      ...dataToUpdate,
      id_user_update: userId,
    });

    return success(res, updatedAvailability, 'Disponibilidad actualizada.');
  } catch (e) {
    return error(res, e.message, e.status || 500);
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    const userId = req.user.sub;
    const providerId = await getProviderIdFromUser(userId);
    const { id } = req.params; // ID de la disponibilidad

    await service.deleteAvailability(id, providerId);

    return success(res, null, 'Disponibilidad eliminada.');
  } catch (e) {
    return error(res, e.message, e.status || 500);
  }
};