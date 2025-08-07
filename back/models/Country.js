module.exports = (sequelize, DataTypes) => {
    const Country = sequelize.define('Country', {
        id_country: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        argentina: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
        tableName: 'country',
        timestamps: false,
    })
    return Country;
}