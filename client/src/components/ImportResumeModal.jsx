import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileUp,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ImportResumeModal({
  isOpen,
  onClose,
  onSuccess,
  existingResumes = [],
}) {
  const { showToast } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [importMode, setImportMode] = useState('new'); // 'new' | 'replace'
  const [replaceId, setReplaceId] = useState(
    existingResumes.length > 0 ? existingResumes[0]._id : ''
  );
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile) => {
    setErrorMessage('');
    if (!selectedFile) return;

    // Check size <= 5 MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setErrorMessage(
        `File size exceeds 5 MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller resume file.`
      );
      setFile(null);
      return;
    }

    // Check format
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      setErrorMessage(
        'Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).'
      );
      setFile(null);
      return;
    }

    setFile(selectedFile);

    // Auto-suggest title based on filename if not already set
    if (!title) {
      const cleanName = selectedFile.name
        .replace(/\.(pdf|docx)$/i, '')
        .replace(/[_\-+]/g, ' ')
        .trim();
      setTitle(`${cleanName} (Imported)`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!file) {
      setErrorMessage('Please select a PDF or DOCX resume file to upload.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (title.trim()) formData.append('title', title.trim());
      if (targetRole.trim()) formData.append('targetRole', targetRole.trim());
      if (importMode === 'replace' && replaceId) {
        formData.append('replaceId', replaceId);
      }

      const res = await api.importResumeFile(formData);

      if (res.success && res.data) {
        showToast(
          importMode === 'replace'
            ? 'Resume replaced and updated successfully!'
            : 'Resume imported and saved successfully!',
          'success'
        );
        if (onSuccess) {
          onSuccess(res.data);
        }
        handleClose();
      } else {
        throw new Error(res.message || 'Failed to import resume');
      }
    } catch (err) {
      setErrorMessage(
        err.message ||
          'Failed to extract and import resume. Please verify the document has readable text.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setTargetRole('');
    setImportMode('new');
    setErrorMessage('');
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-navy-800">
                Import Existing Resume
              </h3>
              <p className="text-xs text-slate-500">
                Upload your PDF or DOCX file to extract and save
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Resume File (PDF or DOCX, max 5 MB)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-slate-300 hover:border-primary-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-primary-50/20 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 text-slate-400 group-hover:text-primary-600 group-hover:border-primary-300 flex items-center justify-center mx-auto mb-3 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-navy-800">
                  Click to browse or drag and drop your file here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PDF (.pdf) and Microsoft Word (.docx) up to 5 MB
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-primary-200 bg-primary-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-navy-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB &bull;{' '}
                      {file.name.endsWith('.pdf') ? 'PDF Document' : 'Word Document'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Title & Target Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resume Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Stack Developer Resume"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Role (Optional)
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Import Destination: New vs Replace */}
          {existingResumes.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Save Destination
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="new"
                    checked={importMode === 'new'}
                    onChange={() => setImportMode('new')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>Save as a new resume in my collection</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>Replace an existing resume</span>
                </label>
              </div>

              {importMode === 'replace' && (
                <div className="mt-2.5">
                  <select
                    value={replaceId}
                    onChange={(e) => setReplaceId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
                  >
                    {existingResumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title} {r.targetRole ? `(${r.targetRole})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting &amp; Saving...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    {importMode === 'replace' ? 'Replace Resume' : 'Import & Save'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
