const sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
//Importar models
const Provider = require('./Provider')(sequelize, DataTypes);
const Customer = require('./Customer')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);

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