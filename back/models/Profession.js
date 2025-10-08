module.exports = (sequelize, DataTypes) => {
    const Profession = sequelize.define('Profession', {
        id_profession: {
            type: DataTypes.INTEGER(11),
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

    return Profession;
};