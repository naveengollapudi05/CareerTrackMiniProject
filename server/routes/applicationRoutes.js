const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  extractSkills,
  exportCSV,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.use(protect); // All application routes protected

router.get('/export/csv', exportCSV);
router.post('/extract-skills', extractSkills);
router.get('/', getApplications);
router.post('/', createApplication);
router.get('/:id', getApplicationById);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

module.exports = router;
