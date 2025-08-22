const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🟢 DB conectada');
  } catch (e) {
    console.error('🔴 Error DB:', e.message);
  }
})();

module.exports = app;
