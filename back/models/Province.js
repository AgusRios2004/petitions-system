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
        date_create: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        date_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'n_province',
        timestamps: false,
    });
    Province.associate = (models) => {
        Province.belongsTo(models.Country, {
            foreignKey: 'id_country',
            as: 'country',
        });
    }
    return Province;
}