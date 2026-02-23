module.exports = (sequelize, DataTypes) => {
    const PetitionCategory = sequelize.define('PetitionCategory', {
        id_petition_category: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_petition: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_category: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'n_petition_category',
        timestamps: false,
    });

    PetitionCategory.associate = (models) => {
        PetitionCategory.belongsTo(models.Petition, {
            foreignKey: 'id_petition',
            as: 'petition',
        });

        PetitionCategory.belongsTo(models.Category, { // Asumo que tienes un modelo Category/NCategory
            foreignKey: 'id_category',
            as: 'category',
        });
    };

    return PetitionCategory;
};