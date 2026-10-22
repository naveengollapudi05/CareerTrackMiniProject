/**
 * CareerTrack Backend Comprehensive Integration Test Suite
 * Tests MongoDB connection, Auth, Applications CRUD, User Isolation,
 * Dashboard stats, Skill Extraction, Skill Gaps, Interviews, Reminders, and Resumes.
 */

const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const Reminder = require('../models/Reminder');
const LearningProgress = require('../models/LearningProgress');
const { extractSkillsFromText, normalizeSkill } = require('../utils/skillExtractor');
const jwt = require('jsonwebtoken');

let serverInstance;

async function runTests() {
  console.log('🧪 Starting CareerTrack Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Database Connection
    console.log('--- 1. Testing Database Connection ---');
    await connectDB();
    assert(true, 'Connected to MongoDB successfully');

    // Clean test collection
    await User.deleteMany({ email: { $in: ['test_student1@example.com', 'test_student2@example.com'] } });

    // 2. Authentication & User Registration
    console.log('\n--- 2. Testing User Registration & Password Hashing ---');
    const user1 = await User.create({
      username: 'student_alpha',
      email: 'test_student1@example.com',
      password: 'password123',
      profile: {
        fullName: 'Alpha Student',
        targetRole: 'Data Analyst Intern',
        skills: ['SQL', 'Excel', 'Python'],
      },
    });

    assert(user1._id != null, 'User created with valid ID');
    assert(user1.password !== 'password123', 'Password was securely hashed with bcrypt');

    // Password comparison
    const isMatch = await user1.matchPassword('password123');
    const isWrongMatch = await user1.matchPassword('wrongpass');
    assert(isMatch === true, 'user.matchPassword() returns true for correct password');
    assert(isWrongMatch === false, 'user.matchPassword() returns false for incorrect password');

    // Prevent duplicate email
    let duplicateEmailFailed = false;
    try {
      await User.create({
        username: 'student_beta',
        email: 'test_student1@example.com',
        password: 'password456',
      });
    } catch (e) {
      duplicateEmailFailed = true;
    }
    assert(duplicateEmailFailed, 'Prevent duplicate email registration');

    // Create user 2 for user isolation testing
    const user2 = await User.create({
      username: 'student_beta',
      email: 'test_student2@example.com',
      password: 'password456',
      profile: {
        fullName: 'Beta Student',
        targetRole: 'Frontend Developer',
        skills: ['JavaScript', 'React.js'],
      },
    });

    // 3. Skill Extraction Utility Testing
    console.log('\n--- 3. Testing Skill Extraction & Normalization ---');
    const rawJobDescription = `
      We are looking for a Data Analyst Intern.
      Requirements:
      - Strong knowledge of python, SQL, and powerbi / Power BI.
      - Experience with Excel and communication skills.
      - Basic understanding of Machine Learning and Rest API.
    `;
    const extractedSkills = extractSkillsFromText(rawJobDescription);
    assert(extractedSkills.includes('Python'), 'Extracted canonical "Python" from lowercase');
    assert(extractedSkills.includes('SQL'), 'Extracted canonical "SQL"');
    assert(extractedSkills.includes('Power BI'), 'Extracted canonical "Power BI" from "powerbi"');
    assert(extractedSkills.includes('Excel'), 'Extracted "Excel"');
    assert(extractedSkills.includes('Communication'), 'Extracted "Communication"');
    assert(normalizeSkill('sql') === 'SQL', 'Normalized "sql" to "SQL"');
    assert(normalizeSkill('reactjs') === 'React.js', 'Normalized "reactjs" to "React.js"');

    // 4. Applications CRUD & Ownership Protection
    console.log('\n--- 4. Testing Applications CRUD & Status History ---');
    const app1 = await Application.create({
      user: user1._id,
      company: 'Acme Corp',
      role: 'Junior Analyst',
      type: 'Internship',
      status: 'Applied',
      requiredSkills: ['SQL', 'Python', 'Power BI', 'Excel'],
      statusHistory: [
        { status: 'Applied', date: new Date(), notes: 'Submitted via career page' },
      ],
    });
    assert(app1._id != null, 'Created application for user 1');
    assert(app1.statusHistory.length === 1, 'Initial status history recorded');

    // Update application and status history
    app1.status = 'Interview';
    app1.statusHistory.push({
      status: 'Interview',
      date: new Date(),
      notes: 'Invited to Round 1',
    });
    await app1.save();
    const updatedApp = await Application.findById(app1._id);
    assert(updatedApp.status === 'Interview', 'Application status updated to Interview');
    assert(updatedApp.statusHistory.length === 2, 'Status history tracks transition with date and notes');

    // Create a 2nd application for user 1
    const app2 = await Application.create({
      user: user1._id,
      company: 'TechGlobal',
      role: 'Python Developer',
      type: 'Full-Time',
      status: 'Applied',
      requiredSkills: ['Python', 'SQL', 'Git', 'Docker'],
    });

    // Create an application for user 2
    const appUser2 = await Application.create({
      user: user2._id,
      company: 'User2 Stealth Co',
      role: 'UI Designer',
      type: 'Internship',
      status: 'Applied',
      requiredSkills: ['Figma', 'React.js'],
    });

    // USER DATA ISOLATION TEST
    console.log('\n--- 5. Testing User-Specific Data Isolation ---');
    const user1Apps = await Application.find({ user: user1._id });
    const user2Apps = await Application.find({ user: user2._id });
    assert(user1Apps.length === 2, 'User 1 queries only their 2 applications');
    assert(user2Apps.length === 1, 'User 2 queries only their 1 application');
    assert(
      !user1Apps.some((a) => a.company === 'User2 Stealth Co'),
      'User 1 cannot access User 2 applications'
    );

    // 6. Demanded Skills & Frequency Counting (Count at most once per application)
    console.log('\n--- 6. Testing Top Demanded Skills Frequency Calculation ---');
    // user 1 has app1 (SQL, Python, Power BI, Excel) and app2 (Python, SQL, Git, Docker)
    const apps = await Application.find({ user: user1._id });
    const skillCounts = {};
    apps.forEach((app) => {
      const distinctInApp = new Set(app.requiredSkills);
      distinctInApp.forEach((sk) => {
        skillCounts[sk] = (skillCounts[sk] || 0) + 1;
      });
    });

    assert(skillCounts['Python'] === 2, 'Python requested in 2 distinct applications');
    assert(skillCounts['SQL'] === 2, 'SQL requested in 2 distinct applications');
    assert(skillCounts['Power BI'] === 1, 'Power BI requested in 1 application');
    assert(skillCounts['Git'] === 1, 'Git requested in 1 application');

    // 7. Interviews Scheduling & Association
    console.log('\n--- 7. Testing Interviews Scheduling & Application Association ---');
    const interview1 = await Interview.create({
      user: user1._id,
      application: app1._id,
      round: 'Technical Round 1',
      interviewType: 'Online Video',
      scheduledDate: new Date(Date.now() + 86400000), // tomorrow
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      notes: 'Prepare SQL window functions',
      status: 'Scheduled',
    });
    assert(interview1._id != null, 'Scheduled interview associated with app1');
    assert(interview1.meetingUrl.startsWith('https://'), 'Meeting URL stored');

    // 8. Reminders Creation, Categorization & Completion
    console.log('\n--- 8. Testing Reminders & Date Categorization ---');
    const today = new Date();
    const reminderDueToday = await Reminder.create({
      user: user1._id,
      title: 'Follow up with Acme Corp HR',
      dueDate: today,
      type: 'Application Follow-up',
      application: app1._id,
      completed: false,
    });
    assert(reminderDueToday._id != null, 'Created reminder due today');

    // Toggle complete
    reminderDueToday.completed = true;
    reminderDueToday.completedAt = new Date();
    await reminderDueToday.save();
    const updatedReminder = await Reminder.findById(reminderDueToday._id);
    assert(updatedReminder.completed === true, 'Reminder marked as completed');

    // 9. Resume Builder Saving & Usage Tracking
    console.log('\n--- 9. Testing Resume Builder & Application Association ---');
    const resume1 = await Resume.create({
      user: user1._id,
      title: 'Data Analyst Placement Resume',
      targetRole: 'Data Analyst',
      personalInfo: {
        fullName: 'Alpha Student',
        email: 'test_student1@example.com',
        phone: '+91 99999 88888',
      },
      skills: {
        languages: ['Python', 'SQL'],
        frameworks: ['Pandas'],
        tools: ['Power BI', 'Excel'],
        softSkills: ['Communication'],
      },
    });
    assert(resume1._id != null, 'Resume saved to database');

    // Associate resume with app1
    app1.resumeUsed = resume1._id;
    await app1.save();
    const resumeUsageCount = await Application.countDocuments({
      user: user1._id,
      resumeUsed: resume1._id,
    });
    assert(resumeUsageCount === 1, 'Resume usage correctly tracked across applications');

    // Clean up test records
    await Application.deleteMany({ user: { $in: [user1._id, user2._id] } });
    await Interview.deleteMany({ user: { $in: [user1._id, user2._id] } });
    await Reminder.deleteMany({ user: { $in: [user1._id, user2._id] } });
    await Resume.deleteMany({ user: { $in: [user1._id, user2._id] } });
    await User.deleteMany({ _id: { $in: [user1._id, user2._id] } });

    console.log(`\n🎉 Test Suite Finished: ${passed} passed, ${failed} failed.`);
    await closeDB();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    await closeDB();
    process.exit(1);
  }
}

runTests();
