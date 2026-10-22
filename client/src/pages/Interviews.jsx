import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Video,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InterviewModal from '../components/InterviewModal';
import ConfirmModal from '../components/ConfirmModal';
import StatusBadge from '../components/StatusBadge';

export default function Interviews() {
  const { showToast } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('upcoming'); // 'upcoming', 'all', 'completed', 'past'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.getInterviews();
      if (res.success) {
        setInterviews(res.data);
      }
    } catch (err) {
      showToast('Failed to load interviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const now = new Date();

  const filteredInterviews = interviews.filter((item) => {
    const scheduled = new Date(item.scheduledDate);
    if (filterTab === 'upcoming') {
      return scheduled >= now && item.status !== 'Completed' && item.status !== 'Cancelled';
    }
    if (filterTab === 'completed') {
      return item.status === 'Completed';
    }
    if (filterTab === 'past') {
      return scheduled < now && item.status !== 'Completed';
    }
    return true; // 'all'
  });

  const handleMarkCompleted = async (interview) => {
    try {
      await api.updateInterview(interview._id, { status: 'Completed' });
      showToast(`Interview marked as Completed!`, 'success');
      fetchInterviews();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteInterview(deleteId);
      showToast('Interview deleted.', 'info');
      setDeleteId(null);
      fetchInterviews();
    } catch (err) {
      showToast('Failed to delete interview', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-800 tracking-tight">
            Interviews &amp; Rounds
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track interview dates, technical rounds, video meeting links, and preparation notes
          </p>
        </div>

        <button
          onClick={() => {
            setEditingInterview(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'past', label: 'Past / Due' },
          { key: 'all', label: 'All Rounds' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              filterTab === tab.key
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interviews List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-xs text-slate-400">Loading interview schedules...</p>
        </div>
      ) : filteredInterviews.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredInterviews.map((item) => {
            const isPast = new Date(item.scheduledDate) < now;
            const isCompleted = item.status === 'Completed';

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm border border-amber-200 shrink-0">
                        {item.application?.company?.slice(0, 2).toUpperCase() || 'CO'}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-navy-800 text-base leading-tight">
                          {item.application?.company || 'Company'}
                        </h3>
                        <p className="text-xs text-slate-500">{item.application?.role || 'Role'}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Round & Details */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 my-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-navy-800">{item.round}</span>
                      <span className="text-slate-500 font-medium">{item.interviewType}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span>
                        {new Date(item.scheduledDate).toLocaleString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Topics */}
                  {item.notes && (
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                      <strong className="text-slate-800">Prep Notes:</strong> {item.notes}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                  <div>
                    {item.meetingUrl ? (
                      <a
                        href={item.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm shadow-primary-600/20 transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meeting</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No link specified</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.status !== 'Completed' && (
                      <button
                        onClick={() => handleMarkCompleted(item)}
                        className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition"
                        title="Mark as Completed"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingInterview(item);
                        setModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition"
                      title="Edit interview"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item._id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete interview"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-navy-800">No interviews in this view</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Schedule an interview round to track meeting links, rounds, and preparation notes.
          </p>
          <button
            onClick={() => {
              setEditingInterview(null);
              setModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold transition"
          >
            Schedule New Round
          </button>
        </div>
      )}

      {/* Schedule/Edit Modal */}
      {modalOpen && (
        <InterviewModal
          isOpen={modalOpen}
          interview={editingInterview}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchInterviews();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          title="Delete Interview Schedule?"
          message="Are you sure you want to delete this interview record? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
