module.exports = (sequelize, DataTypes) => {
    const Inventory = sequelize.define('Inventory', {
        id_inventory: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_article: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        cost: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        id_postulation: {
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
        date_update: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        date_create: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
    }, {
        tableName: 'inventory',
        timestamps: false,
    });

    Inventory.associate = (models) => {
        Inventory.belongsTo(models.Article, {
            foreignKey: 'id_article',
            as: 'article'
        });

        Inventory.belongsTo(models.Postulation, {
            foreignKey: 'id_postulation',
            as: 'postulation'
        });

        Inventory.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'userUpdate'
        });

        Inventory.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'userCreate'
        });

        Inventory.hasMany(models.InventoryHasInterestHistory, {
            foreignKey: 'id_inventory',
            as: 'inventoryInterestHistories'
        });
    };

    return Inventory;
};