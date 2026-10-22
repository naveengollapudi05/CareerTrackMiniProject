<<<<<<< HEAD
# CareerTrack — Smart Student Job & Internship Management System

A full-stack **MERN (MongoDB, Express, React, Node.js)** web application engineered for college students and job seekers to manage the complete lifecycle of job and internship applications, schedule interview rounds, generate professional resumes, track deadlines, and identify real skill gaps based on employer job postings.

---

## 🚀 Key Features

1. **JWT Authentication & Profile System**:
   - Secure registration, login, and bcrypt password hashing.
   - User profile with college, degree, graduation year, target role, and editable skill inventory.
   - Strict user data isolation across all database operations.

2. **Full Application Management (CRUD)**:
   - Log applications with company, role, work mode (Remote/Hybrid/On-site), type (Internship/Full-Time), application date, URL, and notes.
   - Track application statuses: `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.
   - **Status Change History**: Automatic chronological audit trail tracking each stage transition with dates and notes.
   - Search by company/role/location, filter by status, and sort by date or company name.

3. **Top-Demanded-Skills Analysis**:
   - Keyword extraction engine that scans pasted job descriptions against a predefined canonical dictionary.
   - Normalizes variations (e.g. `sql` -> `SQL`, `reactjs` -> `React.js`, `powerbi` -> `Power BI`).
   - Counts distinct saved job descriptions containing each skill (counted at most once per application).
   - Horizontal bar charts and rankings with an interactive modal showing contributing applications.

4. **Skill-Gap Analysis & Learning Recommendations**:
   - Compares the student's existing profile skills against employer requirements.
   - Flags missing skills ranked by employer demand priority (`High`, `Medium`, `Low`).
   - Maps each missing skill to curated, high-quality learning resources (SQLBolt, Microsoft Learn, W3Schools, etc.).
   - Tracks learning status (`Not Started`, `Learning`, `Completed`) with a one-click button to confirm and add the skill directly to the user profile.

5. **Interview Scheduling**:
   - Schedule rounds (Technical, Coding, HR, System Design).
   - Store scheduled dates, meeting links (Google Meet, Zoom, MS Teams), and interview preparation notes.
   - One-click "Join Meeting" action for quick access.

6. **Resume Builder & Multi-Resume Management**:
   - Structured builder for Personal Info, Professional Summary, Technical Skills, Projects, Experience, Education, Certifications, and Achievements.
   - Real-time side-by-side formatted resume preview.
   - Save multiple tailored resumes to MongoDB and associate specific resumes with individual job applications.
   - Client-side ATS-friendly PDF download and print export.

7. **Task & Deadline Reminders**:
   - Categorized into `Upcoming`, `Due Today`, `Overdue`, and `Completed`.
   - Associate reminders with specific applications or interviews.
   - Interactive checkbox toggle to mark tasks complete.

8. **Settings & Data Export**:
   - Manage user profile and skill chips.
   - Change password with current-password verification.
   - Offline CSV export of all application records.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (JavaScript, Vite)
- **Styling**: Tailwind CSS with professional dark navy (`#0F172A`) and indigo/purple accents
- **Icons**: Lucide React
- **Charts**: Recharts (Pie/Donut charts, Horizontal Bar charts)
- **Backend**: Node.js & Express.js
- **Database**: MongoDB Atlas using Mongoose ODM (with embedded in-memory database fallback for zero-setup local dev/testing)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing
- **PDF Export**: html2pdf.js / native browser print engine

---

## 📂 Project Structure

