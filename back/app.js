const express = require('express');
const app = express();
require('dotenv').config();
const sequelize = require('./config/database');

app.use(express.json());

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🟢 Conexión establecida con la base de datos');
  } catch (error) {
    console.error('🔴 Error al conectar con la base de datos:', error);
  }
})();

module.exports = app;
