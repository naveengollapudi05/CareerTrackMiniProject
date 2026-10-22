import React, { useState, useEffect } from 'react';
import { X, Calendar, Video, Link as LinkIcon, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROUND_PRESETS = [
  'Initial Recruiter Screening',
  'Technical Round 1 (Coding & DSA)',
  'Technical Round 2 (System Design / Core)',
  'Managerial Round',
  'HR & Culture Fit Round',
  'Take-Home Assessment Review',
];

const TYPE_OPTIONS = ['Online Video', 'Phone', 'On-site', 'Take-Home Assessment', 'Other'];
const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];

export default function InterviewModal({ isOpen, onClose, interview = null, onSuccess }) {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    applicationId: '',
    round: '',
    interviewType: 'Online Video',
    scheduledDate: '',
    meetingUrl: '',
    notes: '',
    status: 'Scheduled',
  });

  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoadingApps(true);
        const res = await api.getApplications();
        if (res.success) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error('Failed to load applications for interview scheduling:', err);
      } finally {
        setLoadingApps(false);
      }
    };

    if (isOpen) {
      fetchApplications();
    }
  }, [isOpen]);

  useEffect(() => {
    if (interview) {
      // Format scheduledDate for datetime-local input (YYYY-MM-DDTHH:MM)
      let formattedDate = '';
      if (interview.scheduledDate) {
        const d = new Date(interview.scheduledDate);
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      }

      setFormData({
        applicationId: interview.application?._id || interview.application || '',
        round: interview.round || '',
        interviewType: interview.interviewType || 'Online Video',
        scheduledDate: formattedDate,
        meetingUrl: interview.meetingUrl || '',
        notes: interview.notes || '',
        status: interview.status || 'Scheduled',
      });
    } else {
      // Default to tomorrow 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const defaultDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        applicationId: '',
        round: '',
        interviewType: 'Online Video',
        scheduledDate: defaultDate,
        meetingUrl: '',
        notes: '',
        status: 'Scheduled',
      });
    }
    setErrors({});
  }, [interview, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.applicationId) newErrors.applicationId = 'Please select an application';
    if (!formData.round.trim()) newErrors.round = 'Round name is required';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Date and time are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      if (interview) {
        await api.updateInterview(interview._id, formData);
        showToast('Interview details updated!', 'success');
      } else {
        await api.createInterview(formData);
        showToast('Interview scheduled successfully!', 'success');
      }
      onSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to save interview', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 my-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-navy-800">
                {interview ? 'Edit Interview' : 'Schedule Interview'}
              </h3>
              <p className="text-xs text-slate-500">Record rounds, dates, and meeting links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Associated Application */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Associated Job Application <span className="text-rose-500">*</span>
            </label>
            <select
              name="applicationId"
              value={formData.applicationId}
              onChange={handleChange}
              disabled={loadingApps || !!interview}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none ${
                errors.applicationId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            >
              <option value="">-- Choose Job Application --</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.company} — {app.role} ({app.status})
                </option>
              ))}
            </select>
            {errors.applicationId && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.applicationId}</p>
            )}
          </div>

          {/* Round Title with Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Interview Round <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="round"
              value={formData.round}
              onChange={handleChange}
              placeholder="Enter interview round title"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none ${
                errors.round ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.round && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.round}</p>
            )}

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ROUND_PRESETS.slice(0, 4).map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setFormData((p) => ({ ...p, round: preset }))}
                  className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-primary-50 hover:text-primary-600 text-[11px] font-medium text-slate-600 transition"
                >
                  {preset.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Interview Type
              </label>
              <select
                name="interviewType"
                value={formData.interviewType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
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
                Interview Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Scheduled Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none ${
                errors.scheduledDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.scheduledDate && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.scheduledDate}</p>
            )}
          </div>

          {/* Meeting URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Meeting URL (Google Meet / Zoom / Teams)
            </label>
            <div className="relative">
              <Video className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                name="meetingUrl"
                value={formData.meetingUrl}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Preparation Notes & Tips
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Revise SQL joins, project architecture, behavioral questions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white text-sm font-bold shadow-md shadow-primary-600/20 transition disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{interview ? 'Update Interview' : 'Schedule Interview'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
