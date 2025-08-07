const sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
//Importar models
const Provider = require('./Provider')(sequelize, DataTypes);
const Customer = require('./Customer')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
//Relaciones
Customer.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Customer, { foreignKey: 'user_id' });
Provider.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Provider, { foreignKey: 'user_id' });

sequelize.sync({force: false})
    .then(() =>{
        console.log('Database & tables created!');
    })
    .catch((error) => {
        console.error('Error creating database and tables:', error);
    });

module.exports = {
    sequelize,
}