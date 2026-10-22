import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  Briefcase,
  Edit2,
  Trash2,
  Check,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReminderModal from '../components/ReminderModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Reminders() {
  const { showToast } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, overdue: 0, dueToday: 0, upcoming: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'dueToday', 'overdue', 'completed', 'all'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.getReminders();
      if (res.success) {
        setReminders(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      showToast('Failed to load reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const categorizedList = reminders.filter((rem) => {
    if (activeTab === 'completed') return rem.completed;
    if (rem.completed) return false;

    const due = new Date(rem.dueDate);
    if (activeTab === 'overdue') return due < todayStart;
    if (activeTab === 'dueToday') return due >= todayStart && due <= todayEnd;
    if (activeTab === 'upcoming') return due > todayEnd;
    return true; // 'all'
  });

  const handleToggle = async (id) => {
    try {
      const res = await api.toggleReminder(id);
      if (res.success) {
        showToast(res.message, 'success');
        fetchReminders();
        window.dispatchEvent(new CustomEvent('careertrack_reminder_updated'));
      }
    } catch (err) {
      showToast('Failed to toggle reminder', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteReminder(deleteId);
      showToast('Reminder deleted.', 'info');
      setDeleteId(null);
      fetchReminders();
      window.dispatchEvent(new CustomEvent('careertrack_reminder_updated'));
    } catch (err) {
      showToast('Failed to delete reminder', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-800 tracking-tight">
            Reminders &amp; Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay ahead of application follow-ups, interview dates, and preparation deadlines
          </p>
        </div>

        <button
          onClick={() => {
            setEditingReminder(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Set Reminder</span>
        </button>
      </div>

      {/* Tabs with Badge Counters (Upcoming, Due today, Overdue, Completed) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'upcoming', label: 'Upcoming', count: stats.upcoming, color: 'text-primary-600' },
          { key: 'dueToday', label: 'Due Today', count: stats.dueToday, color: 'text-amber-600' },
          { key: 'overdue', label: 'Overdue', count: stats.overdue, color: 'text-rose-600' },
          { key: 'completed', label: 'Completed', count: stats.completed, color: 'text-emerald-600' },
          { key: 'all', label: 'All Tasks', count: stats.total, color: 'text-slate-600' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-xs text-slate-400">Loading reminders...</p>
        </div>
      ) : categorizedList.length > 0 ? (
        <div className="space-y-3">
          {categorizedList.map((rem) => {
            const isDueToday =
              new Date(rem.dueDate) >= todayStart && new Date(rem.dueDate) <= todayEnd;
            const isOverdue = new Date(rem.dueDate) < todayStart && !rem.completed;

            return (
              <div
                key={rem._id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  rem.completed
                    ? 'bg-slate-50/60 border-slate-200/60 opacity-70'
                    : isOverdue
                    ? 'bg-rose-50/40 border-rose-200'
                    : isDueToday
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-slate-200/80 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Complete Checkbox Button */}
                  <button
                    onClick={() => handleToggle(rem._id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                      rem.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-600 text-transparent hover:text-emerald-600 bg-white'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  {/* Reminder Content */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          rem.completed ? 'line-through text-slate-400' : 'text-navy-800'
                        }`}
                      >
                        {rem.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {rem.type}
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-700">
                          OVERDUE
                        </span>
                      )}
                      {isDueToday && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-700">
                          DUE TODAY
                        </span>
                      )}
                    </div>

                    {rem.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {rem.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(rem.dueDate).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>

                      {rem.application && (
                        <span className="flex items-center gap-1 text-primary-600 font-semibold">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>
                            {rem.application.company} ({rem.application.role})
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingReminder(rem);
                      setModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                    title="Edit reminder"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(rem._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-navy-800">No reminders in this tab</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create reminders for company follow-up emails, test deadlines, or interview prep.
          </p>
          <button
            onClick={() => {
              setEditingReminder(null);
              setModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold transition"
          >
            Create New Reminder
          </button>
        </div>
      )}

      {/* Reminder Modal */}
      {modalOpen && (
        <ReminderModal
          isOpen={modalOpen}
          reminder={editingReminder}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchReminders();
          }}
        />
      )}

      {/* Confirm Deletion Modal */}
      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          title="Delete Reminder?"
          message="Are you sure you want to delete this reminder task?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
