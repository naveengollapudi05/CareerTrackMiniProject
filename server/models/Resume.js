const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      default: 'My Resume',
    },
    targetRole: {
      type: String,
      trim: true,
      default: '',
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    summary: {
      type: String,
      default: '',
    },
    education: [
      {
        degree: { type: String, default: '' },
        institution: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        grade: { type: String, default: '' },
        details: { type: String, default: '' },
      },
    ],
    skills: {
      languages: { type: [String], default: [] },
      frameworks: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      softSkills: { type: [String], default: [] },
    },
    experience: [
      {
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
      },
    ],
    projects: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        technologies: { type: [String], default: [] },
        link: { type: String, default: '' },
      },
    ],
    certifications: [
      {
        name: { type: String, default: '' },
        issuer: { type: String, default: '' },
        date: { type: String, default: '' },
        link: { type: String, default: '' },
      },
    ],
    achievements: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
