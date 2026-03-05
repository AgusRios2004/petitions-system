module.exports = (sequelize, DataTypes) => {
    const ProviderCategory = sequelize.define('ProviderCategory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        provider_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'n_provider_cateogory',
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