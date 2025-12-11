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
        * Devuelve una subconsulta SQL con los IDs de las peticiones 
        * donde el proveedor ya tiene una postulación en estado 'PEN'
     */
    _getExcludedIdsLiteral(providerId) {
        // Usamos tu lógica exacta: Postulaciones del proveedor con estado 'PEN'
        return sequelize.literal(`(
            SELECT p.id_petition
            FROM postulation AS p 
            INNER JOIN state AS s ON s.id_state = p.id_state
            WHERE s.code = 'PEN'
            AND p.id_provider = ${sequelize.escape(providerId)}
        )`);
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
        // 1. Extraemos SOLO providerId (asumimos que usas el mismo ID para intereses y exclusión)
        const { providerId, ...restOfFilter } = filter;
        const { page = 1, limit = 10, sortBy = 'date_create', order = 'DESC' } = options;
        const offset = (page - 1) * limit;

        // 2. Configuración base del filtro
        const where = { ...restOfFilter };

        // 3. Filtro por descripción
        if (where.description) {
            where.description = { [Op.like]: `%${where.description}%` };
        }

        // 4. LÓGICA DEL PROVEEDOR (Intereses + Exclusión)
        if (providerId) {
            // A. Filtro de Intereses (Tu lógica original)
            const interestQuery = this._getProviderInterestFilter(providerId);
            
            // B. Filtro de Exclusión (NUEVO: Usamos NOT IN con SQL Literal)
            // Según tu log, la tabla se llama 'postulation' (sin n_ al principio)
            const exclusionLiteral = sequelize.literal(`(
                SELECT p.id_petition
                FROM postulation AS p
                WHERE p.id_provider = ${sequelize.escape(providerId)}
            )`);

            // C. Combinamos ambos en el WHERE
            where[Op.and] = [
                ...(where[Op.and] || []), // Mantenemos otros filtros AND si existen
                interestQuery,            // Debe coincidir con intereses
                { 
                    id_petition: { [Op.notIn]: exclusionLiteral } // NO debe estar en postulaciones
                }
            ];
        }

        // 5. Ejecutar consulta
        return await Petition.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, order]],
            distinct: true,
            include: this._getPetitionIncludes(),
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