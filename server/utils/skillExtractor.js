/**
 * Predefined Skill Dictionary and Learning Resource Map
 * Supports keyword extraction from pasted job descriptions,
 * skill normalization, frequency ranking, and resource recommendation.
 */

const SKILL_DICTIONARY = [
  // Programming Languages
  { canonical: 'Python', aliases: ['python', 'py', 'python3'] },
  { canonical: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { canonical: 'TypeScript', aliases: ['typescript', 'ts'] },
  { canonical: 'Java', aliases: ['java', 'core java'] },
  { canonical: 'C++', aliases: ['c++', 'cpp'] },
  { canonical: 'C#', aliases: ['c#', 'csharp', '.net'] },
  { canonical: 'SQL', aliases: ['sql', 'structured query language', 'sqlite'] },
  { canonical: 'HTML', aliases: ['html', 'html5'] },
  { canonical: 'CSS', aliases: ['css', 'css3', 'scss', 'sass'] },

  // Frameworks & Libraries
  { canonical: 'React.js', aliases: ['react', 'react.js', 'reactjs'] },
  { canonical: 'Node.js', aliases: ['node', 'node.js', 'nodejs'] },
  { canonical: 'Express.js', aliases: ['express', 'express.js', 'expressjs'] },
  { canonical: 'Next.js', aliases: ['next.js', 'nextjs', 'next'] },
  { canonical: 'Angular', aliases: ['angular', 'angularjs'] },
  { canonical: 'Vue.js', aliases: ['vue', 'vue.js', 'vuejs'] },
  { canonical: 'Django', aliases: ['django'] },
  { canonical: 'Flask', aliases: ['flask'] },
  { canonical: 'Spring Boot', aliases: ['spring', 'spring boot', 'springboot'] },
  { canonical: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'] },

  // Databases & Cloud
  { canonical: 'MongoDB', aliases: ['mongodb', 'mongo'] },
  { canonical: 'PostgreSQL', aliases: ['postgresql', 'postgres'] },
  { canonical: 'MySQL', aliases: ['mysql'] },
  { canonical: 'Redis', aliases: ['redis'] },
  { canonical: 'AWS', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
  { canonical: 'Azure', aliases: ['azure', 'microsoft azure'] },
  { canonical: 'Google Cloud (GCP)', aliases: ['gcp', 'google cloud'] },
  { canonical: 'Docker', aliases: ['docker', 'containerization'] },
  { canonical: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
  { canonical: 'Git', aliases: ['git', 'github', 'version control', 'gitlab'] },
  { canonical: 'CI/CD', aliases: ['ci/cd', 'ci cd', 'jenkins', 'github actions'] },
  { canonical: 'Linux', aliases: ['linux', 'unix', 'bash', 'shell scripting'] },

  // Data & Analytics
  { canonical: 'Excel', aliases: ['excel', 'ms excel', 'microsoft excel', 'spreadsheets'] },
  { canonical: 'Power BI', aliases: ['power bi', 'powerbi', 'ms power bi'] },
  { canonical: 'Tableau', aliases: ['tableau'] },
  { canonical: 'Machine Learning', aliases: ['machine learning', 'ml', 'scikit-learn', 'sklearn'] },
  { canonical: 'Deep Learning', aliases: ['deep learning', 'tensorflow', 'pytorch', 'keras', 'neural networks'] },
  { canonical: 'Data Analysis', aliases: ['data analysis', 'data analytics', 'eda'] },
  { canonical: 'Pandas', aliases: ['pandas'] },
  { canonical: 'NumPy', aliases: ['numpy'] },

  // Tools & Design
  { canonical: 'REST API', aliases: ['rest', 'rest api', 'restful', 'apis'] },
  { canonical: 'GraphQL', aliases: ['graphql'] },
  { canonical: 'Figma', aliases: ['figma', 'ui/ux', 'wireframing'] },
  { canonical: 'Postman', aliases: ['postman', 'api testing'] },

  // Soft & Professional Skills
  { canonical: 'Communication', aliases: ['communication', 'verbal communication', 'written communication', 'presentation'] },
  { canonical: 'Problem Solving', aliases: ['problem solving', 'dsa', 'data structures', 'algorithms', 'analytical thinking'] },
  { canonical: 'Teamwork', aliases: ['teamwork', 'collaboration'] },
  { canonical: 'Agile', aliases: ['agile', 'scrum', 'jira', 'sprints'] }
];

const LEARNING_RESOURCES = {
  'SQL': {
    title: 'SQLBolt — Interactive Lessons',
    url: 'https://sqlbolt.com/',
    type: 'Interactive Tutorials',
    description: 'Learn SQL with interactive exercises in your browser, covering queries, filtering, joins, and aggregations.',
  },
  'Power BI': {
    title: 'Microsoft Learn — Power BI Data Analyst',
    url: 'https://learn.microsoft.com/training/powerplatform/power-bi/',
    type: 'Official Documentation & Labs',
    description: 'Official Microsoft learning paths for data modeling, DAX, visualizations, and report publishing.',
  },
  'Python': {
    title: 'W3Schools — Python Tutorial',
    url: 'https://www.w3schools.com/python/',
    type: 'Guided Tutorial',
    description: 'Beginner-friendly step-by-step Python syntax, data structures, functions, and standard libraries.',
  },
  'Excel': {
    title: 'Excel Easy — Tutorials & Formulas',
    url: 'https://www.excel-easy.com/',
    type: 'Practical Guides',
    description: 'Hands-on guide covering functions, VLOOKUP/XLOOKUP, Pivot Tables, and dashboard creation.',
  },
  'JavaScript': {
    title: 'JavaScript.info — The Modern JavaScript Tutorial',
    url: 'https://javascript.info/',
    type: 'Comprehensive Guide',
    description: 'From basics to advanced topics including closures, promises, async/await, and DOM manipulation.',
  },
  'React.js': {
    title: 'React Official Documentation & Quick Start',
    url: 'https://react.dev/learn',
    type: 'Official Documentation',
    description: 'Learn component architecture, hooks, state management, and best practices directly from the React team.',
  },
  'TypeScript': {
    title: 'TypeScript for JavaScript Programmers',
    url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',
    type: 'Official Handbook',
    description: 'Understand static types, interfaces, generics, and compiler configurations.',
  },
  'Java': {
    title: 'W3Schools — Java Tutorial',
    url: 'https://www.w3schools.com/java/',
    type: 'Guided Tutorial',
    description: 'Learn Java syntax, Object-Oriented Programming (OOP), collections, and basic multithreading.',
  },
  'C++': {
    title: 'LearnCpp — Free Tutorial Site',
    url: 'https://www.learncpp.com/',
    type: 'In-depth Tutorial',
    description: 'Comprehensive tutorials covering modern C++, pointers, memory management, and STL.',
  },
  'Node.js': {
    title: 'Node.js Official Learn Track',
    url: 'https://nodejs.org/en/learn',
    type: 'Official Guides',
    description: 'Understand asynchronous I/O, event loops, NPM package ecosystem, and server creation.',
  },
  'Express.js': {
    title: 'Express.js Getting Started Guide',
    url: 'https://expressjs.com/en/starter/installing.html',
    type: 'Official Documentation',
    description: 'Learn routing, middleware composition, request/response handling, and RESTful design.',
  },
  'MongoDB': {
    title: 'MongoDB University — Free Courses',
    url: 'https://learn.mongodb.com/',
    type: 'Official Video Courses & Labs',
    description: 'Hands-on courses covering document schema design, aggregation pipelines, indexing, and Mongoose.',
  },
  'Git': {
    title: 'Learn Git Branching — Visual Interactive Game',
    url: 'https://learngitbranching.js.org/',
    type: 'Interactive Simulator',
    description: 'Master branches, merges, rebases, cherry-picks, and collaborative workflows visually.',
  },
  'Docker': {
    title: 'Docker Get Started Guide',
    url: 'https://docs.docker.com/get-started/',
    type: 'Official Documentation',
    description: 'Build container images, run multi-container applications with Docker Compose, and debug containers.',
  },
  'AWS': {
    title: 'AWS Skill Builder — Free Tier Learning',
    url: 'https://explore.skillbuilder.aws/',
    type: 'Official Training',
    description: 'Foundational learning for EC2, S3, IAM, serverless architectures, and AWS Cloud Practitioner exam prep.',
  },
  'Machine Learning': {
    title: 'Google Machine Learning Crash Course',
    url: 'https://developers.google.com/machine-learning/crash-course',
    type: 'Free Course by Google',
    description: 'Fast-paced, practical introduction to ML concepts, loss functions, regression, classification, and neural nets.',
  },
  'Tableau': {
    title: 'Tableau Free Training Videos',
    url: 'https://www.tableau.com/learn/training',
    type: 'Official Video Tutorials',
    description: 'Official video guides for creating interactive dashboards, charts, calculated fields, and publishing reports.',
  },
  'Communication': {
    title: 'Toastmasters Public Speaking & Communication Tips',
    url: 'https://www.toastmasters.org/resources/public-speaking-tips',
    type: 'Guides & Best Practices',
    description: 'Practical tips for structured answers (STAR method), presentations, and active listening in interviews.',
  },
  'Problem Solving': {
    title: 'LeetCode Study Plan — Top Interview 150',
    url: 'https://leetcode.com/studyplan/top-interview-150/',
    type: 'Practice Problems',
    description: 'Curated list of the most frequent coding interview problems covering arrays, two-pointers, trees, and dynamic programming.',
  },
  'REST API': {
    title: 'RESTful API Design — Best Practices by MDN',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Web_frameworks',
    type: 'Web Standards Guide',
    description: 'Understand HTTP verbs, status codes, payload formatting, idempotency, and clean RESTful URI architectures.',
  },
  'HTML': {
    title: 'MDN Web Docs — HTML: Structuring the Web',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML',
    type: 'Official Documentation & Guides',
    description: 'Master HTML elements, semantic structure, accessibility, and modern web standards.',
  },
  'CSS': {
    title: 'MDN Web Docs — Learn to Style with CSS',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS',
    type: 'Official Documentation & Guides',
    description: 'Comprehensive guides covering CSS Flexbox, Grid, responsive design, animations, and typography.',
  },
  'Tailwind CSS': {
    title: 'Tailwind CSS Documentation & Fundamentals',
    url: 'https://tailwindcss.com/docs',
    type: 'Official Documentation',
    description: 'Utility-first CSS framework for rapidly building modern, responsive user interfaces.',
  },
  'PostgreSQL': {
    title: 'PostgreSQL Tutorial — Learn PostgreSQL Fast',
    url: 'https://www.postgresqltutorial.com/',
    type: 'Tutorial & Practical Guides',
    description: 'Practical guides covering PostgreSQL queries, indexing, joins, transactions, and schema management.',
  },
  'MySQL': {
    title: 'MySQL Tutorial — Developer Guides',
    url: 'https://dev.mysql.com/doc/refman/8.0/en/tutorial.html',
    type: 'Official Documentation',
    description: 'Official MySQL tutorial covering database creation, querying, indexing, and administration.',
  },
  'Redis': {
    title: 'Redis University — In-Memory Data Structures',
    url: 'https://redis.io/learn',
    type: 'Official Learning Portal',
    description: 'Learn fast in-memory key-value caching, pub/sub messaging, and session storage with Redis.',
  },
  'Kubernetes': {
    title: 'Kubernetes Official Tutorials',
    url: 'https://kubernetes.io/docs/tutorials/',
    type: 'Official Interactive Tutorials',
    description: 'Learn container orchestration, pods, deployments, scaling, and cluster management with Kubernetes.',
  },
  'Linux': {
    title: 'Linux Journey — Free Linux Learning',
    url: 'https://linuxjourney.com/',
    type: 'Interactive Guide',
    description: 'Learn command line fundamentals, file permissions, shell scripting, and package management.',
  },
  'Pandas': {
    title: '10 Minutes to Pandas — Official Quickstart',
    url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
    type: 'Official Documentation',
    description: 'Hands-on guide to DataFrame manipulation, filtering, aggregation, and time series in Python.',
  },
  'NumPy': {
    title: 'NumPy Quickstart Guide',
    url: 'https://numpy.org/doc/stable/user/quickstart.html',
    type: 'Official Documentation',
    description: 'Multidimensional array computing, vectorization, linear algebra, and data slicing.',
  },
  'GraphQL': {
    title: 'GraphQL Official Introduction & Best Practices',
    url: 'https://graphql.org/learn/',
    type: 'Official Guide',
    description: 'Learn schemas, resolvers, queries, mutations, and building client-driven APIs with GraphQL.',
  },
  'Figma': {
    title: 'Figma Community & Design Tutorials',
    url: 'https://help.figma.com/hc/en-us/categories/360002051613-Get-started',
    type: 'Official Design Guides',
    description: 'Create responsive UI layouts, component systems, interactive prototypes, and wireframes in Figma.',
  },
  'Postman': {
    title: 'Postman Learning Center — API Testing Fundamentals',
    url: 'https://learning.postman.com/docs/getting-started/overview/',
    type: 'Official Guides & Workspaces',
    description: 'Test API endpoints, write automated assertion scripts, and manage environment variables.',
  },
  'Agile': {
    title: 'Atlassian Agile Coach — Scrum & Kanban Guides',
    url: 'https://www.atlassian.com/agile',
    type: 'Industry Standard Guide',
    description: 'Practical guides to sprint planning, user stories, retrospectives, and agile methodologies.',
  },
  'Teamwork': {
    title: 'Coursera Articles — Developing Effective Teamwork Skills',
    url: 'https://www.coursera.org/articles/teamwork-skills',
    type: 'Professional Development Article',
    description: 'Strategies for cross-functional collaboration, constructive feedback, and productive team dynamics.',
  },
};

const ROLE_SUGGESTIONS = {
  frontend: [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React.js', 'Tailwind CSS', 'Git', 'REST API'
  ],
  backend: [
    'Python', 'Java', 'Node.js', 'Express.js', 'SQL', 'MongoDB', 'PostgreSQL', 'REST API', 'Docker', 'Git'
  ],
  fullstack: [
    'JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Express.js', 'SQL', 'MongoDB', 'HTML', 'CSS', 'Git', 'REST API'
  ],
  data: [
    'Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'Data Analysis', 'Pandas', 'NumPy', 'Communication'
  ],
  cloud: [
    'AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Python', 'Git'
  ],
  default: [
    'Python', 'SQL', 'Git', 'Problem Solving', 'Communication', 'REST API'
  ],
};

/**
 * Returns role-based suggested skills when the user has not yet saved analyzable job descriptions.
 * Clearly identified as general recommendations, without fabricated market counts or fake statistics.
 */
function getSuggestedRoleSkills(targetRole, userSkillsSet = new Set()) {
  if (!targetRole || typeof targetRole !== 'string') return [];

  const lower = targetRole.toLowerCase();
  let skillNames = ROLE_SUGGESTIONS.default;

  if (lower.includes('front') || lower.includes('web') || lower.includes('ui')) {
    skillNames = ROLE_SUGGESTIONS.frontend;
  } else if (lower.includes('back') || lower.includes('server') || lower.includes('api')) {
    skillNames = ROLE_SUGGESTIONS.backend;
  } else if (lower.includes('full') || lower.includes('stack')) {
    skillNames = ROLE_SUGGESTIONS.fullstack;
  } else if (
    lower.includes('data') ||
    lower.includes('analytics') ||
    lower.includes('analyst') ||
    lower.includes('business intel') ||
    lower.includes('bi')
  ) {
    skillNames = ROLE_SUGGESTIONS.data;
  } else if (lower.includes('cloud') || lower.includes('devops') || lower.includes('infra')) {
    skillNames = ROLE_SUGGESTIONS.cloud;
  }

  return skillNames.map((name) => {
    const canonical = normalizeSkill(name);
    const inProfile = userSkillsSet.has(canonical.toLowerCase());
    const resource = getLearningResource(canonical);
    return {
      skill: canonical,
      inProfile,
      resource,
    };
  });
}

/**
 * Normalizes an input skill string to its canonical dictionary form if matched,
 * otherwise returns a trimmed, capitalized version.
 */
function normalizeSkill(rawSkill) {
  if (!rawSkill || typeof rawSkill !== 'string') return '';
  const cleaned = rawSkill.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';

  const lower = cleaned.toLowerCase();
  for (const entry of SKILL_DICTIONARY) {
    if (entry.canonical.toLowerCase() === lower) {
      return entry.canonical;
    }
    if (entry.aliases.some((alias) => alias.toLowerCase() === lower)) {
      return entry.canonical;
    }
  }

  // Capitalize first letter of each word if not in dictionary
  return cleaned
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Extracts skills from raw text (such as a pasted Job Description)
 * using keyword matching against the predefined dictionary.
 */
function extractSkillsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const lowerText = ` ${text.toLowerCase().replace(/[^a-z0-9#+.]/g, ' ')} `;
  const matched = new Set();

  for (const entry of SKILL_DICTIONARY) {
    for (const alias of entry.aliases) {
      // Use boundary matching
      const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-z0-9#+.])${escapedAlias}(?:$|[^a-z0-9#+.])`, 'i');
      if (regex.test(lowerText)) {
        matched.add(entry.canonical);
        break;
      }
    }
  }

  return Array.from(matched);
}

/**
 * Resolves learning resource for a skill name.
 * Falls back to a reliable general search recommendation if not in mapping.
 */
function getLearningResource(skillName) {
  const normalized = normalizeSkill(skillName);
  if (LEARNING_RESOURCES[normalized]) {
    return {
      skill: normalized,
      ...LEARNING_RESOURCES[normalized],
      isGeneral: false,
    };
  }

  // Fallback to trusted general learning resource
  const encoded = encodeURIComponent(normalized);
  return {
    skill: normalized,
    title: `Learn ${normalized} — freeCodeCamp & Guides`,
    url: `https://www.freecodecamp.org/news/search/?query=${encoded}`,
    type: 'Curated Search & Guides',
    description: `Explore beginner-to-advanced learning materials, articles, and practical walkthroughs for ${normalized}.`,
    isGeneral: true,
  };
}

module.exports = {
  SKILL_DICTIONARY,
  LEARNING_RESOURCES,
  normalizeSkill,
  extractSkillsFromText,
  getLearningResource,
  getSuggestedRoleSkills,
};
