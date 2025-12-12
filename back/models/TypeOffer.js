module.exports = (sequelize, DataTypes) => {
    const TypeOffer = sequelize.define('TypeOffer', {
        id_type_offer: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
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
        }
    }, {
        tableName: 'n_type_offer',
        timestamps: false, // Manejamos las fechas manualmente según tu esquema
    });

    TypeOffer.associate = (models) => {
        // Relación con Offer (Un tipo tiene muchas ofertas)
        TypeOffer.hasMany(models.Offer, {
            foreignKey: 'id_type_offer',
            as: 'offers',
        });

        // Relaciones de auditoría con User
        TypeOffer.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'createdBy',
        });

        TypeOffer.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'updatedBy',
        });
    };

    return TypeOffer;
};