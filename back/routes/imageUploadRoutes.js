const router = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Configuración de Multer para Imágenes de Perfil ---
const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-images');

// Asegurarse de que el directorio de subida existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image file.'), false);
    }
  }
});

// --- Ruta para SUBIR una imagen de perfil ---
// Devuelve la URL pública del archivo subido.
router.post('/profile-image', [authRequired, upload.single('profileImage')], (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Construir la URL pública. Asegúrate de que el backend sirva la carpeta 'uploads'.
  // Ejemplo: http://localhost:3001/uploads/profile-images/profile-1678886400000-123456789.jpg
  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/profile-images/${req.file.filename}`;
  
  res.status(201).json({ imageUrl: publicUrl });
});

module.exports = router;
