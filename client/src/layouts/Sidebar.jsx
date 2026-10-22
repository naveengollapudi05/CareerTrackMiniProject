import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  FileEdit,
  Files,
  Bell,
  Settings,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Interviews', path: '/interviews', icon: CalendarCheck },
  { name: 'Applications', path: '/applications', icon: Briefcase },
  { name: 'Resume Builder', path: '/resume-builder', icon: FileEdit },
  { name: 'Resumes', path: '/resumes', icon: Files },
  { name: 'Reminders', path: '/reminders', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Vertical Dark Navy Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-navy-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              CareerTrack
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Student Job Hub</p>
          </div>
        </div>

        {/* Navigation Items (Exact order: Home, Dashboard, Interviews, Applications, Resume Builder, Resumes, Reminders, Settings) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-md shadow-primary-600/30 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-400'
                      }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.name === 'Resume Builder' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        PDF
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Student Quick Tip Card at bottom of sidebar */}
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-700/80 border border-navy-700 text-xs">
          <div className="flex items-center gap-2 text-primary-400 font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Smart Match Tip</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Paste job descriptions when adding applications to auto-detect demanded skills!
          </p>
        </div>
      </aside>
    </>
  );
}
