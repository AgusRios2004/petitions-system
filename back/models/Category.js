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
        }
    }, {
        tableName: 'n_category',
        timestamps: false,
    });
    
    Category.associate = (models) => {
        Category.hasMany(models.Article, {
            foreignKey: 'id_category',
            as: 'articles',
        });
        Category.hasMany(models.ProviderCategory, {
            foreignKey: 'category_id',
            sourceKey: 'id_category',
            as: 'providerCaregories',
        });
        Category.hasMany(models.Interest, {
            foreignKey: 'id_category',
            sourceKey: 'id_category',
            as: 'interests',
        });

        Category.belongsToMany(models.Petition, {
            through: models.PetitionCategory,
            foreignKey: 'id_category',
            otherKey: 'id_petition',
            as: 'petitions'
        });
    }

    return Category;
}