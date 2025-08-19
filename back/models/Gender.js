module.exports = (sequelize, DataTypes) => {
    const Gender = sequelize.define('Gender', {
        id_gender: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        gender: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        id_user_create: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        id_user_update: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        date_create: {
            type: DataTypes.DATE(6),
            allowNull: true,
        },
        date_update: {
            type: DataTypes.DATE(6),
            allowNull: true,
        },
        id_customer: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
    }, {
        tableName: 'gender',
        timestamps: false,
    });

    Gender.associate = (models) => {
        Gender.belongsTo(models.User, { foreignKey: 'id_user_create', as: 'creator' });
        Gender.belongsTo(models.User, { foreignKey: 'id_user_update', as: 'updater' });
        Gender.belongsTo(models.Customer, { foreignKey: 'id_customer', as: 'customers' });
    };

    return Gender;
};