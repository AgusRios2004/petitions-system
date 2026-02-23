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
        date_create: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        date_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },{
        tableName: 'n_city',
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
    }
    return City;
}