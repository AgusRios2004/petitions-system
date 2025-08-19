module.exports = (sequelize, DataTypes) => {
    const TypeProvider = sequelize.define('TypeProvider', {
        id_type_provider: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    }, {
        tableName: 'n_type_provider',
        timestamps: false,
    });

    TypeProvider.associate = (models) => {
        TypeProvider.hasMany(models.Provider, {
            foreignKey: 'id_type_provider',
            sourceKey: 'id_type_provider',
            as: 'typeProviders',
        });
    };

    return TypeProvider;
};