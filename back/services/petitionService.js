const { 
    Petition, Customer, sequelize, Postulation, State, User, 
    Provider, ProviderCategory, Interest, PetitionCategory, Category 
} = require('../models');
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

    _getProviderInterestFilter(providerId) {
        return sequelize.literal(`
            EXISTS (
                SELECT 1
                FROM n_petition_category AS ppc
                INNER JOIN n_provider_cateogory AS pc ON pc.category_id = ppc.id_category
                WHERE ppc.id_petition = \`Petition\`.\`id_petition\`
                AND pc.provider_id = ${sequelize.escape(providerId)} 
            )
        `);
    }

    _getExcludedIdsLiteral(providerId) {
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
        * ADAPTACIÓN: Agregado 'categories' para traer las categorías de la petición
     */
    _getPetitionIncludes() {
        return [
            'attachments',
            // 2. NUEVO INCLUDE: Para ver las categorías de la petición
            {
                model: PetitionCategory,
                as: 'petitionCategories', // Asegúrate de que este alias coincida con tu modelo Petition.hasMany(PetitionCategory)
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id_category', 'name']
                    }
                ]
            },
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
                // ... (tu lógica de rating se queda igual) ...
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

    // ... (Método getPetitions se mantiene igual) ...
    async getPetitions(filter = {}, options = {}) {
       const { providerId, ...restOfFilter } = filter;
       const { page = 1, limit = 10, sortBy = 'date_create', order = 'DESC' } = options;
       const offset = (page - 1) * limit;

       const where = { ...restOfFilter };

       if (where.description) {
           where.description = { [Op.like]: `%${where.description}%` };
       }

       if (providerId) {
           const interestQuery = this._getProviderInterestFilter(providerId);
           const exclusionLiteral = sequelize.literal(`(
               SELECT p.id_petition
               FROM postulation AS p
               WHERE p.id_provider = ${sequelize.escape(providerId)}
           )`);

           where[Op.and] = [
               ...(where[Op.and] || []),
               interestQuery,
               { id_petition: { [Op.notIn]: exclusionLiteral } }
           ];
       }

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
            // ADAPTACIÓN: Incluir categories aquí también
            include: [
                'attachments', 
                'customers', 
                'typePetitions', 
                'states', 
                'profession', 
                'typeProvider',
                {
                    model: Category,
                    as: 'categories',
                    through: { attributes: [] }
                }
            ]
        });
    }

    
    async createPetition(petitionData, categoryIds = []) {
        // Iniciamos una transacción para asegurar que se crea la petición Y sus categorías, o nada.
        const t = await sequelize.transaction();
        
        try {
            // A. Crear la Petición
            const newPetition = await Petition.create(petitionData, { transaction: t });

            // B. Crear las relaciones en n_petition_category
            if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
                const categoryRecords = categoryIds.map(idCat => ({
                    id_petition: newPetition.id_petition,
                    id_category: idCat
                }));

                await PetitionCategory.bulkCreate(categoryRecords, { transaction: t });
            }

            // C. Confirmar cambios
            await t.commit();

            // D. Retornar la petición completa (con las categorías cargadas)
            return await this.getPetitionById(newPetition.id_petition);

        } catch (error) {
            // Si algo falla, deshacemos todo
            await t.rollback();
            throw error;
        }
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
        // ... (Tu código de cancelPetition se mantiene intacto) ...
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