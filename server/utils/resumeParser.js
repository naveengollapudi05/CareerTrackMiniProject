const { extractSkillsFromText, normalizeSkill } = require('./skillExtractor');

/**
 * Intelligent Text-Based Resume Parser
 * Parses extracted text from PDF/DOCX resumes into CareerTrack's structured format.
 */

// Common section header patterns
const SECTION_PATTERNS = {
  summary: /^(?:professional\s+)?summary|career\s+objective|profile|about\s+me|overview/i,
  experience: /^(?:work\s+)?experience|employment(?:\s+history)?|internships?|professional\s+background/i,
  education: /^education|academic\s+background|qualifications|academic\s+history/i,
  skills: /^(?:technical\s+|core\s+)?skills|technologies|competencies|tools\s*(?:&|and)\s*technologies/i,
  projects: /^(?:key\s+|featured\s+|academic\s+)?projects/i,
  certifications: /^(?:certifications?|licenses?|courses|credentials?)/i,
  achievements: /^(?:key\s+|honors\s*(?:&|and)\s*)?achievements|honors|awards|accomplishments/i,
};

// Date range pattern e.g. "Jun 2022 - Aug 2023", "2020 – 2024", "Jan 2021 - Present"
const DATE_RANGE_REGEX = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\s*(?:–|-|to)\s*(?:(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}|present|current)/i;
const YEAR_REGEX = /\b(19\d{2}|20\d{2})\b/g;

/**
 * Segment raw text into sections by recognizable headings
 */
function segmentSections(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sections = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    other: [],
  };

  let currentSection = 'header';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line looks like a section header (short line, usually <= 40 chars, without terminal period)
    if (line.length <= 40 && !line.endsWith('.')) {
      const cleaned = line.replace(/[:#\-_]/g, '').trim();
      let matched = false;

      for (const [secKey, regex] of Object.entries(SECTION_PATTERNS)) {
        if (regex.test(cleaned)) {
          currentSection = secKey;
          matched = true;
          break;
        }
      }

      if (matched) {
        continue; // Don't include the heading line itself in the section body
      }
    }

    sections[currentSection].push(line);
  }

  return sections;
}

/**
 * Extract contact information from header or full text
 */
function extractPersonalInfo(lines, fullText) {
  const personalInfo = {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  };

  // 1. Email extraction
  const emailMatch = fullText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  if (emailMatch) {
    personalInfo.email = emailMatch[0].toLowerCase();
  }

  // 2. Phone extraction
  const phoneMatch = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,13}/);
  if (phoneMatch) {
    personalInfo.phone = phoneMatch[0].trim();
  }

  // 3. LinkedIn
  const linkedinMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in\/)?([a-zA-Z0-9_\-\.]+)/i);
  if (linkedinMatch) {
    personalInfo.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
  }

  // 4. GitHub
  const githubMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)/i);
  if (githubMatch) {
    personalInfo.github = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;
  }

  // 5. Portfolio
  const portfolioMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9_\-\.]+\.(?:dev|io|me|tech|app|vercel\.app|netlify\.app))(?:\/[^\s]*)?/i);
  if (portfolioMatch && !portfolioMatch[0].includes('linkedin') && !portfolioMatch[0].includes('github')) {
    personalInfo.portfolio = portfolioMatch[0].startsWith('http') ? portfolioMatch[0] : `https://${portfolioMatch[0]}`;
  }

  // 6. Name extraction: inspect the first few lines of the header
  const headerLines = lines.slice(0, 5);
  for (const line of headerLines) {
    // A name candidate is typically 2-4 words, mostly letters, doesn't contain @ or http or digits
    const cleaned = line.replace(/[^a-zA-Z\s]/g, '').trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      !line.includes('@') &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum') &&
      !line.toLowerCase().includes('github') &&
      !line.toLowerCase().includes('linkedin') &&
      !/\d/.test(line)
    ) {
      personalInfo.fullName = words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      break;
    }
  }

  // 7. Location extraction
  for (const line of lines.slice(0, 8)) {
    // Look for City, State / Country pattern or postal codes
    if (
      /[A-Za-z]+,\s*[A-Za-z]+/.test(line) &&
      !line.includes('@') &&
      !line.includes('http') &&
      line.length < 50
    ) {
      personalInfo.location = line.replace(/•|\|/g, '').trim();
      break;
    }
  }

  return personalInfo;
}

