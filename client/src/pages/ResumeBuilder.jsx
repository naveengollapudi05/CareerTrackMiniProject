import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Download,
  Eye,
  Plus,
  Trash2,
  FileEdit,
  GraduationCap,
  Briefcase,
  Code,
  FolderGit2,
  Award,
  Sparkles,
  Loader2,
  FileUp,
  CheckCircle2,
  Copy,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ResumePreview from '../components/ResumePreview';

export default function ResumeBuilder() {
  const { user, showToast } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('id');
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'preview'
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccessInfo, setImportSuccessInfo] = useState(null);

  const [resumeData, setResumeData] = useState({
    title: user?.profile?.targetRole ? `${user.profile.targetRole} Resume` : 'My Resume',
    targetRole: user?.profile?.targetRole || '',
    personalInfo: {
      fullName: user?.profile?.fullName || user?.username || '',
      email: user?.email || '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    summary: user?.profile?.bio || '',
    education: [
      {
        degree: user?.profile?.degree || '',
        institution: user?.profile?.college || '',
        location: '',
        startDate: '',
        endDate: user?.profile?.gradYear || '',
        grade: user?.profile?.cgpa || '',
        details: '',
      },
    ],
    skills: {
      languages: user?.profile?.skills || [],
      frameworks: [],
      tools: [],
      softSkills: [],
    },
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
  });

  // Pre-fill user profile details if creating fresh
  useEffect(() => {
    if (!editId && user) {
      setResumeData((prev) => ({
        ...prev,
        title: prev.title === 'My Resume' && user.profile?.targetRole ? `${user.profile.targetRole} Resume` : prev.title,
        targetRole: prev.targetRole || user.profile?.targetRole || '',
        personalInfo: {
          ...prev.personalInfo,
          fullName: prev.personalInfo.fullName || user.profile?.fullName || user.username || '',
          email: prev.personalInfo.email || user.email || '',
        },
        summary: prev.summary || user.profile?.bio || '',
        education: prev.education.length > 0 && !prev.education[0].institution && user.profile?.college
          ? [
              {
                degree: user.profile?.degree || '',
                institution: user.profile?.college || '',
                location: '',
                startDate: '',
                endDate: user.profile?.gradYear || '',
                grade: user.profile?.cgpa || '',
                details: '',
              },
            ]
          : prev.education,
        skills: {
          ...prev.skills,
          languages: prev.skills.languages?.length > 0 ? prev.skills.languages : (user.profile?.skills || []),
        },
      }));
    }
  }, [user, editId]);

  // Load existing resume if editing
  useEffect(() => {
    const loadResume = async () => {
      if (!editId) return;
      try {
        const res = await api.getResumeById(editId);
        if (res.success && res.data) {
          setResumeData(res.data);
        }
      } catch (err) {
        showToast('Failed to load resume for editing', 'error');
      }
    };
    loadResume();
  }, [editId]);

  // Handlers for nested sections
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value },
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...prev.education];
      updated[index][field] = value;
      return { ...prev, education: updated };
    });
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institution: '', location: '', startDate: '', endDate: '', grade: '' },
      ],
    }));
  };

  const removeEducation = (index) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...prev.experience];
      updated[index][field] = value;
      return { ...prev, experience: updated };
    });
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' },
      ],
    }));
  };

  const removeExperience = (index) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleProjectChange = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...prev.projects];
      if (field === 'technologies') {
        updated[index][field] = value.split(',').map((s) => s.trim()).filter(Boolean);
      } else {
        updated[index][field] = value;
      }
      return { ...prev, projects: updated };
    });
  };

  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', technologies: [], link: '' }],
    }));
  };

  const removeProject = (index) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const handleSkillsListChange = (category, commaString) => {
    const list = commaString.split(',').map((s) => s.trim()).filter(Boolean);
    setResumeData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [category]: list },
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...(prev.certifications || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const addCertification = () => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        { name: '', issuer: '', date: '', link: '' },
      ],
    }));
  };

  const removeCertification = (index) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index),
    }));
  };

  const handleAchievementChange = (index, value) => {
    setResumeData((prev) => {
      const updated = [...(prev.achievements || [])];
      updated[index] = value;
      return { ...prev, achievements: updated };
    });
  };

  const addAchievement = () => {
    setResumeData((prev) => ({
      ...prev,
      achievements: [...(prev.achievements || []), ''],
    }));
  };

  const removeAchievement = (index) => {
    setResumeData((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!resumeData.title.trim()) {
      showToast('Please give your resume a title.', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editId) {
        await api.updateResume(editId, resumeData);
        showToast('Resume updated successfully!', 'success');
      } else {
        const res = await api.createResume(resumeData);
        showToast('Resume saved successfully!', 'success');
        navigate(`/resumes`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsNew = async () => {
    if (!resumeData.title.trim()) {
      showToast('Please give your resume a title.', 'error');
      return;
    }

    try {
      setSaving(true);
      const copyTitle = resumeData.title.includes('(Copy)')
        ? resumeData.title
        : `${resumeData.title} (Copy)`;
      await api.createResume({
        ...resumeData,
        title: copyTitle,
      });
      showToast('Resume saved as a new copy!', 'success');
      navigate('/resumes');
    } catch (err) {
      showToast(err.message || 'Failed to save copy of resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImportButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting the same file triggers onChange
    e.target.value = '';

    // Validate size <= 5 MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      showToast(
        `File size exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller resume file.`,
        'error'
      );
      return;
    }

    // Validate format
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      showToast(
        'Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).',
        'error'
      );
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.parseResumeFile(formData);

      if (res.success && res.data) {
        const parsed = res.data;

        setResumeData({
          title: parsed.title || resumeData.title || 'Imported Resume',
          targetRole: parsed.targetRole || resumeData.targetRole || '',
          personalInfo: {
            fullName: parsed.personalInfo?.fullName || resumeData.personalInfo?.fullName || '',
            email: parsed.personalInfo?.email || resumeData.personalInfo?.email || '',
            phone: parsed.personalInfo?.phone || resumeData.personalInfo?.phone || '',
            location: parsed.personalInfo?.location || resumeData.personalInfo?.location || '',
            linkedin: parsed.personalInfo?.linkedin || resumeData.personalInfo?.linkedin || '',
            github: parsed.personalInfo?.github || resumeData.personalInfo?.github || '',
            portfolio: parsed.personalInfo?.portfolio || resumeData.personalInfo?.portfolio || '',
          },
          summary: parsed.summary || resumeData.summary || '',
          education:
            parsed.education && parsed.education.length > 0
              ? parsed.education
              : resumeData.education,
          skills: {
            languages: parsed.skills?.languages || [],
            frameworks: parsed.skills?.frameworks || [],
            tools: parsed.skills?.tools || [],
            softSkills: parsed.skills?.softSkills || [],
          },
          experience: parsed.experience || [],
          projects: parsed.projects || [],
          certifications: parsed.certifications || [],
          achievements: parsed.achievements || [],
        });

        setActiveTab('editor');
        setImportSuccessInfo({
          fileName: file.name,
          sectionsCount: parsed.meta?.extractedSections?.length || 0,
        });

        showToast(
          `Resume imported successfully from "${file.name}"! Please review, edit, and click Save Resume.`,
          'success'
        );
      } else {
        throw new Error(res.message || 'Failed to extract resume data.');
      }
    } catch (err) {
      showToast(
        err.message ||
          'Failed to extract resume. If this is a scanned image or photo PDF, please use a text-based document or enter details manually.',
        'error'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Use client-side html2pdf or fallback to window.print()
      const element = document.getElementById('resume-printable-area');
      if (!element) {
        window.print();
        return;
      }

      // Check if html2pdf is available
      if (window.html2pdf) {
        const opt = {
          margin: 10,
          filename: `${resumeData.title.replace(/\s+/g, '_')}_Resume.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        await window.html2pdf().from(element).set(opt).save();
        showToast('PDF downloaded successfully!', 'success');
      } else {
        // High quality fallback: native browser print dialog
        window.print();
      }
    } catch (err) {
      console.warn('PDF library error, falling back to print dialog:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={resumeData.title}
              onChange={(e) => setResumeData((p) => ({ ...p, title: e.target.value }))}
              className="text-lg sm:text-xl font-extrabold text-navy-800 bg-transparent border-b border-dashed border-slate-300 focus:border-primary-600 focus:outline-none"
              placeholder="Enter resume title"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Targeting:{' '}
            <input
              type="text"
              value={resumeData.targetRole}
              onChange={(e) => setResumeData((p) => ({ ...p, targetRole: e.target.value }))}
              className="text-xs font-semibold text-primary-600 bg-transparent border-b border-slate-200 focus:outline-none"
              placeholder="Enter target role"
            />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Tab Toggle */}
          <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                activeTab === 'editor' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Form
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                activeTab === 'preview' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Hidden File Input for Resume Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          {/* Import Existing Resume Button */}
          <button
            type="button"
            onClick={handleImportButtonClick}
            disabled={importing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-primary-200 bg-primary-50/80 hover:bg-primary-100 text-primary-700 font-bold text-xs sm:text-sm shadow-2xs transition disabled:opacity-60"
            title="Upload and extract text from an existing PDF or Word resume"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
            ) : (
              <FileUp className="w-4 h-4 text-primary-600" />
            )}
            <span>{importing ? 'Extracting...' : 'Import Existing Resume'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export PDF</span>
          </button>

          {editId && (
            <button
              onClick={handleSaveAsNew}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition disabled:opacity-60"
              title="Save a new copy with these details"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Save Copy</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-600/20 transition disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{editId ? 'Save Changes' : 'Save Resume'}</span>
          </button>
        </div>
      </div>

      {/* Import Notification Banner */}
      {importSuccessInfo && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-800 text-xs sm:text-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">
                Resume extracted successfully from "{importSuccessInfo.fileName}"!
              </p>
              <p className="text-emerald-700 text-xs mt-0.5">
                We've populated the form fields below. Review your contact info, education, skills, and experience, make any needed edits, and click "Save Resume".
              </p>
            </div>
          </div>
          <button
            onClick={() => setImportSuccessInfo(null)}
            className="text-emerald-500 hover:text-emerald-700 p-1 rounded-lg hover:bg-emerald-100/50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Split: Form on Left, Live Preview on Right */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left: Structured Form Builder */}
        <div
          className={`space-y-6 ${
            activeTab === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Section 1: Personal Info */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-navy-800 text-sm uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-primary-600" />
              <span>1. Personal &amp; Contact Info</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={resumeData.personalInfo.fullName}
                  onChange={handlePersonalInfoChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={resumeData.personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={resumeData.personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={resumeData.personalInfo.location}
                  onChange={handlePersonalInfoChange}
                  placeholder="Enter your city and state"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  name="linkedin"
                  value={resumeData.personalInfo.linkedin}
                  onChange={handlePersonalInfoChange}
                  placeholder="Enter your LinkedIn URL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">GitHub Profile</label>
                <input
                  type="text"
                  name="github"
                  value={resumeData.personalInfo.github}
                  onChange={handlePersonalInfoChange}
                  placeholder="Enter your GitHub URL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Professional Summary
              </label>
              <textarea
                rows={3}
                value={resumeData.summary}
                onChange={(e) => setResumeData((p) => ({ ...p, summary: e.target.value }))}
                placeholder="Enter your professional summary..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs leading-relaxed focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Technical Skills */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-navy-800 text-sm uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-primary-600" />
              <span>2. Technical Skills (Comma-separated)</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Languages (e.g. JavaScript, Python, C++, SQL)
              </label>
              <input
                type="text"
                value={resumeData.skills.languages.join(', ')}
                onChange={(e) => handleSkillsListChange('languages', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Frameworks &amp; Libraries (e.g. React.js, Node.js, Express, Tailwind CSS)
              </label>
              <input
                type="text"
                value={resumeData.skills.frameworks.join(', ')}
                onChange={(e) => handleSkillsListChange('frameworks', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Tools &amp; Databases (e.g. MongoDB, Git, Docker, AWS, Postman)
              </label>
              <input
                type="text"
                value={resumeData.skills.tools.join(', ')}
                onChange={(e) => handleSkillsListChange('tools', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Core Competencies / Soft Skills (e.g. Problem Solving, Teamwork)
              </label>
              <input
                type="text"
                value={resumeData.skills.softSkills.join(', ')}
                onChange={(e) => handleSkillsListChange('softSkills', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Projects */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-navy-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-primary-600" />
                <span>3. Key Projects</span>
              </h3>
              <button
                type="button"
                onClick={addProject}
                className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Project #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Enter project title"
                    value={proj.title}
                    onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Enter project link / demo URL"
                    value={proj.link}
                    onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Enter technologies used (e.g. React, Node.js)"
                  value={proj.technologies?.join(', ')}
                  onChange={(e) => handleProjectChange(idx, 'technologies', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Enter description and outcomes..."
                  value={proj.description}
                  onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                />
              </div>
            ))}
            {(!resumeData.projects || resumeData.projects.length === 0) && (
              <p className="text-xs text-slate-400 italic">No projects added yet. Click &quot;Add Project&quot; to showcase your academic or personal projects.</p>
            )}
          </div>

          {/* Section 4: Internships / Work Experience */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-navy-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary-600" />
                <span>4. Experience &amp; Internships</span>
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            </div>

            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Role #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Enter role title"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Enter start date"
                    value={exp.startDate}
                    onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Enter end date"
                    value={exp.endDate}
                    onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Enter key accomplishments..."
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                />
              </div>
            ))}
            {(!resumeData.experience || resumeData.experience.length === 0) && (
              <p className="text-xs text-slate-400 italic">No work or internship experience added yet. Click &quot;Add Experience&quot; to add roles.</p>
            )}
          </div>

          {/* Section 5: Education */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-navy-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary-600" />
                <span>5. Education Details</span>
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Degree #{idx + 1}</span>
                  {resumeData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Enter degree or major"
                    value={edu.degree || ''}
                    onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Enter college or university"
                    value={edu.institution || ''}
                    onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Start Year (e.g. 2022)"
                    value={edu.startDate || ''}
                    onChange={(e) => handleEducationChange(idx, 'startDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="End Year (e.g. 2026)"
                    value={edu.endDate || ''}
                    onChange={(e) => handleEducationChange(idx, 'endDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CGPA / Grade (e.g. 8.8)"
                    value={edu.grade || ''}
                    onChange={(e) => handleEducationChange(idx, 'grade', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Section 6: Certifications */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-navy-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-600" />
                <span>6. Certifications &amp; Licenses</span>
              </h3>
              <button
                type="button"
                onClick={addCertification}
                className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </button>
            </div>

            {(resumeData.certifications || []).map((cert, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Certification #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCertification(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Certificate Title / Name"
                    value={cert.name || ''}
                    onChange={(e) => handleCertificationChange(idx, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Issuing Org (e.g. AWS, freeCodeCamp)"
                    value={cert.issuer || ''}
                    onChange={(e) => handleCertificationChange(idx, 'issuer', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Issue Year / Date (e.g. 2024)"
                    value={cert.date || ''}
                    onChange={(e) => handleCertificationChange(idx, 'date', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Credential URL / Verification Link"
                    value={cert.link || ''}
                    onChange={(e) => handleCertificationChange(idx, 'link', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            ))}
            {(!resumeData.certifications || resumeData.certifications.length === 0) && (
              <p className="text-xs text-slate-400 italic">No certifications added yet. Click &quot;Add Certification&quot; to highlight credentials.</p>
            )}
          </div>

          {/* Section 7: Key Achievements */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-navy-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span>7. Key Achievements &amp; Honors</span>
              </h3>
              <button
                type="button"
                onClick={addAchievement}
                className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Achievement</span>
              </button>
            </div>

            <div className="space-y-2">
              {(resumeData.achievements || []).map((ach, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold text-xs select-none">•</span>
                  <input
                    type="text"
                    placeholder={`Achievement bullet #${idx + 1} (e.g. Solved 200+ LeetCode problems)`}
                    value={ach}
                    onChange={(e) => handleAchievementChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {(!resumeData.achievements || resumeData.achievements.length === 0) && (
              <p className="text-xs text-slate-400 italic">No achievements added yet. Click &quot;Add Achievement&quot; to list accomplishments.</p>
            )}
          </div>
        </div>

        {/* Right: Live Resume Preview (Sticky on Desktop) */}
        <div
          className={`lg:sticky lg:top-20 space-y-4 ${
            activeTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary-600" />
              <span>Live Formatted Preview</span>
            </span>
            <span className="text-[11px] text-slate-400">Updates dynamically</span>
          </div>

          <div className="overflow-x-auto shadow-md rounded-2xl">
            <ResumePreview resumeData={resumeData} id="resume-printable-area" />
          </div>
        </div>
      </div>
    </div>
  );
}
