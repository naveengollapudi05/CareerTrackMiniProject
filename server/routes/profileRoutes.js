const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addSkill,
  removeSkill,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.use(protect); // All profile routes protected

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/skills', addSkill);
router.delete('/skills/:skillName', removeSkill);

module.exports = router;
