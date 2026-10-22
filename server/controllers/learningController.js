const LearningProgress = require('../models/LearningProgress');
const User = require('../models/User');
const Application = require('../models/Application');
const { getLearningResource, normalizeSkill, getSuggestedRoleSkills } = require('../utils/skillExtractor');

/**
 * @route   GET /api/learning
 * @desc    Get all skill recommendations, learning statuses, and progress
 * @access  Private
 */
const getLearningProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [user, applications, progressRecords] = await Promise.all([
      User.findById(userId),
      Application.find({ user: userId }),
      LearningProgress.find({ user: userId }),
    ]);

    const totalApps = applications.length;
    const userSkills = user.profile.skills || [];
    const userSkillsSet = new Set(userSkills.map((s) => s.toLowerCase().trim()));

    // Track applications that contain recognized required skills
    let matchableAppsCount = 0;

    // Map skill frequency across applications
    const skillCounts = {};
    applications.forEach((app) => {
      const skillsInThisApp = new Set(
        (app.requiredSkills || []).map((s) => normalizeSkill(s)).filter(Boolean)
      );
      if (skillsInThisApp.size > 0) {
        matchableAppsCount++;
      }
      skillsInThisApp.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const hasAnalyzableJobs = matchableAppsCount > 0;

    // Map saved learning progress
    const progressMap = {};
    progressRecords.forEach((record) => {
      progressMap[record.skillName.toLowerCase()] = record;
    });

    // Build skill gap items only if there are analyzable jobs
    const missingSkills = [];
    if (hasAnalyzableJobs) {
      Object.keys(skillCounts).forEach((skillName) => {
        const isMissing = !userSkillsSet.has(skillName.toLowerCase());
        const count = skillCounts[skillName];
        const percentage = matchableAppsCount > 0 ? Math.round((count / matchableAppsCount) * 100) : 0;
        const progressRecord = progressMap[skillName.toLowerCase()];
        const resource = getLearningResource(skillName);

        if (isMissing) {
          missingSkills.push({
            skillName,
            demandCount: count,
            demandPercentage: percentage,
            priority: percentage >= 50 ? 'High' : percentage >= 25 ? 'Medium' : 'Low',
            status: progressRecord ? progressRecord.status : 'Not Started',
            resourceTitle: progressRecord?.resourceTitle || resource.title,
            resourceUrl: progressRecord?.resourceUrl || resource.url,
            resourceType: resource.type,
            resourceDescription: resource.description,
            notes: progressRecord ? progressRecord.notes : '',
            updatedAt: progressRecord ? progressRecord.updatedAt : null,
          });
        }
      });

      // Sort missing skills by demand count desc
      missingSkills.sort((a, b) => b.demandCount - a.demandCount);
    }

    // Role-based suggested skills when no analyzable jobs are saved yet
    let suggestedRoleSkills = [];
    if (!hasAnalyzableJobs && user.profile?.targetRole) {
      suggestedRoleSkills = getSuggestedRoleSkills(user.profile.targetRole, userSkillsSet).map(
        (item) => ({
          ...item,
          status: progressMap[item.skill.toLowerCase()]?.status || 'Not Started',
          notes: progressMap[item.skill.toLowerCase()]?.notes || '',
        })
      );
    }

    res.status(200).json({
      success: true,
      data: {
        profileSkills: userSkills,
        missingSkills,
        hasAnalyzableJobs,
        matchableAppsCount,
        suggestedRoleSkills,
        targetRole: user.profile?.targetRole || '',
        stats: {
          profileSkillsCount: userSkills.length,
          missingSkillsCount: missingSkills.length,
          hasAnalyzableJobs,
          matchableAppsCount,
          learningCount: progressRecords.filter((s) => s.status === 'Learning').length,
          completedCount: progressRecords.filter((s) => s.status === 'Completed').length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/learning/:skillName
 * @desc    Update learning status, notes, or mark as already known
 * @access  Private
 */
const updateSkillStatus = async (req, res, next) => {
  try {
    const { skillName } = req.params;
    const { status, notes, addToProfile } = req.body;
    const userId = req.user._id;

    const canonicalName = normalizeSkill(decodeURIComponent(skillName));

    // If user clicked "I already have this skill", add directly to user profile
    if (addToProfile) {
      const user = await User.findById(userId);
      const exists = user.profile.skills.some(
        (s) => s.toLowerCase() === canonicalName.toLowerCase()
      );
      if (!exists) {
        user.profile.skills.push(canonicalName);
        await user.save();
      }
    }

    const resource = getLearningResource(canonicalName);

    const record = await LearningProgress.findOneAndUpdate(
      { user: userId, skillName: canonicalName },
      {
        status: status || 'Learning',
        notes: notes || '',
        resourceTitle: resource.title,
        resourceUrl: resource.url,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Updated progress for ${canonicalName}`,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLearningProgress,
  updateSkillStatus,
};
