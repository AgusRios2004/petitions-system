module.exports = (sequelize, DataTypes) => {
    const InventoryHasInterestHistory = sequelize.define('InventoryHasInterestHistory', {
        id_inventory_has_interest_history: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        id_inventory: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        id_interest_history: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        date_create: {
            type: DataTypes.DATE(6),
            allowNull: true,
        },
        date_update: {
            type: DataTypes.DATE(6),
            allowNull: true,
        },
        id_user_create: {
            type: DataTypes.BIGINT(20),
            allowNull: true,
        },
        id_user_update: {
            type: DataTypes.BIGINT(20),
            allowNull: true,
        },
    }, {
        tableName: 'inventory_has_interest_history',
        timestamps: false,
    });

    InventoryHasInterestHistory.associate = (models) => {
        InventoryHasInterestHistory.belongsTo(models.Inventory, {
            foreignKey: 'id_inventory',
            as: 'inventories',
        });
        InventoryHasInterestHistory.belongsTo(models.InterestHistory, {
            foreignKey: 'id_interest_history',
            as: 'interestHistories',
        });
        InventoryHasInterestHistory.belongsTo(models.User, {
             foreignKey: 'id_user_create',
             as: 'userCreate',
        });
         InventoryHasInterestHistory.belongsTo(models.User, {
             foreignKey: 'id_user_update',
             as: 'userUpdate',
        });
    };

    return InventoryHasInterestHistory;
};