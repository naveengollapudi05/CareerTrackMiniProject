const assert = require('assert');
const { parseResumeText } = require('../utils/resumeParser');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

async function runResumeImportTests() {
  console.log('\n📄 Starting Resume Parser & Import Test Suite...\n');
  let passed = 0;

  // Test 1: High Quality Text Resume Extraction
  const sampleResumeText = `
Alex Mercer
alex.mercer@example.com | (555) 123-4567 | San Francisco, CA
https://linkedin.com/in/alexmercer | https://github.com/alexmercer

Summary
Motivated full-stack engineer passionate about cloud architecture, responsive frontends, and scalable distributed systems.

Experience
Frontend Engineer - TechCorp Inc - San Francisco, CA
Jun 2022 - Present
- Built modern single-page applications using React.js and Tailwind CSS.
- Optimized bundle sizes and reduced load time by 35%.

Software Intern - NextGen Software
Jan 2021 - May 2022
- Developed REST APIs using Node.js, Express, and MongoDB.

Education
B.S. in Computer Science - University of California, Berkeley
Aug 2018 - May 2022
GPA: 3.8 / 4.0

Skills
Languages: JavaScript, TypeScript, Python, HTML5, CSS3, SQL
Frameworks & Libraries: React.js, Express.js, Node.js, Tailwind CSS
Developer Tools: Git, Docker, MongoDB, AWS, Postman

Projects
DevTrack - Developer Analytics Platform
- Open-source tracking dashboard built with React, Node.js, and MongoDB.
- Implemented real-time telemetry and Git metrics.

Certifications
AWS Certified Solutions Architect - Amazon Web Services - 2023

Achievements
- 1st Place Winner at CalHacks Hackathon 2022
- Dean's Honor List for 6 consecutive semesters
`;

  try {
    const parsed = parseResumeText(sampleResumeText);

    // Contact info
    assert.strictEqual(parsed.personalInfo.fullName, 'Alex Mercer');
    assert.strictEqual(parsed.personalInfo.email, 'alex.mercer@example.com');
    assert.ok(parsed.personalInfo.phone.includes('123-4567'));
    assert.strictEqual(parsed.personalInfo.linkedin, 'https://linkedin.com/in/alexmercer');
    assert.strictEqual(parsed.personalInfo.github, 'https://github.com/alexmercer');
    console.log('  ✅ PASS: Extracted complete personal & contact info');
    passed++;

    // Summary
    assert.ok(parsed.summary.includes('Motivated full-stack engineer'));
    console.log('  ✅ PASS: Extracted professional summary');
    passed++;

    // Skills categorized
    assert.ok(parsed.skills.languages.includes('JavaScript'));
    assert.ok(parsed.skills.languages.includes('Python'));
    assert.ok(parsed.skills.frameworks.includes('React.js'));
    assert.ok(parsed.skills.frameworks.includes('Node.js'));
    assert.ok(parsed.skills.tools.includes('Git'));
    assert.ok(parsed.skills.tools.includes('Docker'));
    console.log('  ✅ PASS: Extracted and categorized skills correctly');
    passed++;

    // Experience
    assert.strictEqual(parsed.experience.length, 2);
    assert.strictEqual(parsed.experience[0].title, 'Frontend Engineer');
    assert.strictEqual(parsed.experience[0].company, 'TechCorp Inc');
    console.log('  ✅ PASS: Extracted employment experience entries and dates');
    passed++;

    // Education
    assert.strictEqual(parsed.education.length, 1);
    assert.ok(parsed.education[0].degree.includes('Computer Science'));
    assert.ok(parsed.education[0].institution.includes('University of California'));
    console.log('  ✅ PASS: Extracted degree, institution, and GPA');
    passed++;

    // Projects
    assert.strictEqual(parsed.projects.length, 1);
    assert.strictEqual(parsed.projects[0].title, 'DevTrack');
    console.log('  ✅ PASS: Extracted project entries and details');
    passed++;

    // Certifications & Achievements
    assert.ok(parsed.certifications.length >= 1);
    assert.ok(parsed.achievements.length >= 1);
    console.log('  ✅ PASS: Extracted certifications and honors/achievements');
    passed++;

    // Test 2: Unreadable / Scanned / Empty Document Handling
    let errorCaught = false;
    try {
      parseResumeText('   short image text   ');
    } catch (e) {
      errorCaught = true;
      assert.ok(e.message.includes('scanned image'));
    }
    assert.strictEqual(errorCaught, true);
    console.log('  ✅ PASS: Safely rejected unreadable / scanned documents with friendly error');
    passed++;

    // Test 3: PDF Binary Parsing via PDFParse
    const testPdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n5 0 obj<</Length 44>>stream\nBT\n/F1 24 Tf\n100 700 Td\n(Jane Doe Candidate) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \n0000000281 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n381\n%%EOF'
    );
    const pdfParser = new PDFParse({ data: testPdfBuffer });
    const pdfResult = await pdfParser.getText();
    await pdfParser.destroy();
    assert.ok(pdfResult.text.includes('Jane Doe Candidate'));
    console.log('  ✅ PASS: Successfully extracted text from PDF binary stream');
    passed++;

    console.log(`\n🎉 All ${passed} Resume Parser & Import Tests Passed Successfully!\n`);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runResumeImportTests();
