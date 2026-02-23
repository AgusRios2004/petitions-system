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
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        address_id:{
            type: DataTypes.INTEGER,
            allowNull: true,
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

        Customer.hasMany(models.Gender, {
            foreignKey: 'id_customer',
            sourceKey: 'id_customer',
            as: 'genders',
        });
        Customer.hasMany(models.GradeCustomer, {
            foreignKey: 'id_customer',
            sourceKey: 'id_customer',
            as: 'gradeCustomers',
        });
        Customer.hasMany(models.Interest, {
            foreignKey: 'id_customer',
            sourceKey: 'id_customer',
            as: 'interests',
        });
        Customer.belongsTo(models.Address, {
            foreignKey: 'address_id',
            targetKey: 'id_address',
            as: 'address',
        });
    }
    return Customer;
}