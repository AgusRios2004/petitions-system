module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        id_role: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
    }, {
        tableName: 'n_role',
        timestamps: false,
    });

    Role.associate = (models) => {
        Role.hasMany(models.UserRole, {
            foreignKey: 'id_role',
            sourceKey: 'id_role',
            as: 'userRoles', 
        });
    };

    return Role;
};