const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('--- DB Config Debug ---');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('-----------------------');

const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.MYSQLDATABASE,
  process.env.DB_USER || process.env.MYSQLUSER,
  process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    logging: false,
    dialectOptions: {
      // Railway MySQL a veces requiere esto para conexiones seguras
      // connectTimeout: 60000
    }
  }
);

module.exports = sequelize;