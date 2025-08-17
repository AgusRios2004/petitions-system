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
    Customer.associate = (models)  => {
        Customer.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
        Customer.hasMany(models.Petition, {
            foreignKey: 'id_customer',
            as: 'petitions',
        });
        Customer.hasMany(models.Postulation, {
            foreignKey: 'id_postulation',
            as: 'postulations',
        });
    }
    return Customer;
}