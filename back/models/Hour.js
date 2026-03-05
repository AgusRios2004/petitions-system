module.exports = (sequelize, DataTypes) => {
    const Hour = sequelize.define('Hour', {
        id_hour: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        id_user_create: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        id_user_update: {
            type: DataTypes.STRING(45),
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
        tableName: 'hour',
        timestamps: false,
    });

    Hour.associate = (models) => {
//        Hour.belongsTo(models.Week, { foreignKey: 'id_week', as: 'week' });
    };

    return Hour;
};