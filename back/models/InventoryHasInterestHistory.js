module.exports = (sequelize, DataTypes) => {
    const InventoryHasInterestHistory = sequelize.define('InventoryHasInterestHistory', {
        id_inventory_has_interest_history: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_inventory: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_interest_history: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date_create: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        id_user_create: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_user_update: {
            type: DataTypes.INTEGER,
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