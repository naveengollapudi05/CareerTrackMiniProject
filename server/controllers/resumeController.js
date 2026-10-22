const Resume = require('../models/Resume');
const Application = require('../models/Application');

/**
 * @route   GET /api/resumes
 * @desc    Get all saved resumes for the current user
 * @access  Private
 */
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });

    // Fetch application usage counts for each resume
    const resumesWithUsage = await Promise.all(
      resumes.map(async (resume) => {
        const usageCount = await Application.countDocuments({
          user: req.user._id,
          resumeUsed: resume._id,
        });
        const resumeObj = resume.toObject();
        resumeObj.applicationCount = usageCount;
        return resumeObj;
      })
    );

    res.status(200).json({
      success: true,
      count: resumesWithUsage.length,
      data: resumesWithUsage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/resumes/:id
 * @desc    Get single resume by ID
 * @access  Private
 */
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized.',
      });
    }

    const usageCount = await Application.countDocuments({
      user: req.user._id,
      resumeUsed: resume._id,
    });

    const resumeObj = resume.toObject();
    resumeObj.applicationCount = usageCount;

    res.status(200).json({
      success: true,
      data: resumeObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/resumes
 * @desc    Save a new resume
 * @access  Private
 */
const createResume = async (req, res, next) => {
  try {
    const {
      title,
      targetRole,
      personalInfo,
      summary,
      education,
      skills,
      experience,
      projects,
      certifications,
      achievements,
    } = req.body;

    const resume = await Resume.create({
      user: req.user._id,
      title: title ? title.trim() : 'Software Engineering Resume',
      targetRole: targetRole || '',
      personalInfo: personalInfo || {},
      summary: summary || '',
      education: education || [],
      skills: skills || { languages: [], frameworks: [], tools: [], softSkills: [] },
      experience: experience || [],
      projects: projects || [],
      certifications: certifications || [],
      achievements: achievements || [],
    });

    res.status(201).json({
      success: true,
      message: 'Resume saved successfully!',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/resumes/:id
 * @desc    Update an existing resume
 * @access  Private
 */
const updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized.',
      });
    }

    const {
      title,
      targetRole,
      personalInfo,
      summary,
      education,
      skills,
      experience,
      projects,
      certifications,
      achievements,
    } = req.body;

    if (title !== undefined) resume.title = title.trim();
    if (targetRole !== undefined) resume.targetRole = targetRole;
    if (personalInfo !== undefined) resume.personalInfo = personalInfo;
    if (summary !== undefined) resume.summary = summary;
    if (education !== undefined) resume.education = education;
    if (skills !== undefined) resume.skills = skills;
    if (experience !== undefined) resume.experience = experience;
    if (projects !== undefined) resume.projects = projects;
    if (certifications !== undefined) resume.certifications = certifications;
    if (achievements !== undefined) resume.achievements = achievements;

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully!',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume
 * @access  Private
 */
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized.',
      });
    }

    // Unlink from applications using this resume
    await Application.updateMany(
      { user: req.user._id, resumeUsed: resume._id },
      { $set: { resumeUsed: null } }
    );

    await Resume.deleteOne({ _id: resume._id });

    res.status(200).json({
      success: true,
      message: `Resume "${resume.title}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to extract raw text from uploaded PDF or Word document buffer
 */
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const { parseResumeText } = require('../utils/resumeParser');

async function extractTextFromFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const isPdf = ext === '.pdf' || file.mimetype === 'application/pdf';

  let rawText = '';
  if (isPdf) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const parsed = await parser.getText();
      rawText = parsed && parsed.text ? parsed.text : '';
    } catch (pdfErr) {
      throw new Error(
        'Failed to read PDF document. The file may be password-protected, corrupted, or unsupported.'
      );
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    }
  } else {
    // DOCX via mammoth
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      rawText = result && result.value ? result.value : '';
    } catch (docxErr) {
      throw new Error(
        'Failed to read Word document. The file may be password-protected, corrupted, or not a valid .docx file.'
      );
    }
  }

  return rawText;
}

/**
 * @route   POST /api/resumes/parse
 * @desc    Parse an uploaded resume file and return structured fields for editor preview/population
 * @access  Private
 */
const parseResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a PDF or DOCX resume file to upload.',
      });
    }

    const rawText = await extractTextFromFile(req.file);
    const parsedData = parseResumeText(rawText);

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully!',
      data: parsedData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to parse uploaded resume.',
    });
  }
};

/**
 * @route   POST /api/resumes/import
 * @desc    Parse and directly save an imported resume (new or replacing an existing one)
 * @access  Private
 */
const importResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a PDF or DOCX resume file to upload.',
      });
    }

    const rawText = await extractTextFromFile(req.file);
    const parsedData = parseResumeText(rawText);

    const { replaceId, title, targetRole } = req.body;

    const resumeTitle = (title && title.trim()) || parsedData.title || 'Imported Resume';
    const resumeTargetRole = (targetRole && targetRole.trim()) || parsedData.targetRole || '';

    let resume;
    if (replaceId) {
      resume = await Resume.findOne({
        _id: replaceId,
        user: req.user._id,
      });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Target resume to replace was not found or unauthorized.',
        });
      }

      resume.title = resumeTitle;
      resume.targetRole = resumeTargetRole;
      resume.personalInfo = parsedData.personalInfo;
      resume.summary = parsedData.summary;
      resume.education = parsedData.education;
      resume.skills = parsedData.skills;
      resume.experience = parsedData.experience;
      resume.projects = parsedData.projects;
      resume.certifications = parsedData.certifications;
      resume.achievements = parsedData.achievements;

      await resume.save();

      return res.status(200).json({
        success: true,
        message: `Resume "${resume.title}" replaced successfully!`,
        data: resume,
      });
    }

    // Create new resume
    resume = await Resume.create({
      user: req.user._id,
      title: resumeTitle,
      targetRole: resumeTargetRole,
      personalInfo: parsedData.personalInfo,
      summary: parsedData.summary,
      education: parsedData.education,
      skills: parsedData.skills,
      experience: parsedData.experience,
      projects: parsedData.projects,
      certifications: parsedData.certifications,
      achievements: parsedData.achievements,
    });

    return res.status(201).json({
      success: true,
      message: `Resume "${resume.title}" imported and saved successfully!`,
      data: resume,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to import resume.',
    });
  }
};

module.exports = {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  parseResumeFile,
  importResumeFile,
};