/**
 * Categorize skills into languages, frameworks, tools, soft skills
 */
function extractAndCategorizeSkills(skillLines, fullText) {
  const combinedText = skillLines.join(' ') + ' ' + fullText;
  const detected = extractSkillsFromText(combinedText);

  // Categorize based on known classifications
  const languagesList = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'SQL', 'HTML', 'CSS'];
  const frameworksList = ['React.js', 'Node.js', 'Express.js', 'Next.js', 'Angular', 'Vue.js', 'Django', 'Flask', 'Spring Boot', 'Tailwind CSS'];
  const toolsList = ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'Google Cloud (GCP)', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Linux', 'Excel', 'Power BI', 'Tableau', 'Postman', 'REST API', 'GraphQL', 'Figma'];
  const softSkillsList = ['Communication', 'Problem Solving', 'Teamwork', 'Agile'];

  const categorized = {
    languages: [],
    frameworks: [],
    tools: [],
    softSkills: [],
  };

  detected.forEach((skill) => {
    if (languagesList.includes(skill)) categorized.languages.push(skill);
    else if (frameworksList.includes(skill)) categorized.frameworks.push(skill);
    else if (toolsList.includes(skill)) categorized.tools.push(skill);
    else if (softSkillsList.includes(skill)) categorized.softSkills.push(skill);
    else categorized.tools.push(skill);
  });

  // Also parse comma-separated or bullet items from the skillLines
  skillLines.forEach((line) => {
    const tokens = line
      .replace(/^[•\-\*]\s*/, '')
      .split(/[,;|•\t]/)
      .map((t) => t.replace(/[:()]/g, '').trim())
      .filter((t) => t.length > 1 && t.length < 35 && !/skills|languages|tools|frameworks/i.test(t));

    tokens.forEach((t) => {
      const normalized = normalizeSkill(t) || t;
      const allExtracted = [
        ...categorized.languages,
        ...categorized.frameworks,
        ...categorized.tools,
        ...categorized.softSkills,
      ];
      if (!allExtracted.map((s) => s.toLowerCase()).includes(normalized.toLowerCase())) {
        categorized.tools.push(normalized);
      }
    });
  });

  // Deduplicate each category
  categorized.languages = Array.from(new Set(categorized.languages));
  categorized.frameworks = Array.from(new Set(categorized.frameworks));
  categorized.tools = Array.from(new Set(categorized.tools));
  categorized.softSkills = Array.from(new Set(categorized.softSkills));

  return categorized;
}

/**
 * Parse education section
 */
function parseEducation(lines) {
  if (!lines || lines.length === 0) return [];

  const educationEntries = [];
  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isDegreeLine = /b\.?tech|b\.?s\.?|bachelor|m\.?s\.?|master|ph\.?d|diploma|associate|secondary|computer science|engineering|information technology/i.test(line);
    const dateMatch = line.match(DATE_RANGE_REGEX);
    const years = line.match(YEAR_REGEX) || [];

    // If currentEntry already exists but has no dates, and this line is purely dates
    if (currentEntry && !currentEntry.startDate && (dateMatch || years.length > 0) && line.length < 40) {
      currentEntry.startDate = years[0] || (dateMatch ? dateMatch[0].split(/[-–to]/i)[0].trim() : '');
      currentEntry.endDate = /present|current/i.test(line) ? 'Present' : (years[1] || (dateMatch ? dateMatch[0].split(/[-–to]/i)[1].trim() : ''));
      continue;
    }

    // Check if new degree block begins
    if (isDegreeLine || (!currentEntry && line.length > 4)) {
      if (currentEntry) {
        educationEntries.push(currentEntry);
      }

      let degree = isDegreeLine ? line.replace(/•/g, '').trim() : '';
      let institution = !isDegreeLine ? line.replace(/•/g, '').trim() : '';
      let location = '';

      // Check if line contains delimiter e.g. "B.S. in Computer Science - UC Berkeley"
      if (line.includes(' - ') || line.includes(' – ') || line.includes(' | ')) {
        const parts = line.split(/\s*[-–|]\s*/);
        if (parts.length >= 2) {
          degree = parts[0].replace(/•/g, '').trim();
          institution = parts[1].replace(/•/g, '').trim();
          if (parts[2]) location = parts[2].trim();
        }
      }

      currentEntry = {
        degree,
        institution,
        location,
        startDate: years.length >= 2 ? years[0] : (years[0] || ''),
        endDate: years.length >= 2 ? years[1] : (line.toLowerCase().includes('present') ? 'Present' : (years[0] || '')),
        grade: '',
        details: '',
      };

      // GPA/CGPA extraction on this line
      const gpaMatch = line.match(/(?:cgpa|gpa|percentage|score)?:?\s*(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?%?)/i);
      if (gpaMatch && gpaMatch[1]) {
        currentEntry.grade = gpaMatch[0].trim();
      }
    } else if (currentEntry) {
      // Secondary details for the current education entry
      if (!currentEntry.institution && /university|institute|college|school|academy/i.test(line)) {
        currentEntry.institution = line.replace(/•/g, '').trim();
      } else if (!currentEntry.degree && isDegreeLine) {
        currentEntry.degree = line.replace(/•/g, '').trim();
      }

      if (!currentEntry.startDate && years.length > 0) {
        currentEntry.startDate = years[0];
        currentEntry.endDate = years.length > 1 ? years[1] : (line.toLowerCase().includes('present') ? 'Present' : '');
      }

      const gpaMatch = line.match(/(?:cgpa|gpa|percentage|score)?:?\s*(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?%?)/i);
      if (gpaMatch && !currentEntry.grade) {
        currentEntry.grade = gpaMatch[0].trim();
      }
    }
  }

  if (currentEntry) {
    educationEntries.push(currentEntry);
  }

  return educationEntries;
}

