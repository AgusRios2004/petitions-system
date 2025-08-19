module.exports = (sequelize, DataTypes) => {
    const Module = sequelize.define('Module', {
        idmodule: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        name_module: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        security: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        administration: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        commercial: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        marketing: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        id_user_create: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        id_user_update: {
            type: DataTypes.DATE,
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
        tableName: 'module',
        timestamps: false,
    });

    Module.associate = (models) => {
        Module.belongsTo(models.User, { foreignKey: 'id_user_create', as: 'creator' });
        Module.belongsTo(models.User, { foreignKey: 'id_user_update', as: 'updater' });
    };

    return Module;
};