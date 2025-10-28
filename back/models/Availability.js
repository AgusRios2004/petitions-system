module.exports = (sequelize, DataTypes) => {
    const Availability = sequelize.define('Availability', {
        id_availability: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        id_from_hour: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        id_until_hour: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        id_week: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        id_provider: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        id_user_create: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        id_user_update: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        date_create: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'availability',
        timestamps: false,
    });

    Availability.associate = (models) => {
        Availability.belongsTo(models.Provider, {
            foreignKey: 'id_provider',
            as: 'provider',
        });
        Availability.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'userCreate',
        });
        Availability.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'userUpdate',
        });
        Availability.belongsTo(models.Hour, { foreignKey: 'id_from_hour', as: 'fromHour' });
        Availability.belongsTo(models.Hour, { foreignKey: 'id_until_hour', as: 'untilHour' });
        Availability.belongsTo(models.Week, { foreignKey: 'id_week', as: 'week' });
    };

    return Availability;
};