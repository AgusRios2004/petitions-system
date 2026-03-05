module.exports = (sequelize, DataTypes) => {
    const UserVerificationCode = sequelize.define('UserVerificationCode', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(6),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        is_used: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        tableName: 'n_user_verification_code',
        timestamps: false,
    });

    UserVerificationCode.associate = (models) => {
        UserVerificationCode.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
    };

    return UserVerificationCode;
};