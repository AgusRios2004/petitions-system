module.exports = (sequelize, DataTypes) => {
    const City = sequelize.define('City',{
        id_city: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        id_department: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        postal_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        id_user_create: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_user_update: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        date_create: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        date_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },{
        tableName: 'city',
        timestamps: false,
    });
    City.associate = (models) => {
        City.hasMany(models.Address, {
            foreignKey: 'id_city',
            as: 'addresses',
        });
        City.belongsTo(models.Department, {
            foreignKey: 'id_department',
            as: 'department',
        });
        City.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'createdBy',
        });
        City.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'updatedBy',
        });
    }
    return City;
}