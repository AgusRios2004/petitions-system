module.exports = (sequelize, DataTypes) => {
    const Provider = sequelize.define('Provider',{
        id_provider: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_type_provider: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_profession:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        address_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'n_provider',
        timestamps: false,
    })
    return Provider;
}