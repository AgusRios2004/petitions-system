module.exports = (sequelize, DataTypes) => {
    const Petition = sequelize.define('Petition', {
        id_petition: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_customer:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_type_petition: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, 
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        date_since: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_until: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        id_state:{
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
            defaultValue: DataTypes.NOW,
        },
        date_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },      
    }, {
        tableName: 'petition',
        timestamps: false,
    });
    Petition.associate = (models) => {
        Petition.hasMany(models.Attachment, {
            foreignKey: 'id_petition',
            as: 'attachments',
        });
        Petition.belongsTo(models.Customer, {
            foreignKey: 'id_customer',
            as: 'customers',
        });
        Petition.belongsTo(models.id_type_petition, {
            foreignKey: 'id_type_petition',
            as: 'typesPetitions',
        });
        Petition.hasMany(models.Postulation, {
            foreignKey: 'id_postulation',
            as: 'postulations',
        });
        Petition.belongsTo(models.User, {
            foreignKey: 'id_user_creaate',
            as: 'createdBy',
        });
        Petition.belongsTo(models.User, {
            foreingKey: 'id_user_update',
            as: 'updatedBy',
        });
    }
    return Petition;
}