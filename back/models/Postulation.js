module.exports = (sequelize, DataTypes) => {
    const Postulation = sequelize.define('Postulation', {
        // SOLO DEBE EXISTIR ESTE CAMPO COMO PRIMARY KEY
        idpostulation: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_petition: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        winner: {
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
            type: DataTypes.STRING(255),
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
        // 🚨 CRÍTICO: NO DEBE HABER NINGÚN CAMPO id_postulation AQUÍ
        // Si tienes un campo así, ELIMÍNALO
    }, {
        tableName: 'postulation',
        timestamps: false,
    });

    Postulation.associate = (models) => {
        Postulation.belongsTo(models.Petition, {
            foreignKey: 'id_petition',
            as: 'petition',
        });

        Postulation.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'createdBy',
        });

        Postulation.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'updatedBy',
        });

        Postulation.hasMany(models.Inventory, {
            foreignKey: 'id_postulation',
            sourceKey: 'idpostulation',  // La PK real
            as: 'inventories',
        });
    };

    return Postulation;
};