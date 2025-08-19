module.exports = (sequelize, DataTypes) => {
    const Postulation = sequelize.define('Postulation', {
        idpostulation: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_customer:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_petition: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wimner: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        proposal: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        current: {
            type: DataTypes.VARCHAR(255),
            allowNull: false,
        },
        id_state: {
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
        tableName: 'postulation',
        timestamps: false, 
    });
    Postulation.associate = (models) => {
        Postulation.belognsTo(models.Customer,{
            foreignKey: 'id_customer', 
            as: 'customers',
        });
        Postulation.belognsTo(models.Petition, {
            foreignKey: 'id_petition',
            as: 'petitions',
        });
        Postulation.belongsTo(models.User, {
            foreignKey: 'id_user_creaate',
            as: 'createdBy',
        });
        Postulation.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'updatedBy',
        });
        Postulation.hasMany(models.Inventory, {
            foreignKey: 'id_inventory',
            sourceKey: 'id_inventory',
            as: 'inventories',
        });
    }
    return Postulation;
}