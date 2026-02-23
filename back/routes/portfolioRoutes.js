const router = require('express').Router();
const ctrl = require('../controllers/portfolioController');
const { authRequired } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', [authRequired, upload.single('image')], ctrl.createPortfolio);
router.get('/:id_provider', authRequired, ctrl.getPortfoliosByProvider);
router.delete('/:id', authRequired, ctrl.deletePortfolio);

module.exports = router;
