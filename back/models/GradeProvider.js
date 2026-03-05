module.exports = (sequelize, DataTypes) => {
    const GradeProvider = sequelize.define('GradeProvider', {
        id_grade_provider: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_provider: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_grade: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        coment: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        id_user_update: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_user_create: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        date_create: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'grade_provider',
        timestamps: false,
    });

    GradeProvider.associate = (models) => {
        GradeProvider.belongsTo(models.Provider, {
            foreignKey: 'id_provider',
            as: 'providers',
        });
        GradeProvider.belongsTo(models.Grade, {
            foreignKey: 'id_grade',
            as: 'grades',
        });
        GradeProvider.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'userCreate',
        });
        GradeProvider.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'userUpdate',
        });
    };

    return GradeProvider;
};