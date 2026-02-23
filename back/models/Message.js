module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
        id_message: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        conversation_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        read: {
            type: DataTypes.BOOLEAN, // Sequelize maneja TINYINT(1) como BOOLEAN
            allowNull: false,
            defaultValue: false,
        },
    }, {
        tableName: 'n_message',
        timestamps: false,
    });

    Message.associate = (models) => {
        // Un mensaje pertenece a una Conversación
        Message.belongsTo(models.Conversation, {
            foreignKey: 'conversation_id',
            as: 'conversation',
        });

        // Un mensaje pertenece a un Usuario (el que lo envía)
        Message.belongsTo(models.User, {
            foreignKey: 'sender_id',
            as: 'sender',
        });
    };

    return Message;
};
