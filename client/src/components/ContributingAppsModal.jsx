import React from 'react';
import { X, Briefcase, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function ContributingAppsModal({ isOpen, onClose, skillData }) {
  const navigate = useNavigate();

  if (!isOpen || !skillData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 my-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 font-bold text-xs border border-primary-200">
                {skillData.skill}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Requested in {skillData.count} application{skillData.count > 1 ? 's' : ''} ({skillData.percentage}%)
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-navy-800 mt-1">Contributing Applications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Applications */}
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {skillData.applications && skillData.applications.length > 0 ? (
            skillData.applications.map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 font-black text-sm flex items-center justify-center">
                    {app.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-800">{app.company}</h4>
                    <p className="text-xs text-slate-500">{app.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">
              No contributing applications recorded.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-between items-center text-xs text-slate-500">
          <span>Counts at most once per application</span>
          <button
            onClick={() => {
              onClose();
              navigate('/applications');
            }}
            className="text-primary-600 hover:text-primary-700 font-bold"
          >
            Go to Applications &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
