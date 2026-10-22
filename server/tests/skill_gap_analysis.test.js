/**
 * CareerTrack Skill Gap Analysis & Learning Roadmap Automated Test Suite
 * 
 * Verifies:
 * 1. Empty state when user has profile skills but no job descriptions (null compatibility, no fake gaps, role-based suggestions).
 * 2. Proper extraction, normalization, and deduplication of required skills per application.
 * 3. Accurate compatibility calculations: (matched / required) * 100 per app, and average across analyzable apps.
 * 4. Learning roadmap status updates ('Not Started' -> 'Learning' -> 'Completed') with genuine learning resources.
 * 5. Dynamic gap recalculation when skills are added to the user profile.
 * 6. Clean return to empty state when applications are deleted.
 */

const { app } = require('../server');
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Application = require('../models/Application');
const LearningProgress = require('../models/LearningProgress');
const { normalizeSkill, getSuggestedRoleSkills, getLearningResource } = require('../utils/skillExtractor');

async function runSkillGapAnalysisTests() {
  console.log('🧪 Starting Skill Gap Analysis & Learning Roadmap Test Suite...\n');
  let server;
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failedCount++;
    }
  }

  try {
    await connectDB();
    const TEST_PORT = 5098;
    server = app.listen(TEST_PORT);
    const BASE_URL = `http://localhost:${TEST_PORT}/api`;

    // Clean up any existing test records
    const testEmail = `skilltest_${Date.now()}@college.edu`;
    await User.deleteMany({ email: testEmail });
    await Application.deleteMany({ notes: 'SKILL_GAP_TEST_APP' });

    console.log('--- 1. Skill Extractor & Normalizer Unit Checks ---');
    // Normalization checks
    assert(normalizeSkill('react') === 'React.js', 'Normalizes "react" to "React.js"');
    assert(normalizeSkill('REACT.JS') === 'React.js', 'Normalizes "REACT.JS" to "React.js"');
    assert(normalizeSkill('python') === 'Python', 'Normalizes "python" to "Python"');
    assert(normalizeSkill('Postgresql') === 'PostgreSQL', 'Normalizes "Postgresql" to "PostgreSQL"');

    // Genuine learning resource check
    const sqlResource = getLearningResource('SQL');
    assert(sqlResource.url.includes('sqlbolt.com'), 'SQL maps to genuine free resource (SQLBolt)');
    const powerBiResource = getLearningResource('Power BI');
    assert(powerBiResource.url.includes('microsoft.com'), 'Power BI maps to Microsoft Learn');
    const pythonResource = getLearningResource('Python');
    assert(pythonResource.url.includes('w3schools.com'), 'Python maps to W3Schools');

    console.log('\n--- 2. Scenario A: User with profile skills but NO job descriptions ---');
    // Register user with profile skills: Python, SQL, Communication, Excel
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `skilluser_${Date.now()}`,
        email: testEmail,
        password: 'ValidPassword123!',
        fullName: 'Skill Gap Tester',
        targetRole: 'Frontend Developer',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, 'Test user registered successfully');
    const token = regData.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Set initial profile skills
    const profileRes = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        skills: ['Python', 'SQL', 'Communication', 'Excel'],
        targetRole: 'Frontend Developer',
      }),
    });
    const profileData = await profileRes.json();
    assert(profileData.data.profile.skills.length === 4, 'Set profile skills: Python, SQL, Communication, Excel');

    // Fetch Dashboard Analytics with 0 applications
    const dashResA = await fetch(`${BASE_URL}/analytics/dashboard`, {
      method: 'GET',
      headers: authHeaders,
    });
    const dashDataA = await dashResA.json();
    assert(dashDataA.success === true, 'Dashboard API returned success');
    assert(dashDataA.data.stats.hasAnalyzableJobs === false, 'hasAnalyzableJobs is false when no applications exist');
    assert(dashDataA.data.stats.matchableAppsCount === 0, 'matchableAppsCount is 0');
    assert(dashDataA.data.stats.averageMatchScore === null, 'averageMatchScore is strictly null (NEVER 0%!)');
    assert(dashDataA.data.skillGap.recommendedSkills.length === 0, 'No false skill gaps reported when no jobs analyzed');
    assert(
      Array.isArray(dashDataA.data.skillGap.suggestedRoleSkills) && dashDataA.data.skillGap.suggestedRoleSkills.length > 0,
      'suggestedRoleSkills provided based on targetRole (Frontend Developer)'
    );

    // Verify suggested skills are genuine without fabricated market counts
    const firstSuggested = dashDataA.data.skillGap.suggestedRoleSkills[0];
    assert(firstSuggested.resource && firstSuggested.resource.url, 'Suggested role skills include genuine learning resources');
    assert(firstSuggested.demandCount === undefined, 'Zero fabricated demand counts on suggested role skills');

    // Fetch Learning Page with 0 applications
    const learnResA = await fetch(`${BASE_URL}/learning`, {
      method: 'GET',
      headers: authHeaders,
    });
    const learnDataA = await learnResA.json();
    assert(learnDataA.data.hasAnalyzableJobs === false, 'Learning page reflects hasAnalyzableJobs === false');
    assert(learnDataA.data.missingSkills.length === 0, 'Learning page reports 0 missingSkills without jobs');
    assert(learnDataA.data.suggestedRoleSkills.length > 0, 'Learning page provides suggestedRoleSkills');

    console.log('\n--- 3. Scenario B: Adding Applications with Skills & Checking Compatibility ---');
    // Application 1: TechCorp - Frontend Developer
    // Required skills: React.js, React (duplicate), HTML, CSS, Python (in profile), python (duplicate)
    // Unique recognized required skills: ['React.js', 'HTML', 'CSS', 'Python'] (4 total)
    // Matched: ['Python'] (1 matched)
    // Compatibility: Math.round((1 / 4) * 100) = 25%
    const app1Res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        company: 'TechCorp',
        role: 'Frontend Developer',
        status: 'Applied',
        applicationDate: new Date(),
        jobDescription: 'Looking for React.js, React, HTML, CSS, and Python developer.',
        requiredSkills: ['React.js', 'React', 'HTML', 'CSS', 'Python', 'python'],
        notes: 'SKILL_GAP_TEST_APP',
      }),
    });
    const app1Data = await app1Res.json();
    assert(app1Res.status === 201 && app1Data.data._id, 'Application 1 created with required skills');
    const app1Id = app1Data.data._id;

    // Fetch Dashboard Analytics with 1 application
    const dashResB1 = await fetch(`${BASE_URL}/analytics/dashboard`, {
      method: 'GET',
      headers: authHeaders,
    });
    const dashDataB1 = await dashResB1.json();
    assert(dashDataB1.data.stats.hasAnalyzableJobs === true, 'hasAnalyzableJobs is now true');
    assert(dashDataB1.data.stats.matchableAppsCount === 1, 'matchableAppsCount is 1');
    assert(dashDataB1.data.stats.averageMatchScore === 25, 'averageMatchScore is accurately calculated at 25% (1/4)');
    assert(
      dashDataB1.data.skillGap.recommendedSkills.some((s) => s.skill === 'React.js'),
      'Identified React.js as a required skill gap'
    );

    // Application 2: DataSystems - Data Intern
    // Required skills: Python, SQL
    // Unique recognized required skills: ['Python', 'SQL'] (2 total)
    // Matched: ['Python', 'SQL'] (2 matched)
    // Compatibility: Math.round((2 / 2) * 100) = 100%
    const app2Res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        company: 'DataSystems',
        role: 'Data Intern',
        status: 'Applied',
        applicationDate: new Date(),
        jobDescription: 'Seeking Python and SQL expert.',
        requiredSkills: ['Python', 'SQL'],
        notes: 'SKILL_GAP_TEST_APP',
      }),
    });
    const app2Data = await app2Res.json();
    assert(app2Res.status === 201 && app2Data.data._id, 'Application 2 created with Python and SQL');
    const app2Id = app2Data.data._id;

    // Fetch Dashboard Analytics with 2 applications
    // Average compatibility: Math.round((25 + 100) / 2) = 63%
    const dashResB2 = await fetch(`${BASE_URL}/analytics/dashboard`, {
      method: 'GET',
      headers: authHeaders,
    });
    const dashDataB2 = await dashResB2.json();
    assert(dashDataB2.data.stats.matchableAppsCount === 2, 'matchableAppsCount is 2');
    assert(dashDataB2.data.stats.averageMatchScore === 63, 'averageMatchScore is accurately calculated at 63% ((25% + 100%) / 2)');

    console.log('\n--- 4. Scenario C: Learning Roadmap Progress & Updates ---');
    // Update progress on React.js to 'Learning'
    const learnUpdate1 = await fetch(`${BASE_URL}/learning/React.js`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Learning',
        notes: 'Currently reading official React docs',
      }),
    });
    const learnData1 = await learnUpdate1.json();
    assert(learnData1.success === true, 'Updated React.js learning status to "Learning"');

    // Verify progress in GET /api/learning
    const learnResB = await fetch(`${BASE_URL}/learning`, {
      method: 'GET',
      headers: authHeaders,
    });
    const learnDataB = await learnResB.json();
    const reactItem = learnDataB.data.missingSkills.find((s) => s.skillName === 'React.js');
    assert(reactItem && reactItem.status === 'Learning', 'Learning page reflects "Learning" status for React.js');
    assert(reactItem && reactItem.notes === 'Currently reading official React docs', 'Learning notes persisted correctly');
    assert(learnDataB.data.stats.learningCount === 1, 'Learning count stats incremented to 1');

    // Update progress on React.js to 'Completed'
    const learnUpdate2 = await fetch(`${BASE_URL}/learning/React.js`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Completed',
        notes: 'Finished interactive React tutorial',
      }),
    });
    const learnData2 = await learnUpdate2.json();
    assert(learnData2.data.status === 'Completed', 'Updated React.js learning status to "Completed"');

    console.log('\n--- 5. Scenario D: Adding Missing Skill to Profile updates Compatibility ---');
    // Add 'React.js' directly into user profile (via learning endpoint addToProfile option)
    const addSkillRes = await fetch(`${BASE_URL}/learning/React.js`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Completed',
        addToProfile: true,
      }),
    });
    assert(addSkillRes.status === 200, 'Added React.js to user profile');

    // Recalculate dashboard metrics:
    // App 1 now has React.js + Python matched out of 4 = 50%
    // App 2 has 100%
    // New average: Math.round((50 + 100) / 2) = 75%
    const dashResC = await fetch(`${BASE_URL}/analytics/dashboard`, {
      method: 'GET',
      headers: authHeaders,
    });
    const dashDataC = await dashResC.json();
    assert(dashDataC.data.stats.averageMatchScore === 75, 'averageMatchScore immediately updated to 75% after acquiring React.js');
    assert(
      !dashDataC.data.skillGap.recommendedSkills.some((s) => s.skill === 'React.js'),
      'React.js is no longer listed in skill gaps since user now has it in profile'
    );

    console.log('\n--- 6. Scenario E: Deleting Applications returns cleanly to Empty State ---');
    await fetch(`${BASE_URL}/applications/${app1Id}`, { method: 'DELETE', headers: authHeaders });
    await fetch(`${BASE_URL}/applications/${app2Id}`, { method: 'DELETE', headers: authHeaders });

    const dashResD = await fetch(`${BASE_URL}/analytics/dashboard`, {
      method: 'GET',
      headers: authHeaders,
    });
    const dashDataD = await dashResD.json();
    assert(dashDataD.data.stats.hasAnalyzableJobs === false, 'hasAnalyzableJobs resets to false after deleting all applications');
    assert(dashDataD.data.stats.averageMatchScore === null, 'averageMatchScore returns to null');
    assert(dashDataD.data.skillGap.recommendedSkills.length === 0, 'No skill gaps displayed when applications are removed');
    assert(dashDataD.data.skillGap.suggestedRoleSkills.length > 0, 'Role-based skill suggestions cleanly displayed again');

    // Cleanup test user and learning records
    await User.findByIdAndDelete(regData.user.id);
    await LearningProgress.deleteMany({ user: regData.user.id });

    console.log('\n======================================================');
    console.log(`Results: ${passedCount} Passed, ${failedCount} Failed`);
    console.log('======================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Test suite execution failed:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await closeDB();
  }
}

if (require.main === module) {
  runSkillGapAnalysisTests();
}

module.exports = { runSkillGapAnalysisTests };
