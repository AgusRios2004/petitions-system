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
const profileRoutes = require('./routes/profileRoutes');
const petitionRoutes = require('./routes/petitionRoutes');
const postulationRoutes = require('./routes/postulationRoutes');
const professionRoutes = require('./routes/professionRoutes');
const typeProviderRoutes = require('./routes/typeProviderRoutes');
const countryRoutes = require('./routes/countryRoutes');
const provinceRoutes = require('./routes/provinceRoutes');
const cityRoutes = require('./routes/cityRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const addressRoutes = require('./routes/addressRoutes');
const stateRoutes = require('./routes/stateRoutes');
const typePetitionRoutes = require('./routes/typePetitionRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const articleRoutes = require('./routes/articleRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const weekRoutes = require('./routes/weekRoutes');
const hourRoutes = require('./routes/hourRotues');
const interestRoutes = require('./routes/interestRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const errorHandler = require('./middlewares/errorHandler');
const imageUploadRoutes = require('./routes/imageUploadRoutes');
const path = require('path');
const gradeRoutes = require('./routes/gradeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const offerRoutes = require('./routes/offerRoutes');
const typeOfferRoutes = require('./routes/typeOfferRoutes');

const app = express();
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api', profileRoutes);
app.use('/api/petition', petitionRoutes);
app.use('/api/postulation', postulationRoutes);
app.use('/api/professions', professionRoutes);
app.use('/api/type-providers', typeProviderRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/type-petitions', typePetitionRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/article', articleRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/weeks', weekRoutes);
app.use('/api/hours', hourRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/upload', imageUploadRoutes);
app.use('/api/grade', gradeRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api', messageRoutes);
app.use('/api/offer', offerRoutes);
app.use('/api/type-offer', typeOfferRoutes);
app.use('/api/week', require('./routes/weekRoutes'));
app.use('/api/provider-category', require('./routes/providerCategoryRoutes'));

// Middleware para manejo de errores
app.use(errorHandler);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🟢 DB conectada');
  } catch (e) {
    console.error('🔴 Error DB:', e.message);
  }
})();

module.exports = app;
