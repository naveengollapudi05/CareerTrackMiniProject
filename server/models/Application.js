const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Job or internship role is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Internship', 'Full-Time', 'Part-Time', 'Contract'],
      default: 'Internship',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    mode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
      default: 'Applied',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    resumeUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: function () {
        return [{ status: this.status || 'Applied', date: this.applicationDate || new Date(), notes: 'Application logged' }];
      },
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
