module.exports = (sequelize, DataTypes) => {
    const Grade = sequelize.define('Grade', {
        id_grade: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        grade_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_color: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_user_create: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_user_update: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        date_create: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'grade',
        timestamps: false,
    });

    Grade.associate = (models) => {
        Grade.belongsTo(models.Color, {
            foreignKey: 'id_color',
            as: 'colors',
        });
        Grade.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'userCreate',
        });
        Grade.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'userUpdate',
        });
        Grade.hasMany(models.GradeCustomer, {
            foreignKey: 'id_grade',
            sourceKey: 'id_grade',
            as: 'gradeCustomers',
        });
        Grade.hasMany(models.GradeProvider, {
            foreignKey: 'id_grade',
            sourceKey: 'id_grade',
            as: 'gradeProviders',
        });
    };

    return Grade;
};