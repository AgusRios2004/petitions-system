module.exports = (sequelize, DataTypes) => {
    const State = sequelize.define('State', {
        id_state: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        state: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        id_user_create: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_user_update: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        date_create: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        date_update: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'state',
        timestamps: false
    });

    State.associate = (models) => {
        State.hasMany(models.Petition, {
            foreignKey: 'id_state',
            as: 'petitions',
        });
    };

return State;

}