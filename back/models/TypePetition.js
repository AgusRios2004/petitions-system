module.exports = (sequelize, DataTypes) => {
    const TypePetition = sequelize.define('TypePetition', {
        id_type_petition: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
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
        tableName: 'type_petition',
        timestamps: false,
    });
    TypePetition.associate = (models) => {
        TypePetition.hasMany(models.Petition, {
            foreignKey: 'id_type_petition',
            as: 'petitions',
        });
        TypePetition.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'createdBy',
        });
        TypePetition.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'updatedBy',
        });
    }
    return TypePetition;
}