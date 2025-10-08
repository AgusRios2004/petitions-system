module.exports = (sequelize, DataTypes) => {
    const Portfolio = sequelize.define('Portfolio', {
        id_portfolio: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_provider: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
        tableName: 'portfolio',
        timestamps: false,
    });
    Portfolio.associate = (models) => {
        Portfolio.belongsTo(models.Provider, {
            foreignKey: 'id_provider',
            as: 'provider',
        });
        Portfolio.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'createdBy',
        });
        Portfolio.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'updatedBy',
        });
    }
    return Portfolio;
}