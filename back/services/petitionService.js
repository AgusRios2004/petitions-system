const { Petition, Customer, sequelize, Postulation, State, User, ProviderCategory, Interest } = require('../models');
const postulationService = require('./postulationService'); // Importamos el servicio de postulaciones
const { Op } = require('sequelize');

class PetitionService {
    
    // ... (todos los métodos GET que ya tenías, sin cambios)
    async getPetitions(filter = {}, options = {}) {
        const { providerId, ...restOfFilter } = filter;
        const { page = 1, limit = 10, sortBy = 'date_create', order = 'DESC' } = options;
        const offset = (page - 1) * limit;

        // 1. Configuración base del filtro
        const where = { ...restOfFilter };

        // Filtro por descripción (si existe)
        if (where.description) {
            where.description = { [Op.like]: `%${where.description}%` };
        }

        if (providerId) {
            const matchesInterestsQuery = sequelize.literal(`
                EXISTS (
                    SELECT 1
                    FROM n_interest AS i
                    INNER JOIN n_provider_cateogory AS pc ON pc.category_id = i.id_category
                    WHERE i.id_customer = \`Petition\`.\`id_customer\`  -- Conecta con la petición actual
                    AND pc.provider_id = ${sequelize.escape(providerId)} 
                )
            `);

            // Lo agregamos al WHERE asegurando que conviva con otros filtros
            where[Op.and] = [
                ...(where[Op.and] || []),
                matchesInterestsQuery
            ];
        }

        // 3. Ejecutamos la consulta trayendo TODOS los datos (Includes)
        return await Petition.findAndCountAll({
            where, // Aquí va el filtro poderoso
            limit,
            offset,
            order: [[sortBy, order]],
            distinct: true, // Importante para que el count sea correcto con tantos includes
            include: [
                'attachments', // Tus adjuntos
                {
                    model: Customer,
                    as: 'customers', // OJO: Revisa si tu alias es 'customers' o 'customer' en el modelo
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['name', 'lastname', 'profile_image'] 
                        }
                    ],
                    attributes: {
                        include: [
                            [
                                sequelize.literal(`(
                                    SELECT COALESCE(AVG(g.grade_number), 0) 
                                    FROM grade AS g 
                                    JOIN grade_customer AS gc ON g.id_grade = gc.id_grade 
                                    WHERE gc.id_customer = \`customers\`.\`id_customer\`
                                )`),
                                'average_rating'
                            ]
                        ]
                    }
                },
                'typePetitions',
                'states',
                'profession',
                'typeProvider',
                {
                    model: Postulation,
                    as: 'postulations',
                    include: [{
                        model: State,
                        as: 'states',
                    }]
                }
            ]
        });
    }

    async getPetitionById(id) {
        return await Petition.findByPk(id, {
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider']
        });
    }

    async getPetitionsByCustomerId(id_customer, filter = {}) {
        return await Petition.findAll({
            where: { id_customer, ...filter },
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider']
        });
    }

    // ... (resto de métodos GET) ...

    async createPetition(petitionData) {
        return await Petition.create(petitionData);
    }

    async updatePetition(id, petitionData) {
        const petition = await Petition.findByPk(id);
        if (!petition) return null;
        await petition.update(petitionData);
        return await Petition.findByPk(id, {
            include: ['attachments', 'customers', 'typePetitions', 'states', 'profession', 'typeProvider']
        });
    }

    /**
     * [NUEVO] Cancela una petición y todas sus postulaciones pendientes.
     * @param {number} petitionId - El ID de la petición a cancelar.
     * @param {number} userId - El ID del usuario (cliente) que realiza la acción.
     * @returns {Promise<Petition>} - La petición actualizada.
     */
    async cancelPetition(petitionId, userId) {
        const t = await sequelize.transaction();
        try {
            const petition = await Petition.findByPk(petitionId, { transaction: t });
            if (!petition) {
                const error = new Error("Petición no encontrada.");
                error.statusCode = 404;
                throw error;
            }

            const customer = await Customer.findOne({ where: { user_id: userId } });
            if (!customer || petition.id_customer !== customer.id_customer) {
                const error = new Error("No tienes permiso para cancelar esta petición.");
                error.statusCode = 403; // Forbidden
                throw error;
            }

            await petition.update({
                id_state: 6,
                id_user_update: userId,
                date_update: new Date()
            }, { transaction: t });

            await postulationService.cancelPostulationsForPetition(petitionId, userId, t, 6);

            await t.commit();
            return this.getPetitionById(petitionId);

        } catch (error) {
            await t.rollback();
            console.error("Error en el servicio de cancelación de petición:", error);
            if (!error.statusCode) error.statusCode = 500;
            throw error;
        }
    }
}

module.exports = new PetitionService();