```text
CareerTrack Mini Project/
├── client/                     # Frontend React (Vite) application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components & modals
│   │   │   ├── ApplicationModal.jsx
│   │   │   ├── ContributingAppsModal.jsx
│   │   │   ├── InterviewModal.jsx
│   │   │   ├── ReminderModal.jsx
│   │   │   ├── ResumePreview.jsx
│   │   │   ├── SkillGapModal.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/            # AuthContext & global state
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/            # Sidebar, Navbar & AppLayout
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/              # 8 Core Sidebar Pages + Auth
│   │   │   ├── Home.jsx           # 1. Home
│   │   │   ├── Dashboard.jsx      # 2. Dashboard
│   │   │   ├── Interviews.jsx     # 3. Interviews
│   │   │   ├── Applications.jsx   # 4. Applications
│   │   │   ├── ResumeBuilder.jsx  # 5. Resume Builder
│   │   │   ├── Resumes.jsx        # 6. Resumes
│   │   │   ├── Reminders.jsx      # 7. Reminders
│   │   │   ├── Settings.jsx       # 8. Settings
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/           # API fetch wrapper
│   │   │   └── api.js
│   │   ├── App.jsx             # React Router config
│   │   ├── index.css           # Tailwind base styles
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend Node / Express API
│   ├── config/
│   │   └── db.js               # MongoDB connection logic
│   ├── controllers/            # Route controllers
│   │   ├── analyticsController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── interviewController.js
│   │   ├── learningController.js
│   │   ├── profileController.js
│   │   ├── reminderController.js
│   │   └── resumeController.js
│   ├── middleware/             # Auth & Error handling
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/                 # Mongoose Data Models
│   │   ├── Application.js
│   │   ├── Interview.js
│   │   ├── LearningProgress.js
│   │   ├── Reminder.js
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/                 # Express REST Endpoints
│   │   ├── analyticsRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── learningRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── reminderRoutes.js
│   │   └── resumeRoutes.js
│   ├── tests/                  # Integration test suite
│   │   └── api.test.js
│   ├── utils/                  # Skill dictionary & normalization
│   │   └── skillExtractor.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
├── package.json                # Root workflow scripts
└── README.md
```

---

## ⚙️ How to Configure MongoDB Atlas

1. **Create an Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. **Build a Free Database**:
   - Choose the free **M0 Sandbox** cluster.
   - Select your preferred cloud provider and closest region.
3. **Configure Database Access (Username & Password)**:
   - In Atlas, go to **Database Access** -> **Add New Database User**.
   - Select **Password Authentication**. Set a username (e.g., `careertrack_admin`) and a secure password.
   - Give the user the **Read and write to any database** privilege.
4. **Configure Network Access (IP Whitelist)**:
   - In Atlas, go to **Network Access** -> **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) or enter your current IP.
5. **Get Your Connection String**:
   - Click **Database** -> **Connect** -> **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/careertrack?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
6. **Set Environment Variable**:
   - Open `server/.env` and paste your URI:
     ```env
     MONGODB_URI=mongodb+srv://careertrack_admin:YourPassword123@cluster0.abcde.mongodb.net/careertrack?retryWrites=true&w=majority
     ```
   *(Note: If `MONGODB_URI` is left blank during local development or offline grading, the server automatically starts an embedded in-memory MongoDB database so you can test immediately without any errors!)*

---

## 🏃 Quick Start Commands

### 1. Run the Backend Server
In the root directory or inside `server/`:
```bash
cd server
npm start
```
The server will start on port `5000`:
- Health check: `http://localhost:5000/api/health`

### 2. Run the Frontend Client
In a new terminal window:
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`. Open this URL in your web browser.

### 3. Run the Backend Automated Test Suite
To verify database connections, authentication, data isolation, and skill extraction:
```bash
cd server
npm test
```
*(All 30 automated integration tests will execute and report passing status!)*

---

## 🎓 College Mini-Project Presentation Points

- **Real Database Integration**: Not mock data or static UI. Every metric, application status, skill frequency, and interview reminder updates dynamically from MongoDB.
- **Data Security**: Strict user-level authorization checks on every Express route prevent students from accessing other users' records.
- **Placement Relevance**: Solves a real problem college students face when tracking 50+ off-campus and on-campus placement drives across spreadsheets.
- **Skill Gap Roadmap**: Links employer requirements to tangible learning links (e.g. LeetCode, SQLBolt, Microsoft Learn, freeCodeCamp) with student progress tracking.
=======
# CareerTrack
>>>>>>> 9cc225c1c52082a7bbf581584ce2fa75a8cc240a
#   C a r e e r T r a c k M i n i P r o j e c t 
 
 
