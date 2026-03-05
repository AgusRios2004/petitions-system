module.exports = (sequelize, DataTypes) => {
    const Profession = sequelize.define('Profession', {
        id_profession: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        }
    }, {
        tableName: 'n_profession',
        timestamps: false,
    });

    Profession.associate = (models) => {
        Profession.hasMany(models.Provider, {
            foreignKey: 'id_profession',
            as: 'providers',
        });
    }

    return Profession;
};