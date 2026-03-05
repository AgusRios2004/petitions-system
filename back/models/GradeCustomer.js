module.exports = (sequelize, DataTypes) => {
    const GradeCustomer = sequelize.define('GradeCustomer', {
        idGradeCustomer: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date_create: {
            type: DataTypes.DATE(6),
            allowNull: true,
        },
        date_update: {
            type: DataTypes.DATE(6),
            allowNull: true,
        },
        id_user_create: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_user_update: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        comment: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        id_customer: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_grade: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'grade_customer',
        timestamps: false,
    });

    GradeCustomer.associate = (models) => {
        GradeCustomer.belongsTo(models.Customer, {
            foreignKey: 'id_customer',
            as: 'customers',
        });
        GradeCustomer.belongsTo(models.Grade, {
            foreignKey: 'id_grade',
            as: 'grades',
        });
        GradeCustomer.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'userCreate',
        });
        GradeCustomer.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'userUpdate',
        });
    };

    return GradeCustomer;
};