const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Associated application is required'],
    },
    round: {
      type: String,
      required: [true, 'Interview round title is required'],
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ['Online Video', 'Phone', 'On-site', 'Take-Home Assessment', 'Other'],
      default: 'Online Video',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Interview date and time is required'],
    },
    meetingUrl: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;
