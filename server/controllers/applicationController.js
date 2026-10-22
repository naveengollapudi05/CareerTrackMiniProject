const mongoose = require('mongoose');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');
const { extractSkillsFromText, normalizeSkill } = require('../utils/skillExtractor');

/**
 * @route   GET /api/applications
 * @desc    Get all applications for the authenticated user with search, filter, sort
 * @access  Private
 */
const getApplications = async (req, res, next) => {
  try {
    const { status, type, search, sort = 'newest' } = req.query;

    const query = { user: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { company: searchRegex },
        { role: searchRegex },
        { location: searchRegex },
      ];
    }

    let sortOption = { applicationDate: -1, createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { applicationDate: 1, createdAt: 1 };
    } else if (sort === 'company') {
      sortOption = { company: 1 };
    }

    const applications = await Application.find(query)
      .populate('resumeUsed', 'title targetRole')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application by ID
 * @access  Private
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('resumeUsed', 'title targetRole');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you are not authorized to view it.',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/applications
 * @desc    Create new application
 * @access  Private
 */
const createApplication = async (req, res, next) => {
  try {
    const {
      company,
      role,
      type,
      location,
      mode,
      url,
      description,
      applicationDate,
      status = 'Applied',
      notes,
      requiredSkills,
      resumeUsed,
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: 'Company name and job role are required.',
      });
    }

    // Process required skills: either passed explicitly or auto-extracted from description
    let finalSkills = [];
    if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      finalSkills = requiredSkills
        .map((s) => normalizeSkill(s))
        .filter(Boolean);
    } else if (typeof requiredSkills === 'string' && requiredSkills.trim()) {
      finalSkills = requiredSkills
        .split(/[,;\n]/)
        .map((s) => normalizeSkill(s))
        .filter(Boolean);
    } else if (description && description.trim()) {
      finalSkills = extractSkillsFromText(description);
    }

    // Deduplicate skills
    finalSkills = Array.from(new Set(finalSkills));

    const initialHistory = [
      {
        status: status || 'Applied',
        date: applicationDate ? new Date(applicationDate) : new Date(),
        notes: 'Application logged',
      },
    ];

    const application = await Application.create({
      user: req.user._id,
      company: company.trim(),
      role: role.trim(),
      type: type || 'Internship',
      location: location ? location.trim() : '',
      mode: mode || 'Remote',
      url: url ? url.trim() : '',
      description: description || '',
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      status: status || 'Applied',
      notes: notes || '',
      requiredSkills: finalSkills,
      resumeUsed: (resumeUsed && mongoose.Types.ObjectId.isValid(resumeUsed)) ? resumeUsed : null,
      statusHistory: initialHistory,
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully!',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/applications/:id
 * @desc    Update application
 * @access  Private
 */
const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized.',
      });
    }

    const {
      company,
      role,
      type,
      location,
      mode,
      url,
      description,
      applicationDate,
      status,
      notes,
      requiredSkills,
      resumeUsed,
      statusNote,
    } = req.body;

    if (company !== undefined) application.company = company.trim();
    if (role !== undefined) application.role = role.trim();
    if (type !== undefined) application.type = type;
    if (location !== undefined) application.location = location.trim();
    if (mode !== undefined) application.mode = mode;
    if (url !== undefined) application.url = url.trim();
    if (description !== undefined) application.description = description;
    if (notes !== undefined) application.notes = notes;
    if (resumeUsed !== undefined) {
      application.resumeUsed = (resumeUsed && mongoose.Types.ObjectId.isValid(resumeUsed)) ? resumeUsed : null;
    }
    if (applicationDate !== undefined) application.applicationDate = new Date(applicationDate);

    // Track status change in history
    if (status && status !== application.status) {
      application.statusHistory.push({
        status,
        date: new Date(),
        notes: statusNote || `Status changed from ${application.status} to ${status}`,
      });
      application.status = status;
    }

    // Process skills if passed
    if (requiredSkills !== undefined) {
      let finalSkills = [];
      if (Array.isArray(requiredSkills)) {
        finalSkills = requiredSkills.map((s) => normalizeSkill(s)).filter(Boolean);
      } else if (typeof requiredSkills === 'string') {
        finalSkills = requiredSkills
          .split(/[,;\n]/)
          .map((s) => normalizeSkill(s))
          .filter(Boolean);
      }
      application.requiredSkills = Array.from(new Set(finalSkills));
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully!',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete application and cascade delete associated interviews/reminders
 * @access  Private
 */
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized.',
      });
    }

    // Cascade clean interviews and reminders
    await Interview.deleteMany({ application: application._id, user: req.user._id });
    await Reminder.deleteMany({ application: application._id, user: req.user._id });
    await Application.deleteOne({ _id: application._id });

    res.status(200).json({
      success: true,
      message: `Application for ${application.company} and associated records deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/applications/extract-skills
 * @desc    Utility to extract skills from job description text
 * @access  Private
 */
const extractSkills = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide job description text to analyze.',
      });
    }

    const skills = extractSkillsFromText(text);

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/export/csv
 * @desc    Export applications as CSV file
 * @access  Private
 */
const exportCSV = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user._id }).sort({
      applicationDate: -1,
    });

    // Generate CSV string
    const headers = [
      'Company',
      'Role',
      'Type',
      'Status',
      'Application Date',
      'Location',
      'Mode',
      'Required Skills',
      'Application URL',
      'Notes',
    ];

    const rows = applications.map((app) => [
      `"${(app.company || '').replace(/"/g, '""')}"`,
      `"${(app.role || '').replace(/"/g, '""')}"`,
      `"${app.type || ''}"`,
      `"${app.status || ''}"`,
      `"${app.applicationDate ? new Date(app.applicationDate).toISOString().slice(0, 10) : ''}"`,
      `"${(app.location || '').replace(/"/g, '""')}"`,
      `"${app.mode || ''}"`,
      `"${(app.requiredSkills || []).join(', ').replace(/"/g, '""')}"`,
      `"${(app.url || '').replace(/"/g, '""')}"`,
      `"${(app.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="careertrack_applications_${Date.now()}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  extractSkills,
  exportCSV,
};
