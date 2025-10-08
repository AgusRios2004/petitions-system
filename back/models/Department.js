module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define('Department', {
        id_department: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        id_country: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_province: {
            type: DataTypes.INTEGER,
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
    }, {
        tableName: 'n_department',
        timestamps: false,
    }); 
    Department.associate = (models) => {
        Department.hasMany(models.City, {
            foreignKey: 'id_department',
            as: 'cities',
        });
        Department.belongsTo(models.Country, {
            foreignKey: 'id_country',
            as: 'country',
        });
    }
    return Department;
}