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
    }, {
        tableName: 'department',
        timestamps: false,
    })
    return Department;
}