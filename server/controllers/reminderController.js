const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');

/**
 * @route   GET /api/reminders
 * @desc    Get reminders for current user with date categorization
 * @access  Private
 */
const getReminders = async (req, res, next) => {
  try {
    const { category, type } = req.query;
    const query = { user: req.user._id };

    if (type && type !== 'All') {
      query.type = type;
    }

    const reminders = await Reminder.find(query)
      .populate('application', 'company role status')
      .populate('interview', 'round scheduledDate')
      .sort({ dueDate: 1 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Grouping
    const categorized = {
      all: reminders,
      overdue: [],
      dueToday: [],
      upcoming: [],
      completed: [],
    };

    reminders.forEach((rem) => {
      if (rem.completed) {
        categorized.completed.push(rem);
      } else {
        const due = new Date(rem.dueDate);
        if (due < todayStart) {
          categorized.overdue.push(rem);
        } else if (due >= todayStart && due <= todayEnd) {
          categorized.dueToday.push(rem);
        } else {
          categorized.upcoming.push(rem);
        }
      }
    });

    let result = reminders;
    if (category === 'overdue') result = categorized.overdue;
    else if (category === 'dueToday') result = categorized.dueToday;
    else if (category === 'upcoming') result = categorized.upcoming;
    else if (category === 'completed') result = categorized.completed;

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      stats: {
        total: reminders.length,
        overdue: categorized.overdue.length,
        dueToday: categorized.dueToday.length,
        upcoming: categorized.upcoming.length,
        completed: categorized.completed.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/reminders
 * @desc    Create a new reminder
 * @access  Private
 */
const createReminder = async (req, res, next) => {
  try {
    const { title, description, dueDate, type, applicationId, interviewId } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reminder title and due date/time.',
      });
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      title: title.trim(),
      description: description || '',
      dueDate: new Date(dueDate),
      type: type || 'Task',
      application: (applicationId && mongoose.Types.ObjectId.isValid(applicationId)) ? applicationId : null,
      interview: (interviewId && mongoose.Types.ObjectId.isValid(interviewId)) ? interviewId : null,
    });

    const populated = await Reminder.findById(reminder._id)
      .populate('application', 'company role status')
      .populate('interview', 'round scheduledDate');

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/reminders/:id
 * @desc    Update a reminder
 * @access  Private
 */
const updateReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or unauthorized.',
      });
    }

    const { title, description, dueDate, type, completed, applicationId, interviewId } = req.body;

    if (title !== undefined) reminder.title = title.trim();
    if (description !== undefined) reminder.description = description;
    if (dueDate !== undefined) reminder.dueDate = new Date(dueDate);
    if (type !== undefined) reminder.type = type;
    if (applicationId !== undefined) {
      reminder.application = (applicationId && mongoose.Types.ObjectId.isValid(applicationId)) ? applicationId : null;
    }
    if (interviewId !== undefined) {
      reminder.interview = (interviewId && mongoose.Types.ObjectId.isValid(interviewId)) ? interviewId : null;
    }

    if (completed !== undefined) {
      reminder.completed = completed;
      reminder.completedAt = completed ? new Date() : null;
    }

    await reminder.save();

    const populated = await Reminder.findById(reminder._id)
      .populate('application', 'company role status')
      .populate('interview', 'round scheduledDate');

    res.status(200).json({
      success: true,
      message: 'Reminder updated successfully!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/reminders/:id/toggle
 * @desc    Toggle reminder completed status
 * @access  Private
 */
const toggleReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or unauthorized.',
      });
    }

    reminder.completed = !reminder.completed;
    reminder.completedAt = reminder.completed ? new Date() : null;
    await reminder.save();

    res.status(200).json({
      success: true,
      message: reminder.completed ? 'Reminder marked as completed.' : 'Reminder re-opened.',
      data: reminder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/reminders/:id
 * @desc    Delete a reminder
 * @access  Private
 */
const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or unauthorized.',
      });
    }

    await Reminder.deleteOne({ _id: reminder._id });

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  toggleReminder,
  deleteReminder,
};
