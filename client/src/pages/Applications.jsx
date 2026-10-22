import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Download,
  Loader2,
  FileText,
  Tag,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from '../components/ApplicationModal';
import ConfirmModal from '../components/ConfirmModal';
import StatusBadge from '../components/StatusBadge';

const STATUS_FILTERS = ['All', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

export default function Applications() {
  const { showToast } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'company'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getApplications({
        status: statusFilter,
        search,
        sort: sortOption,
      });
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, sortOption]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteApplication(deleteId);
      showToast('Application deleted.', 'info');
      setDeleteId(null);
      fetchApplications();
      window.dispatchEvent(new Event('careertrack_application_updated'));
    } catch (err) {
      showToast('Failed to delete application', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const csvData = await api.exportApplicationsCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `careertrack_applications_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exported applications to CSV!', 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-800 tracking-tight">
            Applications Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete CRUD tracking: roles, interview stages, job descriptions, and required skills
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition shadow-2xs"
            title="Download CSV export"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingApplication(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, role or location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </form>

        {/* Filter and Sort Dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-navy-800 focus:outline-none"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold shrink-0 ml-2">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="newest">Newest Date</option>
            <option value="oldest">Oldest Date</option>
            <option value="company">Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Applications Cards/Grid View */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-xs text-slate-400">Loading applications...</p>
        </div>
      ) : applications.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      {app.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-navy-800 text-base leading-tight group-hover:text-primary-600 transition">
                        {app.company}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{app.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                {/* Tags Strip */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 my-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold">
                    {app.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold">
                    {app.mode}
                  </span>
                  {app.location && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {app.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(app.applicationDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Required Skills Chips */}
                {app.requiredSkills && app.requiredSkills.length > 0 && (
                  <div className="my-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      <Tag className="w-3 h-3" />
                      <span>Required Skills ({app.requiredSkills.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {app.requiredSkills.slice(0, 4).map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-[10px] font-bold border border-primary-100"
                        >
                          {sk}
                        </span>
                      ))}
                      {app.requiredSkills.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                          +{app.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {app.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-2 line-clamp-2">
                    {app.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <div>
                  {app.url ? (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition"
                    >
                      <span>Posting</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No URL</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingApplication(app);
                      setModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition"
                    title="Edit application"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(app._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-navy-800">No applications match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing the status filter, or log your first internship application.
          </p>
          <button
            onClick={() => {
              setEditingApplication(null);
              setModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold transition"
          >
            Add New Application
          </button>
        </div>
      )}

      {/* Add / Edit Application Modal */}
      {modalOpen && (
        <ApplicationModal
          isOpen={modalOpen}
          application={editingApplication}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchApplications();
            window.dispatchEvent(new Event('careertrack_application_updated'));
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          title="Delete Application Record?"
          message="Are you sure you want to delete this job application? Associated interview rounds and reminders will also be removed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
