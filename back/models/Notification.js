module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize('Notificaciont', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.String,
            allowNull: false,
        },
        message: {
            type: DataTypes.String,
            allowNull: false,
        },
        notification_type: {
            type: DataTypes.String,
            allowNull: false,
        },
        is_read: {
            type: DataTypes.Boolean,
            defaultValue: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        related_postulation_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        related_petition_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
        }
    }, {
        tableName: 'n_notification',
        timestamps: false,
    });
    
    Notification.associate = (models) => {
        Notification.belongsTo(models.User, {
            foreignKey: 'id_user',
            as: 'user',
        });
    };

    return Notification;
}