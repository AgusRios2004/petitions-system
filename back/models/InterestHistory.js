module.exports = (sequelize, DataTypes) => {
    const InterestHistory = sequelize.define('InterestHistory', {
        id_interest_history: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        id_interest: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        id_user_update: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        id_user_create: {
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
    }, {
        tableName: 'interest_history',
        timestamps: false,
    });

    InterestHistory.associate = (models) => {
        InterestHistory.belongsTo(models.Interest, {
            foreignKey: 'id_interest',
            as: 'interest',
        });
        InterestHistory.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'userCreate',
        });
        InterestHistory.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'userUpdate',
        });
        InterestHistory.hasMany(models.InventoryHasInterestHistory, {
            foreignKey: 'id_interest_history',
            sourceKey: 'id_interest_history',
            as: 'inventoryInterestHistories',
        });
    };

    return InterestHistory;
};