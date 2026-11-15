const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id_user: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profile_image: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
            allowNull: false
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true
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
        timestamps: true, // Habilitar timestamps
        createdAt: 'date_create', // Mapear createdAt a date_create
        updatedAt: 'date_update', // Mapear updatedAt a date_update
        // El hash nunca sale en una consulta común. Solo el login lo pide, con
        // User.scope('withPassword'), para comparar la contraseña (B-01).
        defaultScope: {
            attributes: { exclude: ['password'] },
        },
        scopes: {
            withPassword: {
                attributes: { include: ['password'] },
            },
        },
        hooks: {
            beforeCreate: async (user) => {
                user.password = await bcrypt.hash(user.password, 10);
            },
            beforeUpdate: async (user) => {
                if(user.changed('password')){
                    user.password = await bcrypt.hash(user.password, 10);
                }
            }
        }
    });

    User.prototype.comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    };
    
    User.associate = (models) => {
        User.hasMany(models.UserRole, {
            foreignKey: 'id_user',
            sourceKey: 'id_user',
            as: 'userRoles',
        });
        User.hasMany(models.UserVerificationCode, {
            foreignKey: 'user_id',
            sourceKey: 'id_user',
            as: 'userVerificationCodes',
        });

        User.hasOne(models.Customer, {
            foreignKey: 'user_id',
            sourceKey: 'id_user',
            as: 'customer',
        });

        User.hasOne(models.Provider, {
            foreignKey: 'user_id',
            sourceKey: 'id_user',
            as: 'provider',
        });
    }

    return User;
};