const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'Learning', 'Completed'],
      default: 'Not Started',
    },
    resourceTitle: {
      type: String,
      default: '',
    },
    resourceUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

learningProgressSchema.index({ user: 1, skillName: 1 }, { unique: true });

const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);
module.exports = LearningProgress;
