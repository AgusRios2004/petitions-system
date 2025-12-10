const { Grade, Provider, Customer, User, sequelize } = require('../models');

class GradeService {
    
    async getGrades(filter = {}) {
        if (filter.id_user_create) {
            // Usamos Raw Query para evitar errores de asociación (EagerLoadingError)
            // ya que las relaciones Grade <-> Provider/Customer son a través de tablas intermedias.
            const query = `
                SELECT 
                    g.id_grade,
                    g.grade_number,
                    gc.comment AS customer_comment,
                    gp.coment AS provider_comment,
                    g.date_create,

                    p.id_provider, 
                    up.name AS p_name, up.lastname AS p_lastname,

                    c.id_customer,
                    uc.name AS c_name, uc.lastname AS c_lastname
                FROM ${Grade.tableName} g
                LEFT JOIN grade_customer gc ON g.id_grade = gc.id_grade
                LEFT JOIN grade_provider gp ON g.id_grade = gp.id_grade
                LEFT JOIN ${Provider.tableName} p ON gp.id_provider = p.id_provider
                LEFT JOIN ${User.tableName} up ON p.user_id = up.id_user
                LEFT JOIN ${Customer.tableName} c ON gc.id_customer = c.id_customer
                LEFT JOIN ${User.tableName} uc ON c.user_id = uc.id_user
                WHERE g.id_user_create = :id_user_create
                ORDER BY g.date_create DESC
            `;

            const grades = await sequelize.query(query, {
                replacements: { id_user_create: filter.id_user_create },
                type: sequelize.constructor.QueryTypes.SELECT
            });

            return grades.map(row => ({
                id_grade: row.id_grade,
                grade_number: row.grade_number,
                comment: row.provider_comment || row.customer_comment,
                date_create: row.date_create,
                provider: row.id_provider ? {
                    id_provider: row.id_provider,
                    user: { name: row.p_name, lastname: row.p_lastname }
                } : null,
                customer: row.id_customer ? {
                    id_customer: row.id_customer,
                    user: { name: row.c_name, lastname: row.c_lastname }
                } : null
            }));
        }

        return await Grade.findAll({ order: [['date_create', 'DESC']] });
    }

    async createGrade(data) {
        return await Grade.create(data);
    }
}

module.exports = new GradeService();