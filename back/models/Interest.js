module.exports = (sequelize, DataTypes) => {
    const Interest = sequelize.define('Interest', {
        id_interest: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_customer: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_category: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_deleted: {
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
            allowNull: false,
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'n_interest',
        timestamps: false,
    });

    Interest.associate = (models) => {
        Interest.belongsTo(models.Customer, {
            foreignKey: 'id_customer',
            as: 'customer',
        });
        Interest.belongsTo(models.Category, {
            foreignKey: 'id_category',
            as: 'category',
        });
        Interest.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'userCreate',
        });
        Interest.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'userUpdate',
        });
        Interest.hasMany(models.InterestHistory, {
            foreignKey: 'id_interest',
            sourceKey: 'id_interest',
            as: 'interestHistories',
        });
    };

    return Interest;
};