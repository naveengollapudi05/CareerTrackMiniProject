const User = require('../models/User');
const { normalizeSkill } = require('../utils/skillExtractor');

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update user profile details
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      username,
      fullName,
      targetRole,
      bio,
      college,
      degree,
      gradYear,
      cgpa,
      avatarColor,
      skills,
      notificationPreferences,
    } = req.body;

    const user = await User.findById(req.user._id);

    // If username is being changed, ensure it's not taken by another user
    if (username && username.toLowerCase().trim() !== user.username) {
      const existingUser = await User.findOne({
        username: username.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken by another user.',
        });
      }
      user.username = username.toLowerCase().trim();
    }

    if (fullName !== undefined) user.profile.fullName = fullName;
    if (targetRole !== undefined) user.profile.targetRole = targetRole;
    if (bio !== undefined) user.profile.bio = bio;
    if (college !== undefined) user.profile.college = college;
    if (degree !== undefined) user.profile.degree = degree;
    if (gradYear !== undefined) user.profile.gradYear = gradYear;
    if (cgpa !== undefined) user.profile.cgpa = cgpa;
    if (avatarColor !== undefined) user.profile.avatarColor = avatarColor;
    if (skills !== undefined && Array.isArray(skills)) {
      user.profile.skills = Array.from(new Set(skills.map((s) => normalizeSkill(s)).filter(Boolean)));
    }
    if (notificationPreferences !== undefined) {
      user.profile.notificationPreferences = {
        ...user.profile.notificationPreferences,
        ...notificationPreferences,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/profile/skills
 * @desc    Add a skill to user profile
 * @access  Private
 */
const addSkill = async (req, res, next) => {
  try {
    const { skill } = req.body;
    if (!skill || typeof skill !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid skill name.',
      });
    }

    const normalized = normalizeSkill(skill);
    if (!normalized) {
      return res.status(400).json({
        success: false,
        message: 'Skill name cannot be empty.',
      });
    }

    const user = await User.findById(req.user._id);

    // Check duplicate case-insensitively
    const exists = user.profile.skills.some(
      (s) => s.toLowerCase() === normalized.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Skill "${normalized}" is already in your profile.`,
      });
    }

    user.profile.skills.push(normalized);
    await user.save();

    res.status(200).json({
      success: true,
      message: `Skill "${normalized}" added to profile.`,
      skills: user.profile.skills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/profile/skills/:skillName
 * @desc    Remove a skill from user profile
 * @access  Private
 */
const removeSkill = async (req, res, next) => {
  try {
    const { skillName } = req.params;
    const user = await User.findById(req.user._id);

    user.profile.skills = user.profile.skills.filter(
      (s) => s.toLowerCase() !== decodeURIComponent(skillName).toLowerCase()
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: `Skill removed from profile.`,
      skills: user.profile.skills,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addSkill,
  removeSkill,
};
