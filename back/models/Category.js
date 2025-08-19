module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        id_category: {
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
        },
    }, {
        tableName: 'category',
        timestamps: false,
    });
    
    Category.associate = (models) => {
        Category.hasMany(models.Article, {
            foreignKey: 'id_category',
            as: 'articles',
        });
        Category.belongsTo(models.User, {
            foreignKey: 'id_user_creaate',
            as: 'createdBy',
        });
        Category.belongsTo(models.User, {
            foreingKey: 'id_user_update',
            as: 'updatedBy',
        });
        Category.hasMany(models.ProviderCategory, {
            foreignKey: 'category_id',
            sourceKey: 'id_category',
            as: 'providerCaregories',
        });
        Category.hasMany(models.Profession, {
            foreignKey: 'id_category',
            sourceKey: 'id_category',
            as: 'professions',
        });
        Category.hasMany(models.Interest, {
            foreignKey: 'id_category',
            sourceKey: 'id_category',
            as: 'interests',
        });
    }

    return Category;
}