/**
 * Parse work experience / internships section
 */
function parseExperience(lines) {
  if (!lines || lines.length === 0) return [];

  const experienceEntries = [];
  let currentExp = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(DATE_RANGE_REGEX);
    const years = line.match(YEAR_REGEX) || [];
    const isPresent = /present|current/i.test(line);

    // If currentExp already exists without dates and this line is primarily a date line
    if (currentExp && !currentExp.startDate && (dateMatch || years.length > 0) && line.length < 40) {
      currentExp.startDate = years[0] || (dateMatch ? dateMatch[0].split(/[-–to]/i)[0].trim() : '');
      currentExp.endDate = isPresent ? 'Present' : (years[1] || (dateMatch ? dateMatch[0].split(/[-–to]/i)[1].trim() : ''));
      currentExp.current = isPresent;
      continue;
    }

    const isJobTitle = /intern|developer|engineer|analyst|associate|manager|assistant|lead|trainee|consultant/i.test(line) && line.length < 80;

    // If line marks a new experience entry
    if (isJobTitle || (dateMatch && line.length < 80)) {
      if (currentExp && (currentExp.title || currentExp.company)) {
        experienceEntries.push(currentExp);
      }

      let title = line.replace(/•/g, '').trim();
      let company = '';
      let location = '';

      if (dateMatch) {
        const remainder = line.replace(dateMatch[0], '').replace(/[|•–-]/g, '').trim();
        if (remainder) {
          title = remainder;
        }
      }

      // Check if title has separators e.g. "Frontend Engineer - TechCorp Inc - San Francisco, CA"
      if (title.includes(' - ') || title.includes(' – ') || title.includes(' | ')) {
        const parts = title.split(/\s*[-–|]\s*/);
        title = parts[0].trim();
        if (parts[1]) company = parts[1].trim();
        if (parts[2]) location = parts[2].trim();
      }

      currentExp = {
        title,
        company,
        location,
        startDate: years[0] || '',
        endDate: isPresent ? 'Present' : (years[1] || ''),
        current: isPresent,
        description: '',
      };
    } else if (currentExp) {
      if (!currentExp.company && !line.startsWith('•') && !line.startsWith('-') && line.length < 60) {
        currentExp.company = line.trim();
      } else {
        // Append to description bullet points
        const bullet = line.startsWith('•') || line.startsWith('-') ? line : `• ${line}`;
        currentExp.description = currentExp.description ? `${currentExp.description}\n${bullet}` : bullet;
      }
    }
  }

  if (currentExp && (currentExp.title || currentExp.company)) {
    experienceEntries.push(currentExp);
  }

  return experienceEntries;
}

/**
 * Parse key projects section
 */
