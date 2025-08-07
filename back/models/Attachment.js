module.exports = (sequelize, DataTypes) => {
    const Attachment = sequelize.define('Attachment', {
        id_attachment: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_petition: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_portfolio: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        path: {
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
        tableName: 'attachment',
        timestamps: false,
    });
}