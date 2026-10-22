import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, LogOut, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Navbar({ onMenuToggle, onOpenAddModal }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [remindersCount, setRemindersCount] = useState(0);

  useEffect(() => {
    const fetchActiveReminders = async () => {
      try {
        const res = await api.getReminders({ category: 'dueToday' });
        if (res.success && res.stats) {
          setRemindersCount(res.stats.dueToday + res.stats.overdue);
        }
      } catch (err) {
        // Silently fail if not loaded
      }
    };
    fetchActiveReminders();
    window.addEventListener('careertrack_reminder_updated', fetchActiveReminders);
    return () => {
      window.removeEventListener('careertrack_reminder_updated', fetchActiveReminders);
    };
  }, []);

  const fullName = user?.profile?.fullName || user?.username || 'Student';
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Mobile hamburger & welcome */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 lg:hidden transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-navy-800 tracking-tight">
            CareerTrack Portal
          </h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {user?.profile?.targetRole
              ? `Target Role: ${user.profile.targetRole}`
              : 'Smart Student Placement Tracker'}
          </p>
        </div>
      </div>

      {/* Action shortcuts & User profile badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white text-xs font-bold shadow-sm shadow-primary-500/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        )}

        {/* Reminders notification button */}
        <button
          onClick={() => navigate('/reminders')}
          className="relative p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition"
          title="View Reminders"
        >
          <Bell className="w-5 h-5" />
          {remindersCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {remindersCount > 9 ? '9+' : remindersCount}
            </span>
          )}
        </button>

        {/* User avatar and profile shortcut */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 p-1 pl-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition"
          title="Open Settings & Profile"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
            {initials || 'ST'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-navy-800 leading-tight truncate max-w-[120px]">
              {fullName}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">@{user?.username}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
