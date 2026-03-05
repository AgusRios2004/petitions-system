module.exports = (sequelize, DataTypes) => {
    const Form = sequelize.define('Form', {
        id_forms: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        id_user_update: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_user_create: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        date_create: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'forms',
        timestamps: false,
    });

    Form.associate = (models) => {
        Form.belongsTo(models.User, { foreignKey: 'id_user_create', as: 'creator' });
        Form.belongsTo(models.User, { foreignKey: 'id_user_update', as: 'updater' });
    };

    return Form;
};