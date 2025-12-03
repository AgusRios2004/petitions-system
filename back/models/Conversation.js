module.exports = (sequelize, DataTypes) => {
    const Conversation = sequelize.define('Conversation', {
        id_conversation: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        petition_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'n_conversation',
        timestamps: false,
    });

    Conversation.associate = (models) => {
        // Una conversación pertenece a una Petición.
        Conversation.belongsTo(models.Petition, {
            foreignKey: 'petition_id',
            as: 'petition',
        });

        // Una conversación tiene muchos Mensajes.
        Conversation.hasMany(models.Message, {
            foreignKey: 'conversation_id',
            as: 'messages',
        });

        // Una conversación tiene muchos Participantes.
        Conversation.hasMany(models.Participant, {
            foreignKey: 'conversation_id',
            as: 'participants',
        });

        // También puedes definir una relación Muchos a Muchos con Usuarios a través de la tabla de Participantes.
        Conversation.belongsToMany(models.User, {
            through: models.Participant,
            foreignKey: 'conversation_id',
            otherKey: 'user_id',
            as: 'users'
        });
    };

    return Conversation;
};
