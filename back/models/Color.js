module.exports = (sequelize, DataTypes) => {
    const Color = sequelize.define('Color', {
        id_color: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        color_name: {
            type: DataTypes.STRING(50),
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
            type: DataTypes.DATE,
            allowNull: true,
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'color',
        timestamps: false,
    });

    Color.associate = (models) => {
        Color.belongsTo(models.User, { foreignKey: 'id_user_create', as: 'creator' });
        Color.belongsTo(models.User, { foreignKey: 'id_user_update', as: 'updater' });
        Color.hasMany(models.Grade, {foreignKey: 'id_color', sourceKey: 'id_color', as: 'grades'});
    };

    return Color;
};