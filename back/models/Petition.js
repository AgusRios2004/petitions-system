module.exports = (sequelize, DataTypes) => {
    const Petitios = sequelize.define('Petition', {
        id_petition: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_customer:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_type_petition: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, 
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        date_since: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_until: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        id_state:{
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
            defaultValue: DataTypes.NOW,
        },
        date_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },      
    }, {
        tableName: 'petition',
        timestamps: false,
    })
    return Petitios;
}