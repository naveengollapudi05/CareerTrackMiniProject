const express = require('express');
const router = express.Router();
const {
  getLearningProgress,
  updateSkillStatus,
} = require('../controllers/learningController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getLearningProgress);
router.put('/:skillName', updateSkillStatus);

module.exports = router;
