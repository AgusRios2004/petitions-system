module.exports = (sequelize, DataTypes) => {
    const Provider = sequelize.define('Provider',{
        id_provider: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_type_provider: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_profession:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        address_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'n_provider',
        timestamps: false,
    });
    Provider.associate = (models) => {
        Provider.hasMany(models.Portfolio, {
            foreignKey: 'id_provider',
            as: 'portfolios',
        });
        Provider.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
        Provider.belongsTo(models.Address, {
            foreignKey: 'address_id',
            as: 'address',
        });
        Provider.hasMany(models.ProviderCategory, {
            foreignKey: 'provider_id',
            sourceKey: 'id_provider',
            as: 'providerCategories',
        });
        Provider.belongsTo(models.TypeProvider, {
            foreignKey: 'id_type_provider',
            as: 'typeProvider',
        });
        Provider.hasMany(models.GradeProvider, {
            foreignKey: 'id_provider',
            sourceKey: 'id_provider',
            as: 'grades',
        });

        Provider.hasMany(models.Postulation, {
            foreignKey: 'id_provider',
            as: 'postulations',
        });

        Provider.hasMany(models.Availability, {
            foreignKey: 'id_provider',
            as: 'availabilities',
        });
    }
    return Provider;
}