module.exports = (sequelize, DataTypes) => {
    const ProviderCategory = sequelize.define('ProviderCategory', {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        provider_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
    }, {
        tableName: 'n_provider_category',
        timestamps: false,
    });
    ProviderCategory.associate = (models) => {
        ProviderCategory.belongsTo(models.Provider, {
            foreignKey: 'provider_id',
            as: 'provider',
        });
        ProviderCategory.belongsTo(models.Category, {
            foreignKey: 'category_id',
            as: 'category',
        });
    }
    return ProviderCategory;
}