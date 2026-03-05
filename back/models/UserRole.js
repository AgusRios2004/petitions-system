module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define('UserRole', {
        id_user: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        id_role: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
    }, {
        tableName: 'n_user_role',
        timestamps: false,
    });

    UserRole.associate = (models) => {
        UserRole.belongsTo(models.User, {
            foreignKey: 'id_user',
            as: 'users',
        });
        UserRole.belongsTo(models.Role, {
            foreignKey: 'id_role',
            as: 'roles',
        });
    };

    return UserRole;
};