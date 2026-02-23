module.exports = (sequelize, DataTypes) => {
    const Week = sequelize.define('Week', {
        id_week: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    }, {
        tableName: 'week',
        timestamps: false,
    });

    return Week;
};