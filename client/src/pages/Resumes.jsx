import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Calendar,
  Briefcase,
  Loader2,
  X,
  FileUp,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import ResumePreview from '../components/ResumePreview';
import ImportResumeModal from '../components/ImportResumeModal';

export default function Resumes() {
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewResume, setPreviewResume] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await api.getResumes();
      if (res.success) {
        setResumes(res.data);
      }
    } catch (err) {
      showToast('Failed to load resumes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteResume(deleteId);
      showToast('Resume deleted successfully.', 'info');
      setDeleteId(null);
      fetchResumes();
    } catch (err) {
      showToast('Failed to delete resume', 'error');
    }
  };

  const handleDownloadPDF = async (resume) => {
    setDownloadingId(resume._id);
    setPreviewResume(resume);

    setTimeout(() => {
      window.print();
      setDownloadingId(null);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-800 tracking-tight">
            Saved Resumes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain multiple tailored resumes for different roles and track application usage
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-navy-800 font-bold text-xs sm:text-sm shadow-2xs transition-all hover:-translate-y-0.5"
          >
            <FileUp className="w-4 h-4 text-primary-600" />
            <span>Import Resume</span>
          </button>

          <button
            onClick={() => navigate('/resume-builder')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Resume</span>
          </button>
        </div>
      </div>

      {/* Resumes Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-xs text-slate-400">Loading saved resumes...</p>
        </div>
      ) : resumes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
                    <Files className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                    {resume.targetRole || 'General'}
                  </span>
                </div>

                <h3 className="font-extrabold text-navy-800 text-base leading-tight group-hover:text-primary-600 transition">
                  {resume.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {resume.summary || 'Custom tailored resume for student placements.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Updated: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-medium text-primary-700">
                    <Briefcase className="w-3.5 h-3.5 text-primary-500" />
                    <span>Attached to {resume.applicationCount || 0} application(s)</span>
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <button
                  onClick={() => setPreviewResume(resume)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-navy-900 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownloadPDF(resume)}
                    className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition"
                    title="Download / Print PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/resume-builder?id=${resume._id}`)}
                    className="p-2 rounded-xl text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition"
                    title="Edit resume"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(resume._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete resume"
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
          <Files className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-navy-800">No resumes saved yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Build your first professional resume with live preview and export it as an ATS-friendly PDF.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-navy-800 text-xs font-bold shadow-xs transition"
            >
              <FileUp className="w-4 h-4 text-primary-600" />
              <span>Import Existing Resume</span>
            </button>
            <button
              onClick={() => navigate('/resume-builder')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-primary-600/20 transition"
            >
              Launch Resume Builder
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 my-auto">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-navy-800">{previewResume.title}</h3>
                <p className="text-xs text-slate-400">{previewResume.targetRole || 'Resume Preview'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setPreviewResume(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50">
              <ResumePreview resumeData={previewResume} id="resume-printable-area" />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          title="Delete Saved Resume?"
          message="Are you sure you want to permanently delete this resume? It will be unlinked from any applications using it."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Import Resume Modal */}
      <ImportResumeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingResumes={resumes}
        onSuccess={() => {
          fetchResumes();
        }}
      />
    </div>
  );
}
