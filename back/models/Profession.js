module.exports = (sequelize, DataTypes) => {
    const Profession = sequelize.define('Profession', {
        id_profession: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        id_category: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
        },
        id_user_create: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
        },
        id_user_update: {
            type: DataTypes.BIGINT(20),
            allowNull: true,
        },
        date_create: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'profession',
        timestamps: false,
    });

    Profession.associate = (models) => {
        Profession.belongsTo(models.Category, {
            foreignKey: 'id_category',
            as: 'categories',
        });
        Profession.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'creator',
        });
        Profession.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'updater',
        });
    };

    return Profession;
};