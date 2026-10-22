const express = require('express');
const router = express.Router();
const {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getInterviews);
router.post('/', createInterview);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
