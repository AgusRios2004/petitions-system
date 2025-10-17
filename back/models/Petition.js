module.exports = (sequelize, DataTypes) => {
    const Petition = sequelize.define('Petition', {
        id_petition: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_type_petition: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_customer: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        id_profession: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_type_provider: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_state: {
            type: DataTypes.INTEGER,
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
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        tableName: 'n_petition',
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
        
        Petition.belongsTo(models.TypePetition, {
            foreignKey: 'id_type_petition',
            as: 'typePetitions',
        });
        
        Petition.hasMany(models.Postulation, {
            foreignKey: 'id_petition', 
            as: 'postulations',
        });
        
        Petition.belongsTo(models.State, {
            foreignKey: 'id_state',
            as: 'states',
        });

        Petition.belongsTo(models.Profession, {
            foreignKey: 'id_profession',
            as: 'profession',
        });

        Petition.belongsTo(models.TypeProvider, {
            foreignKey: 'id_type_provider',
            as: 'typeProvider',
        });
        
        Petition.belongsTo(models.User, {
            foreignKey: 'id_user_create',
            as: 'createdBy',
        });
        
        Petition.belongsTo(models.User, {
            foreignKey: 'id_user_update',
            as: 'updatedBy',
        });
    };
    
    return Petition;
};