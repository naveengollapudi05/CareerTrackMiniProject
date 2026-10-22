import React, { useState, useEffect } from 'react';
import { X, Bell, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TYPE_OPTIONS = ['Application Follow-up', 'Upcoming Interview', 'Task', 'Custom'];

export default function ReminderModal({ isOpen, onClose, reminder = null, onSuccess }) {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    type: 'Task',
    applicationId: '',
    interviewId: '',
  });

  const [applications, setApplications] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.getApplications();
        if (res.success) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error('Failed to load applications for reminder:', err);
      }
    };
    if (isOpen) {
      fetchApps();
    }
  }, [isOpen]);

  useEffect(() => {
    if (reminder) {
      let formattedDate = '';
      if (reminder.dueDate) {
        const d = new Date(reminder.dueDate);
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      }

      setFormData({
        title: reminder.title || '',
        description: reminder.description || '',
        dueDate: formattedDate,
        type: reminder.type || 'Task',
        applicationId: reminder.application?._id || reminder.application || '',
        interviewId: reminder.interview?._id || reminder.interview || '',
      });
    } else {
      // Default due today at 18:00
      const today = new Date();
      today.setHours(18, 0, 0, 0);
      const defaultDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        title: '',
        description: '',
        dueDate: defaultDate,
        type: 'Task',
        applicationId: '',
        interviewId: '',
      });
    }
    setErrors({});
  }, [reminder, isOpen]);

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
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      if (reminder) {
        await api.updateReminder(reminder._id, formData);
        showToast('Reminder updated successfully!', 'success');
      } else {
        await api.createReminder(formData);
        showToast('Reminder set successfully!', 'success');
      }
      window.dispatchEvent(new CustomEvent('careertrack_reminder_updated'));
      onSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to save reminder', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 my-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary-50 text-primary-600 border border-primary-200">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-navy-800">
                {reminder ? 'Edit Reminder' : 'Set New Reminder'}
              </h3>
              <p className="text-xs text-slate-500">Track deadlines, follow-ups, and tasks</p>
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Reminder Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Send thank-you email, complete HackerRank test"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none ${
                errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
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
                Due Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none ${
                  errors.dueDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Associate with Application (Optional)
            </label>
            <select
              name="applicationId"
              value={formData.applicationId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
            >
              <option value="">-- General (No Application) --</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.company} — {app.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Description / Notes
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add key details or next steps..."
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
              <span>{reminder ? 'Save Changes' : 'Create Reminder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
