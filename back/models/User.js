module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id_user: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name:{
            type: DataTypes.STRING(50),
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        date_create: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        date_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        is_superuser: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        date_joined: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        is_staff: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'n_user',
        timestamps: false, // ✅ bien escrito ahora
        createdAt: 'date_create',
        updatedAt: 'date_update',
    });

    return User;
};