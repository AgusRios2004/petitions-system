const router = require('express').Router();
const ctrl = require('../controllers/attachmentController');
const { authRequired } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// --- Configuración de Multer ---
// Aquí definimos dónde y cómo se guardarán los archivos.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'back/uploads/'); // La carpeta que creaste
  },
  filename: function (req, file, cb) {
    // Para evitar nombres de archivo duplicados, agregamos un timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- Definición de Rutas ---

// Ruta para SUBIR un adjunto
// 1. 'authRequired': Primero, verificamos que el usuario esté autenticado.
// 2. 'upload.single('attachmentFile')': Luego, multer procesa UN solo archivo que venga en el campo 'attachmentFile'.
// 3. 'ctrl.createAttachment': Finalmente, nuestro controlador se ejecuta (ya con el archivo en req.file).
router.post('/', [authRequired, upload.single('attachmentFile')], ctrl.createAttachment);

// Ruta para OBTENER un adjunto por su ID
router.get('/:id', ctrl.getAttachmentById);

// Ruta para ELIMINAR un adjunto por su ID
router.delete('/:id', authRequired, ctrl.deleteAttachment);

module.exports = router;