function parseProjects(lines) {
  if (!lines || lines.length === 0) return [];

  const projects = [];
  let currentProj = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

    if (!isBullet && line.length < 70 && !line.endsWith('.')) {
      if (currentProj && currentProj.title) {
        projects.push(currentProj);
      }

      // Check for link in title line
      const urlMatch = line.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s]+|(?:https?:\/\/[^\s]+)/i);

      currentProj = {
        title: line.replace(/•|\([^\)]*\)/g, '').trim(),
        description: '',
        technologies: [],
        link: urlMatch ? urlMatch[0] : '',
      };

      // Extract tech stack or subtitle if formatted e.g. "Project Name | React, Node.js" or "Project Name - Subtitle"
      if (line.includes('|') || line.includes('–') || line.includes(' - ') || line.includes(':')) {
        const parts = line.split(/\s*(?:[-–|:]| - )\s*/);
        if (parts.length > 1) {
          currentProj.title = parts[0].trim();
          const extracted = extractSkillsFromText(parts[1]);
          if (extracted.length > 0) {
            currentProj.technologies = extracted;
          } else if (parts[1].trim()) {
            currentProj.description = parts[1].trim();
          }
        }
      }
    } else if (currentProj) {
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      currentProj.description = currentProj.description
        ? `${currentProj.description}\n• ${cleanLine}`
        : `• ${cleanLine}`;

      // Detect any mentioned technologies
      const techInDesc = extractSkillsFromText(line);
      techInDesc.forEach((t) => {
        if (!currentProj.technologies.includes(t)) {
          currentProj.technologies.push(t);
        }
      });
    }
  }

  if (currentProj && currentProj.title) {
    projects.push(currentProj);
  }

  return projects;
}

/**
 * Parse certifications section
 */
function parseCertifications(lines) {
  if (!lines || lines.length === 0) return [];

  const certs = [];
  for (const line of lines) {
    const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
    if (cleanLine.length < 4) continue;

    const yearMatch = cleanLine.match(/\b(19\d{2}|20\d{2})\b/);
    const urlMatch = cleanLine.match(/(?:https?:\/\/[^\s]+)/);

    // Check if issuer is mentioned e.g. "AWS Certified Solutions Architect – Amazon Web Services"
    const parts = cleanLine.split(/[-–|by:]/);
    const name = parts[0].trim();
    const issuer = parts.length > 1 ? parts[1].replace(/\b(19\d{2}|20\d{2})\b/, '').trim() : '';

    certs.push({
      name,
      issuer,
      date: yearMatch ? yearMatch[0] : '',
      link: urlMatch ? urlMatch[0] : '',
    });
  }

  return certs;
}

/**
 * Parse achievements section
 */
function parseAchievements(lines) {
  if (!lines || lines.length === 0) return [];

  const achievements = [];
  for (const line of lines) {
    const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
    if (cleanLine.length > 10) {
      achievements.push(cleanLine);
    }
  }
  return achievements;
}

/**
 * Main parser entry point
 * Accepts raw extracted text and converts into structured Resume object
 */
function parseResumeText(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 25) {
    throw new Error(
      'The uploaded document does not contain readable text. If this is a scanned image or photo PDF, please upload a text-based document or enter details manually.'
    );
  }

  const sections = segmentSections(rawText);
  const personalInfo = extractPersonalInfo(sections.header, rawText);
  const summary = sections.summary.join(' ').trim();
  const skills = extractAndCategorizeSkills(sections.skills, rawText);
  const education = parseEducation(sections.education);
  const experience = parseExperience(sections.experience);
  const projects = parseProjects(sections.projects);
  const certifications = parseCertifications(sections.certifications);
  const achievements = parseAchievements(sections.achievements);

  // Derive an appropriate title and target role
  let targetRole = '';
  if (experience.length > 0 && experience[0].title) {
    targetRole = experience[0].title;
  } else if (skills.languages.length > 0 || skills.frameworks.length > 0) {
    targetRole = 'Software Engineer';
  }

  const title = personalInfo.fullName
    ? `${personalInfo.fullName}'s Imported Resume`
    : 'Imported Resume';

  return {
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
    meta: {
      rawTextLength: rawText.length,
      extractedSections: Object.keys(sections).filter((k) => sections[k].length > 0),
    },
  };
}

module.exports = {
  parseResumeText,
};
