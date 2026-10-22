const mongoose = require('mongoose');
const { app } = require('../server');
const { connectDB, closeDB } = require('../config/db');

async function runE2ETests() {
  console.log('🚀 Running Comprehensive Real Local Workflow E2E Tests...\n');
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
    server = app.listen(5099);
    const BASE_URL = 'http://localhost:5099/api';

    console.log('--- 1. Authentication Tests ---');
    // Test 1: Register a new user
    const userPayload = {
      username: `student_${Date.now()}`,
      email: `student_${Date.now()}@college.edu`,
      password: 'RealPassword123!',
      fullName: 'Alex Morgan',
      targetRole: 'Full Stack Engineer',
    };

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success && regData.token, 'Register a real user account with hashed password');

    const token = regData.token;

    // Test 2: Reject duplicate registration
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload),
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 400 && !dupData.success, 'Reject duplicate email registration');

    // Test 3: Log in with correct credentials
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userPayload.email, password: userPayload.password }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success && loginData.token, 'Log in successfully with valid database credentials');

    // Test 4: Reject invalid credentials
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userPayload.email, password: 'WrongPassword999' }),
    });
    assert(badLoginRes.status === 401, 'Reject login with incorrect password');

    // Test 5: Verify session with /auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.email === userPayload.email, 'Fetch authenticated user session via JWT token');

    // Test 6: Verify protected access blocked without token
    const unauthRes = await fetch(`${BASE_URL}/auth/me`);
    assert(unauthRes.status === 401, 'Reject unauthenticated access to protected endpoint');

    console.log('\n--- 2. Applications CRUD & Skill Extraction Tests ---');
    // Test 7: Create application
    const appPayload = {
      company: 'TechCorp Innovations',
      role: 'Frontend Developer Intern',
      type: 'Internship',
      location: 'New York, NY',
      mode: 'Hybrid',
      url: 'https://techcorp.example.com/jobs/101',
      description: 'We are seeking an intern proficient in React.js, TypeScript, Tailwind CSS, and Git. Strong communication skills required.',
      applicationDate: '2026-03-01',
      status: 'Applied',
      notes: 'Applied via college career portal',
      requiredSkills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Git'],
    };

    const createAppRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(appPayload),
    });
    const createAppJson = await createAppRes.json();
    assert(createAppRes.status === 201 && createAppJson.data.company === 'TechCorp Innovations', 'Create application in database');
    const appId = createAppJson.data._id;

    // Test 8: Create second application for skill frequency testing
    const app2Payload = {
      company: 'CloudScale Systems',
      role: 'Full Stack Intern',
      type: 'Internship',
      location: 'Remote',
      mode: 'Remote',
      description: 'Looking for a passionate student with hands-on experience in React.js, Node.js, Express, MongoDB, and Git.',
      applicationDate: '2026-03-05',
      status: 'Assessment',
      requiredSkills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Git'],
    };
    const createApp2Res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(app2Payload),
    });
    const createApp2Json = await createApp2Res.json();
    assert(createApp2Res.status === 201, 'Create second application for aggregation');
    const app2Id = createApp2Json.data._id;

    // Test 9: Update application status with history
    const updateAppRes = await fetch(`${BASE_URL}/applications/${appId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'Interview',
        statusNote: 'Passed preliminary resume review and moving to tech round',
      }),
    });
    const updateAppJson = await updateAppRes.json();
    assert(
      updateAppRes.status === 200 &&
      updateAppJson.data.status === 'Interview' &&
      updateAppJson.data.statusHistory.length >= 2,
      'Update application status and append to statusHistory'
    );

    // Test 10: Auto-extract skills from JD endpoint
    const extractRes = await fetch(`${BASE_URL}/applications/extract-skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: 'Must know Python, SQL, Docker, AWS and problem solving.' }),
    });
    const extractJson = await extractRes.json();
    assert(
      extractRes.status === 200 &&
      extractJson.skills.includes('Python') &&
      extractJson.skills.includes('SQL'),
      'Auto-extract skills from job description text'
    );

    // Test 11: Export applications to CSV
    const csvRes = await fetch(`${BASE_URL}/applications/export/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const csvText = await csvRes.text();
    assert(
      csvRes.status === 200 &&
      csvText.includes('Company,Role') &&
      csvText.includes('TechCorp Innovations'),
      'Export user applications as CSV formatted data'
    );

    console.log('\n--- 3. Dashboard Analytics & Skill Intelligence Tests ---');
    // Test 12: Real Dashboard Analytics
    const dashRes = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashJson = await dashRes.json();
    const dashStats = dashJson.data.stats;
    assert(dashStats.totalApplications === 2, 'Dashboard calculates exact application total from database (2 apps)');
    assert(dashStats.interviews === 1, 'Dashboard calculates exact interview stage count (1 in Interview)');

    // Test 13: Skill Demand Ranking calculated from actual applications
    const topSkills = dashJson.data.topDemandedSkills;
    const reactSkill = topSkills.find((s) => s.skill === 'React.js');
    const gitSkill = topSkills.find((s) => s.skill === 'Git');
    assert(reactSkill && reactSkill.count === 2 && reactSkill.percentage === 100, 'React.js calculated at 100% frequency across 2 applications');
    assert(gitSkill && gitSkill.count === 2 && gitSkill.percentage === 100, 'Git calculated at 100% frequency across 2 applications');

    console.log('\n--- 4. Interviews & Reminders Tests ---');
    // Test 14: Schedule Interview
    const interviewPayload = {
      applicationId: appId,
      round: 'Technical Round 1 (React & Data Structures)',
      interviewType: 'Online Video',
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      notes: 'Prepare project architecture and DSA questions',
    };
    const createIntRes = await fetch(`${BASE_URL}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(interviewPayload),
    });
    const createIntJson = await createIntRes.json();
    assert(createIntRes.status === 201 && createIntJson.data.round.includes('Technical Round'), 'Schedule real interview linked to application');
    const intId = createIntJson.data._id;

    // Test 15: Update Interview
    const updateIntRes = await fetch(`${BASE_URL}/interviews/${intId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'Completed' }),
    });
    const updateIntJson = await updateIntRes.json();
    assert(updateIntRes.status === 200 && updateIntJson.data.status === 'Completed', 'Update interview status');

    // Test 16: Create Reminder
    const remPayload = {
      title: 'Follow up with recruiter on TechCorp tech round',
      dueDate: new Date(Date.now() + 3600000).toISOString(),
      type: 'Application Follow-up',
      applicationId: appId,
    };
    const createRemRes = await fetch(`${BASE_URL}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(remPayload),
    });
    const createRemJson = await createRemRes.json();
    assert(createRemRes.status === 201 && createRemJson.data.title.includes('Follow up'), 'Create real reminder linked to application');
    const remId = createRemJson.data._id;

    // Test 17: Toggle Reminder
    const toggleRemRes = await fetch(`${BASE_URL}/reminders/${remId}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const toggleRemJson = await toggleRemRes.json();
    assert(toggleRemRes.status === 200 && toggleRemJson.data.completed === true, 'Toggle reminder to completed');

    console.log('\n--- 5. Resume Builder & Multi-version Tracking Tests ---');
    // Test 18: Create Resume in DB
    const resumePayload = {
      title: 'Full Stack React Engineer Resume',
      targetRole: 'Full Stack Developer',
      personalInfo: {
        fullName: 'Alex Morgan',
        email: userPayload.email,
        phone: '+1 555-0199',
        location: 'New York, NY',
        linkedin: 'https://linkedin.com/in/alexmorgan',
        github: 'https://github.com/alexmorgan',
      },
      summary: 'Passionate computer science student experienced in MERN stack development.',
      education: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'State University',
          startDate: '2022',
          endDate: '2026',
          grade: '3.9 GPA',
        },
      ],
      skills: {
        languages: ['JavaScript', 'TypeScript', 'Python'],
        frameworks: ['React.js', 'Node.js', 'Express.js', 'Tailwind CSS'],
        tools: ['Git', 'MongoDB', 'Docker'],
        softSkills: ['Team Leadership', 'Problem Solving'],
      },
      projects: [
        {
          title: 'CareerTrack Management Portal',
          description: 'Full stack MERN student placement and job management platform.',
          technologies: ['React', 'Express', 'Node.js', 'MongoDB'],
          link: 'https://github.com/alexmorgan/careertrack',
        },
      ],
      certifications: [
        {
          name: 'Meta Front-End Developer Certificate',
          issuer: 'Coursera',
          date: '2025',
          link: 'https://coursera.org/verify/12345',
        },
      ],
      achievements: [
        'Dean List for Academic Excellence 2024-2025',
      ],
    };

    const createResumeRes = await fetch(`${BASE_URL}/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(resumePayload),
    });
    const createResumeJson = await createResumeRes.json();
    assert(createResumeRes.status === 201 && createResumeJson.data.title.includes('Full Stack React'), 'Save resume to database with certifications and achievements');
    const resumeId = createResumeJson.data._id;

    // Test 19: Associate Resume with Application
    const linkResumeRes = await fetch(`${BASE_URL}/applications/${appId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resumeUsed: resumeId }),
    });
    const linkResumeJson = await linkResumeRes.json();
    assert(linkResumeRes.status === 200 && linkResumeJson.data.resumeUsed === resumeId, 'Associate resume with application');

    // Test 20: Delete application and verify cleanup
    const deleteAppRes = await fetch(`${BASE_URL}/applications/${app2Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(deleteAppRes.status === 200, 'Delete application record from database');

    const getRemainingAppsRes = await fetch(`${BASE_URL}/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const remainingAppsJson = await getRemainingAppsRes.json();
    assert(remainingAppsJson.count === 1, 'Only 1 application remains in database after deletion');

    console.log(`\n🎉 E2E Workflow Results: ${passedCount} passed, ${failedCount} failed.`);

    server.close();
    await closeDB();
    process.exit(failedCount === 0 ? 0 : 1);
  } catch (err) {
    console.error('E2E Test Execution Error:', err);
    if (server) server.close();
    await closeDB();
    process.exit(1);
  }
}

runE2ETests();
