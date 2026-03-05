const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('--- DB Config Debug ---');
console.log('MYSQL_URL exists:', !!process.env.MYSQL_URL);
console.log('Host:', process.env.DB_HOST || process.env.MYSQLHOST);
console.log('Port:', process.env.DB_PORT || process.env.MYSQLPORT);
console.log('Database:', process.env.DB_NAME || process.env.MYSQLDATABASE);
console.log('User:', process.env.DB_USER || process.env.MYSQLUSER);
console.log('-----------------------');

const sequelize = process.env.MYSQL_URL
  ? new Sequelize(process.env.MYSQL_URL, {
    logging: false,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000
    }
  })
  : new Sequelize(
    process.env.DB_NAME || process.env.MYSQLDATABASE,
    process.env.DB_USER || process.env.MYSQLUSER,
    process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      dialect: 'mysql',
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
      logging: false,
      dialectOptions: {
        connectTimeout: 60000
      }
    }
  );

module.exports = sequelize;