module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
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
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        notification_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
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