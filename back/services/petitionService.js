const { Petition, Customer, sequelize, Postulation, State, User, Provider, ProviderCategory, Interest } = require('../models');
const postulationService = require('./postulationService'); 
const { Op } = require('sequelize');

// Caché simple para estados
const stateCache = {};

async function getStateId(code) {
    if (stateCache[code]) return stateCache[code];
    const state = await State.findOne({ where: { code } });
    if (!state) throw new Error(`Estado con código '${code}' no encontrado.`);
    stateCache[code] = state.id_state;
    return state.id_state;
}

class PetitionService {

    // --- MÉTODOS PRIVADOS (Helpers) ---

    /**
     * Construye el filtro SQL para coincidencias de intereses del proveedor
     */
    _getProviderInterestFilter(providerId) {
        return sequelize.literal(`
            EXISTS (
                SELECT 1
                FROM n_interest AS i
                INNER JOIN n_provider_cateogory AS pc ON pc.category_id = i.id_category
                WHERE i.id_customer = \`Petition\`.\`id_customer\`
                AND pc.provider_id = ${sequelize.escape(providerId)} 
            )
        `);
    }

    /**
     * Construye el filtro SQL para excluir postulaciones existentes
     */
    _getExcludeAppliedFilter(providerId) {
        return sequelize.literal(`
            NOT EXISTS (
                SELECT 1
                FROM postulation AS p
                WHERE p.id_petition = \`Petition\`.\`id_petition\`
                AND p.id_provider = ${sequelize.escape(providerId)}
            )
        `);
    }

    /**
     * Devuelve la configuración masiva de relaciones (Includes)
     */
    _getPetitionIncludes() {
        return [
            'attachments',
            {
                model: Customer,
                as: 'customers',
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
                                FROM \`grade\` AS g
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
                include: [
                    { model: State, as: 'states' },
                    {
                        model: Provider,
                        as: 'provider',
                        include: [{
                            model: User,
                            as: 'user',
                            attributes: ['name', 'lastname']
                        }]
                    }
                ]
            }
        ];
    }

    async getPetitions(filter = {}, options = {}) {
        const { providerId, excludeAppliedByProviderId, ...restOfFilter } = filter;
        const { page = 1, limit = 10, sortBy = 'date_create', order = 'DESC' } = options;
        const offset = (page - 1) * limit;

        // 1. Configuración base del filtro
        const where = { ...restOfFilter };

        // 2. Aplicar filtro por descripción
        if (where.description) {
            where.description = { [Op.like]: `%${where.description}%` };
        }

        // 3. Aplicar filtro de intereses (Delegamos la lógica sucia al helper)
        if (providerId) {
            const interestQuery = this._getProviderInterestFilter(providerId);
            where[Op.and] = [ ...(where[Op.and] || []), interestQuery ];
        }

        // 4. Aplicar filtro de exclusión (Delegamos la lógica sucia al helper)
        if (excludeAppliedByProviderId) {
            const excludeQuery = this._getExcludeAppliedFilter(excludeAppliedByProviderId);
            where[Op.and] = [ ...(where[Op.and] || []), excludeQuery ];
        }

        // 5. Ejecutar consulta (Ahora se ve súper limpio)
        return await Petition.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, order]],
            distinct: true,
            include: this._getPetitionIncludes() // Llamada al helper
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

    async cancelPetition(petitionId, userId, eventBus) {
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
                error.statusCode = 403;
                throw error;
            }

            const petitionCancelledState = await getStateId('CAN'); 

            await petition.update({
                id_state: petitionCancelledState,
                id_user_update: userId,
                date_update: new Date()
            }, { transaction: t });

            await postulationService.cancelPostulationsForPetition(petitionId, userId, t, 'CAN', null, eventBus);

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