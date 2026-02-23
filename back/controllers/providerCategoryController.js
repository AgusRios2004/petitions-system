const { ProviderCategory, Provider, Category } = require('../models');

// @desc    Create a new provider-category relationship
// @route   POST /api/provider-category
// @access  Private
const createProviderCategory = async (req, res) => {
  const { id_provider, id_category } = req.body;

  // Basic validation
  if (!id_provider || !id_category) {
    return res.status(400).json({ error: 'Se requieren id_provider y id_category.' });
  }

  try {
    // Check if provider and category exist
    const provider = await Provider.findByPk(id_provider);
    if (!provider) {
      return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }

    const category = await Category.findByPk(id_category);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    // Check if the relationship already exists
    const existingLink = await ProviderCategory.findOne({
      where: { provider_id: id_provider, category_id: id_category },
    });

    if (existingLink) {
      return res.status(409).json({ error: 'El proveedor ya tiene esta categoría.' });
    }

    // Create the new relationship
    const newProviderCategory = await ProviderCategory.create({
      provider_id: id_provider,
      category_id: id_category,
      id_user_create: req.user.id_user, // Assuming id_user is in req.user from auth middleware
    });

    res.status(201).json({ data: newProviderCategory });
  } catch (error) {
    console.error('Error al crear la categoría del proveedor:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// @desc    Delete a provider-category relationship
// @route   DELETE /api/provider-category/:id
// @access  Private
const deleteProviderCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const providerCategory = await ProviderCategory.findByPk(id);

    if (!providerCategory) {
      return res.status(404).json({ error: 'Relación proveedor-categoría no encontrada.' });
    }

    // Optional: Check if the user deleting is the actual provider
    // This requires more complex logic to check ownership, for now we'll trust the frontend
    // as long as the user is authenticated.

    await providerCategory.destroy();

    res.status(200).json({ data: { message: 'Categoría eliminada del proveedor con éxito.' } });
  } catch (error) {
    console.error('Error al eliminar la categoría del proveedor:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  createProviderCategory,
  deleteProviderCategory,
};
