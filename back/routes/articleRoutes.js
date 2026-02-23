const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Ruta para obtener todos los artículos
router.get('/', articleController.getAllArticles);

// Ruta para obtener un artículo por ID
router.get('/:id', articleController.getArticleById);

module.exports = router;
