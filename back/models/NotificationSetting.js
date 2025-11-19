module.exports = (sequelize, DataTypes) => {
    const NotificationSettings = sequelize.define('NotificationSettings', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_user: { type: DataTypes.INTEGER, allowNull: false },
        postulation_created: { type: DataTypes.BOOLEAN, defaultValue: true },
        postulation_state_changed: { type: DataTypes.BOOLEAN, defaultValue: true },
        postulation_accepted: { type: DataTypes.BOOLEAN, defaultValue: true },
        postulation_rejected: { type: DataTypes.BOOLEAN, defaultValue: false },
        petition_created: { type: DataTypes.BOOLEAN, defaultValue: true },
        petition_closed: { type: DataTypes.BOOLEAN, defaultValue: true },
        email_notifications: { type: DataTypes.BOOLEAN, defaultValue: true },
        push_notifications: { type: DataTypes.BOOLEAN, defaultValue: false },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'n_notification_settings',
        timestamps: false,
        underscored: true
    });

    return NotificationSettings;
};