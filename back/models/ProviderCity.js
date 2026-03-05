module.exports = (sequelize, DataTypes) => {
    const ProviderCity = sequelize.define('ProviderCity', {
        id_provider: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        id_city: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
    }, {
        tableName: 'n_provider_city',
        timestamps: false,
    });

    ProviderCity.associate = (models) => {
        ProviderCity.belongsTo(models.Provider, {
            foreignKey: 'id_provider',
            as: 'providers',
        });
        ProviderCity.belongsTo(models.City, {
            foreignKey: 'id_city',
            as: 'cities',
        });
    };

    return ProviderCity;
};