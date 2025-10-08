module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
        id_address: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        street: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        number: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        floor: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        apartment: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        postal_code: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        id_city: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date_create: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        date_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
    }, {
        tableName: 'n_address',
        timestamps: false,
    });
    Address.associate = (models) => {
        Address.belongsTo(models.City, {
            foreignKey: 'id_city',
            as: 'city',
        });
        Address.hasOne(models.Provider, {
            foreignKey: 'address_id',
            as: 'providerAddress',
        });
        Address.hasOne(models.Customer, {
            foreignKey: 'address_id',
            as: 'customerAddress',
        });
    }
    return Address;
}