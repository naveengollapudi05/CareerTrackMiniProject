const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const Application = require('../models/Application');

/**
 * @route   GET /api/interviews
 * @desc    Get all interviews for current user
 * @access  Private
 */
const getInterviews = async (req, res, next) => {
  try {
    const { status, filter } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    const now = new Date();
    if (filter === 'upcoming') {
      query.scheduledDate = { $gte: now };
      query.status = { $ne: 'Cancelled' };
    } else if (filter === 'past') {
      query.scheduledDate = { $lt: now };
    }

    const interviews = await Interview.find(query)
      .populate('application', 'company role location status url')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/interviews/:id
 * @desc    Get single interview by ID
 * @access  Private
 */
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('application', 'company role location status url');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/interviews
 * @desc    Schedule a new interview
 * @access  Private
 */
const createInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      round,
      interviewType,
      scheduledDate,
      meetingUrl,
      notes,
    } = req.body;

    if (!applicationId || !round || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide application, interview round, and scheduled date/time.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID provided.',
      });
    }

    // Verify application belongs to authenticated user
    const application = await Application.findOne({
      _id: applicationId,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Selected application not found or unauthorized.',
      });
    }

    const interview = await Interview.create({
      user: req.user._id,
      application: application._id,
      round: round.trim(),
      interviewType: interviewType || 'Online Video',
      scheduledDate: new Date(scheduledDate),
      meetingUrl: meetingUrl ? meetingUrl.trim() : '',
      notes: notes || '',
      status: 'Scheduled',
    });

    // Optionally update application status to 'Interview' if currently 'Applied' or 'Assessment'
    if (application.status === 'Applied' || application.status === 'Assessment') {
      application.status = 'Interview';
      application.statusHistory.push({
        status: 'Interview',
        date: new Date(),
        notes: `Interview scheduled: ${round}`,
      });
      await application.save();
    }

    const populated = await Interview.findById(interview._id).populate(
      'application',
      'company role location status url'
    );

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/interviews/:id
 * @desc    Update interview details
 * @access  Private
 */
const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized.',
      });
    }

    const { applicationId, round, interviewType, scheduledDate, meetingUrl, notes, status } = req.body;

    if (applicationId !== undefined && mongoose.Types.ObjectId.isValid(applicationId)) {
      const application = await Application.findOne({
        _id: applicationId,
        user: req.user._id,
      });
      if (application) {
        interview.application = application._id;
      }
    }

    if (round !== undefined) interview.round = round.trim();
    if (interviewType !== undefined) interview.interviewType = interviewType;
    if (scheduledDate !== undefined) interview.scheduledDate = new Date(scheduledDate);
    if (meetingUrl !== undefined) interview.meetingUrl = meetingUrl.trim();
    if (notes !== undefined) interview.notes = notes;
    if (status !== undefined) interview.status = status;

    await interview.save();

    const populated = await Interview.findById(interview._id).populate(
      'application',
      'company role location status url'
    );

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/interviews/:id
 * @desc    Delete an interview
 * @access  Private
 */
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized.',
      });
    }

    await Interview.deleteOne({ _id: interview._id });

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
};
