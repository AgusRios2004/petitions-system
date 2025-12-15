module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define('Offer', {
        offer_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_type_offer: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        date_open: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_close: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('draft', 'active', 'closed', 'archived'),
            defaultValue: 'draft',
        },
        id_provider: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_create_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_update_id: {
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
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        tableName: 'n_offers',
        timestamps: false,
    });

    Offer.associate = (models) => {
        Offer.belongsTo(models.TypeOffer, {
            foreignKey: 'id_type_offer',
            as: 'typeOffer',
        });

        Offer.belongsTo(models.Provider, {
            foreignKey: 'id_provider',
            as: 'provider',
        });

        Offer.belongsTo(models.User, {
            foreignKey: 'user_create_id',
            as: 'createdBy',
        });

        Offer.belongsTo(models.User, {
            foreignKey: 'user_update_id',
            as: 'updatedBy',
        });
    };

    return Offer;
};