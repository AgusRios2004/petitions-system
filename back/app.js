const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const providerRoutes =  require('./routes/providerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/category', categoryRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🟢 DB conectada');
  } catch (e) {
    console.error('🔴 Error DB:', e.message);
  }
})();

module.exports = app;
