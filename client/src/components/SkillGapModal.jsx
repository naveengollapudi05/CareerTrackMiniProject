import React, { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle, BookOpen, Clock, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SkillGapModal({ isOpen, onClose, skillItem, onSuccess }) {
  const { showToast, addSkill } = useAuth();
  const [status, setStatus] = useState('Not Started');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (skillItem) {
      setStatus(skillItem.learningStatus || skillItem.status || 'Not Started');
      setNotes(skillItem.notes || '');
    }
  }, [skillItem]);

  if (!isOpen || !skillItem) return null;

  const handleUpdateStatus = async (newStatus) => {
    try {
      setSaving(true);
      await api.updateLearningStatus(skillItem.skill || skillItem.skillName, {
        status: newStatus,
        notes,
      });
      setStatus(newStatus);
      showToast(`Updated learning status for ${skillItem.skill || skillItem.skillName}!`, 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToProfile = async () => {
    try {
      setSaving(true);
      const skillName = skillItem.skill || skillItem.skillName;
      await api.updateLearningStatus(skillName, {
        status: 'Completed',
        notes: 'Added directly to user skills profile',
        addToProfile: true,
      });
      await addSkill(skillName);
      showToast(`Added "${skillName}" to your profile skills!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast('Failed to add skill to profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resource = skillItem.resource || {
    title: skillItem.resourceTitle,
    url: skillItem.resourceUrl,
    type: skillItem.resourceType || 'Learning Resource',
    description: skillItem.resourceDescription || 'Recommended tutorial to bridge this skill gap.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 my-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-navy-800">
                  {skillItem.skill || skillItem.skillName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                  Missing in Profile
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Requested in {skillItem.demandCount || skillItem.count} of your applications ({skillItem.demandPercentage || skillItem.percentage}%)
              </p>
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
        <div className="p-6 space-y-5">
          {/* Recommended Learning Resource */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50/70 to-purple-50/70 border border-primary-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-600">
              Recommended Course / Guide
            </span>
            <h4 className="text-sm font-bold text-navy-900 mt-1">{resource.title}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {resource.description}
            </p>
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-primary-600 hover:text-primary-700 text-xs font-bold border border-primary-200 shadow-2xs hover:shadow-xs transition"
              >
                <span>Start Learning</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Learning Status Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Track Your Progress
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Not Started', 'Learning', 'Completed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateStatus(st)}
                  disabled={saving}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    status === st
                      ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Already have this skill quick action */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-navy-800">Already know this skill?</p>
              <p className="text-[11px] text-slate-500">Add it directly to your profile inventory</p>
            </div>
            <button
              type="button"
              onClick={handleAddToProfile}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Add to Profile</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
