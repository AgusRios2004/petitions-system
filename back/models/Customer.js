module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
        id_customer: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        dni: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        address_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'n_customer',
        timestamps: false,
    });

    return Customer;
}