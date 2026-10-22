import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, ExternalLink, History, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const TYPE_OPTIONS = ['Internship', 'Full-Time', 'Part-Time', 'Contract'];
const MODE_OPTIONS = ['Remote', 'Hybrid', 'On-site'];

const getLocalDateString = (d = new Date()) => {
  const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ApplicationModal({ isOpen, onClose, application = null, onSuccess }) {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    type: 'Internship',
    location: '',
    mode: 'Remote',
    url: '',
    description: '',
    applicationDate: getLocalDateString(),
    status: 'Applied',
    notes: '',
    requiredSkills: [],
    resumeUsed: '',
    statusNote: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    // Fetch user resumes for selection dropdown
    const fetchResumes = async () => {
      try {
        const res = await api.getResumes();
        if (res.success) {
          setResumes(res.data);
        }
      } catch (err) {
        console.error('Error fetching resumes for dropdown:', err);
      }
    };
    if (isOpen) {
      fetchResumes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company || '',
        role: application.role || '',
        type: application.type || 'Internship',
        location: application.location || '',
        mode: application.mode || 'Remote',
        url: application.url || '',
        description: application.description || '',
        applicationDate: application.applicationDate
          ? getLocalDateString(application.applicationDate)
          : getLocalDateString(),
        status: application.status || 'Applied',
        notes: application.notes || '',
        requiredSkills: application.requiredSkills || [],
        resumeUsed: application.resumeUsed?._id || application.resumeUsed || '',
        statusNote: '',
      });
    } else {
      setFormData({
        company: '',
        role: '',
        type: 'Internship',
        location: '',
        mode: 'Remote',
        url: '',
        description: '',
        applicationDate: getLocalDateString(),
        status: 'Applied',
        notes: '',
        requiredSkills: [],
        resumeUsed: '',
        statusNote: '',
      });
    }
    setErrors({});
  }, [application, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    if (!skillInput.trim()) return;

    const tokens = skillInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (tokens.length === 0) return;

    setFormData((prev) => {
      const existing = new Set(prev.requiredSkills || []);
      tokens.forEach((t) => existing.add(t));
      return {
        ...prev,
        requiredSkills: Array.from(existing),
      };
    });
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAutoExtractSkills = async () => {
    if (!formData.description.trim()) {
      showToast('Please paste a Job Description first to extract skills.', 'error');
      return;
    }

    try {
      setExtracting(true);
      const res = await api.extractSkills(formData.description);
      if (res.success && res.skills.length > 0) {
        const combined = Array.from(new Set([...formData.requiredSkills, ...res.skills]));
        setFormData((prev) => ({ ...prev, requiredSkills: combined }));
        showToast(`Detected and added ${res.skills.length} skills from job description!`, 'success');
      } else {
        showToast('No known tech skills detected in text. You can add skills manually below.', 'info');
      }
    } catch (err) {
      showToast('Failed to extract skills. Please add manually.', 'error');
    } finally {
      setExtracting(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.role.trim()) newErrors.role = 'Job role is required';
    if (!formData.applicationDate) newErrors.applicationDate = 'Application date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        ...formData,
        resumeUsed: formData.resumeUsed || null,
      };

      if (application) {
        await api.updateApplication(application._id, payload);
        showToast(`Updated application for ${formData.company}!`, 'success');
      } else {
        await api.createApplication(payload);
        showToast(`Logged application at ${formData.company}!`, 'success');
      }

      onSuccess();
    } catch (err) {
      showToast(err.message || 'Error saving application', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-navy-800 tracking-tight">
              {application ? 'Edit Application' : 'Log New Application'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record interview dates, pasted job requirements, and application status
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Row 1: Company & Role */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  errors.company ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                }`}
              />
              {errors.company && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Role / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Enter role or job title"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  errors.role ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                }`}
              />
              {errors.role && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Row 2: Type, Mode, Status */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Opportunity Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Work Mode
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {MODE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Application Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-semibold"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* If updating status, show optional status change note */}
          {application && application.status !== formData.status && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <label className="block text-xs font-bold text-amber-800 mb-1">
                Status Change Note (Optional)
              </label>
              <input
                type="text"
                name="statusNote"
                value={formData.statusNote}
                onChange={handleChange}
                placeholder="Enter status update notes..."
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs text-navy-900 focus:outline-none"
              />
            </div>
          )}

          {/* Row 3: Location, Application Date, Resume Attached */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Applied Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="applicationDate"
                value={formData.applicationDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Resume Used
              </label>
              <select
                name="resumeUsed"
                value={formData.resumeUsed}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
              >
                <option value="">-- None Selected --</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title} ({r.targetRole || 'General'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Application URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Job Posting / Application URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="Enter job application URL"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
            />
          </div>

          {/* Job Description Pasting with Auto-Extraction */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Pasted Job Description
              </label>
              <button
                type="button"
                onClick={handleAutoExtractSkills}
                disabled={extracting}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold border border-primary-200 transition"
              >
                {extracting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Auto-Extract Skills</span>
              </button>
            </div>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Paste job description or requirements here to auto-detect demanded skills..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Required Skills Management */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Required Skills for this Role
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type skill or comma-separated skills & press Enter"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {formData.requiredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                {formData.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-navy-800 shadow-2xs"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No skills entered yet. Type above or click "Auto-Extract Skills" from JD!
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Personal Notes & Follow-ups
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter personal notes or follow-ups..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
            />
          </div>

          {/* Status Change History View if editing */}
          {application && application.statusHistory && application.statusHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <History className="w-4 h-4 text-slate-400" />
                <span>Status Change History</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {application.statusHistory.map((hist, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status={hist.status} />
                      <span className="text-slate-600">{hist.notes || 'Status updated'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(hist.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white text-sm font-bold shadow-md shadow-primary-600/20 transition disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{application ? 'Save Changes' : 'Create Application'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
