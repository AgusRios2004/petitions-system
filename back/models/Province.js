module.exports = (sequelize, DataTypes) => {
    const Province = sequelize.define('Province', {
        id_province: {
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
        mendoza: {
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
    }, {
        tableName: 'province',
        timestamps: false,
    });
    Province.associate = (models) => {
        Province.belongsTo(models.Country, {
            foreignKey: 'id_country',
            as: 'countries',
        });
        Province.belongsTo(models.User, {
            foreignKey: 'id_user_creaate',
            as: 'createdBy',
        });
        Province.belongsTo(models.User, {
            foreingKey: 'id_user_update',
            as: 'updatedBy',
        });
    }
    return Province;
}