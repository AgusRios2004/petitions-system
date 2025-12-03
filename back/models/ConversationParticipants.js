module.exports = (sequelize, DataTypes) => {
    const Participant = sequelize.define('ConverstionParticipants', {
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

    Participant.associate = (models) => {
        // Un participante pertenece a una Conversación
        Participant.belongsTo(models.Conversation, { foreignKey: 'conversation_id' });

        // Un participante pertenece a un Usuario
        Participant.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return Participant;
};
