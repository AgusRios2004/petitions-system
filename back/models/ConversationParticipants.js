module.exports = (sequelize, DataTypes) => {
    const ConversationParticipants = sequelize.define('ConversationParticipants', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        conversation_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'n_conversation_participants',
        timestamps: false,
    });

    ConversationParticipants.associate = (models) => {
        // Un participante pertenece a una Conversación
        ConversationParticipants.belongsTo(models.Conversation, { foreignKey: 'conversation_id' });

        // Un participante pertenece a un Usuario
        ConversationParticipants.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return ConversationParticipants;
};
