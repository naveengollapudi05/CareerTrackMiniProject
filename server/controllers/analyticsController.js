const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const LearningProgress = require('../models/LearningProgress');
const { getLearningResource, normalizeSkill, getSuggestedRoleSkills } = require('../utils/skillExtractor');

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard metrics, charts, top demanded skills, and skill gap summary
 * @access  Private
 */
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch user and applications in parallel
    const [user, applications, upcomingInterviews, activeReminders] = await Promise.all([
      User.findById(userId),
      Application.find({ user: userId }).sort({ applicationDate: -1 }),
      Interview.find({
        user: userId,
        scheduledDate: { $gte: new Date() },
        status: { $ne: 'Cancelled' },
      })
        .populate('application', 'company role location')
        .sort({ scheduledDate: 1 })
        .limit(5),
      Reminder.find({
        user: userId,
        completed: false,
      })
        .populate('application', 'company role')
        .sort({ dueDate: 1 })
        .limit(5),
    ]);

    const totalApplications = applications.length;

    // Status distribution
    const statusCounts = {
      Applied: 0,
      Assessment: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0,
    };

    applications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    const awaitingResponse = statusCounts.Applied + statusCounts.Assessment;
    const interviewCount = statusCounts.Interview;
    const offerCount = statusCounts.Offer;
    const rejectedCount = statusCounts.Rejected;

    // Response rate & Offer rate
    const responseRate = totalApplications > 0
      ? Math.round(((totalApplications - statusCounts.Applied) / totalApplications) * 100)
      : 0;

    const offerRate = totalApplications > 0
      ? Math.round((offerCount / totalApplications) * 100)
      : 0;

    // TOP DEMANDED SKILLS ANALYSIS (Count at most once per application)
    const skillAppMap = {}; // skillName -> array of { appId, company, role }

    applications.forEach((app) => {
      const skillsInThisApp = new Set(
        (app.requiredSkills || []).map((s) => normalizeSkill(s)).filter(Boolean)
      );

      skillsInThisApp.forEach((skill) => {
        if (!skillAppMap[skill]) {
          skillAppMap[skill] = [];
        }
        skillAppMap[skill].push({
          id: app._id,
          company: app.company,
          role: app.role,
          status: app.status,
        });
      });
    });

    const topDemandedSkills = Object.keys(skillAppMap)
      .map((skillName) => ({
        skill: skillName,
        count: skillAppMap[skillName].length,
        percentage: totalApplications > 0
          ? Math.round((skillAppMap[skillName].length / totalApplications) * 100)
          : 0,
        applications: skillAppMap[skillName],
      }))
      .sort((a, b) => b.count - a.count);

    // SKILL GAP ANALYSIS
    const userSkillsSet = new Set(
      (user.profile.skills || []).map((s) => s.toLowerCase().trim())
    );

    const userProfileSkills = user.profile.skills || [];

    // Analyze match for each application
    let totalMatchPercentages = 0;
    let matchableAppsCount = 0;

    const appMatches = applications.map((app) => {
      // Deduplicate recognized skills for this application
      const uniqueReqSkills = Array.from(
        new Set((app.requiredSkills || []).map((s) => normalizeSkill(s)).filter(Boolean))
      );

      if (uniqueReqSkills.length === 0) {
        return {
          appId: app._id,
          company: app.company,
          role: app.role,
          available: false,
          matchPercent: null,
          matched: [],
          missing: [],
        };
      }

      const matched = [];
      const missing = [];

      uniqueReqSkills.forEach((skill) => {
        if (userSkillsSet.has(skill.toLowerCase())) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      });

      // Compatibility = (matched required skills / total recognized required skills) * 100
      const matchPercent = Math.round((matched.length / uniqueReqSkills.length) * 100);
      totalMatchPercentages += matchPercent;
      matchableAppsCount++;

      return {
        appId: app._id,
        company: app.company,
        role: app.role,
        available: true,
        matchPercent,
        matched,
        missing,
      };
    });

    const hasAnalyzableJobs = matchableAppsCount > 0;
    // Do not display 0% average compatibility when there is no analyzable job data
    const averageMatchScore = hasAnalyzableJobs
      ? Math.round(totalMatchPercentages / matchableAppsCount)
      : null;

    // Identify missing skills across all jobs
    const missingSkillsMap = {};

    topDemandedSkills.forEach((item) => {
      if (!userSkillsSet.has(item.skill.toLowerCase())) {
        missingSkillsMap[item.skill] = {
          skill: item.skill,
          demandCount: item.count,
          demandPercentage: item.percentage,
          resource: getLearningResource(item.skill),
        };
      }
    });

    // Learning progress records
    const progressRecords = await LearningProgress.find({ user: userId });
    const progressMap = {};
    progressRecords.forEach((rec) => {
      progressMap[rec.skillName.toLowerCase()] = rec.status;
    });

    const recommendedSkills = Object.values(missingSkillsMap)
      .map((item) => ({
        ...item,
        learningStatus: progressMap[item.skill.toLowerCase()] || 'Not Started',
        priority: item.demandPercentage >= 50
          ? 'High'
          : item.demandPercentage >= 25
          ? 'Medium'
          : 'Low',
      }))
      .sort((a, b) => b.demandCount - a.demandCount);

    // Suggested Skills for Career Goal (Requirement 8) when no analyzable jobs are saved yet
    let suggestedRoleSkills = [];
    if (!hasAnalyzableJobs && user.profile?.targetRole) {
      suggestedRoleSkills = getSuggestedRoleSkills(user.profile.targetRole, userSkillsSet).map(
        (item) => ({
          ...item,
          learningStatus: progressMap[item.skill.toLowerCase()] || 'Not Started',
        })
      );
    }

    // Recent activities (recent applications + status history)
    const recentActivity = [];
    applications.slice(0, 8).forEach((app) => {
      recentActivity.push({
        id: app._id,
        type: 'application',
        title: `${app.role} at ${app.company}`,
        status: app.status,
        date: app.applicationDate || app.createdAt,
      });
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalApplications,
          applied: statusCounts.Applied,
          assessment: statusCounts.Assessment,
          awaitingResponse,
          interviews: interviewCount,
          offers: offerCount,
          rejected: rejectedCount,
          withdrawn: statusCounts.Withdrawn,
          responseRate,
          offerRate,
          averageMatchScore,
          hasAnalyzableJobs,
          matchableAppsCount,
        },
        statusDistribution: Object.keys(statusCounts).map((status) => ({
          status,
          count: statusCounts[status],
        })),
        topDemandedSkills,
        skillGap: {
          profileSkillsCount: userProfileSkills.length,
          profileSkills: userProfileSkills,
          averageMatchScore,
          hasAnalyzableJobs,
          matchableAppsCount,
          recommendedSkills: hasAnalyzableJobs ? recommendedSkills : [],
          suggestedRoleSkills,
          targetRole: user.profile?.targetRole || '',
        },
        recentApplications: applications.slice(0, 5),
        upcomingInterviews,
        activeReminders,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
};
