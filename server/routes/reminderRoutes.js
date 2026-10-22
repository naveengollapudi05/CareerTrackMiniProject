const express = require('express');
const router = express.Router();
const {
  getReminders,
  createReminder,
  updateReminder,
  toggleReminder,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getReminders);
router.post('/', createReminder);
router.patch('/:id/toggle', toggleReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
