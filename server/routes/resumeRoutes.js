const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  parseResumeFile,
  importResumeFile,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

// Multer memory upload configuration (5 MB limit, PDF and DOCX only)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    const isPdf = ext === '.pdf' || mime === 'application/pdf';
    const isDocx =
      ext === '.docx' ||
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword';

    if (isPdf || isDocx) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).'));
    }
  },
});

// Multer error handling wrapper middleware
const handleResumeUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowed limit of 5 MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

router.use(protect);

router.get('/', getResumes);
router.post('/', createResume);
router.post('/parse', handleResumeUpload, parseResumeFile);
router.post('/import', handleResumeUpload, importResumeFile);
router.get('/:id', getResumeById);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

module.exports = router;
