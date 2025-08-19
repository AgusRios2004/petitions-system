module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
        id_message: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
        },
        id_petition: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        id_sender_user: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        id_receiver_user: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        viewed: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
        date_create: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'message',
        timestamps: false,
    });

    Message.associate = (models) => {
        Message.belongsTo(models.Petition, {
            foreignKey: 'id_petition',
            as: 'petition',
        });
        Message.belongsTo(models.User, {
            foreignKey: 'id_sender_user',
            as: 'sender',
        });
        Message.belongsTo(models.User, {
            foreignKey: 'id_receiver_user',
            as: 'receiver',
        });
    };

    return Message;
};