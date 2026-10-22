import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
        <span className="text-6xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          404
        </span>
        <h2 className="text-xl font-bold text-navy-800 mt-3">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          The requested page doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-sm transition"
        >
          <Home className="w-4 h-4" />
          <span>Return to Workspace</span>
        </Link>
      </div>
    </div>
  );
}
