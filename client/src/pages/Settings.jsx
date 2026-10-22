import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Download,
  LogOut,
  Save,
  Plus,
  X,
  Sparkles,
  Lock,
  GraduationCap,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const SUGGESTED_SKILLS = [
  'SQL',
  'Python',
  'Excel',
  'Power BI',
  'JavaScript',
  'React.js',
  'Node.js',
  'Communication',
  'Problem Solving',
  'Git',
  'MongoDB',
  'Java',
  'C++',
  'AWS',
  'Docker',
];

export default function Settings() {
  const {
    user,
    updateProfile,
    addSkill,
    removeSkill,
    updatePassword,
    logout,
    showToast,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'skills', 'security', 'preferences', 'data'

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    username: '',
    fullName: '',
    targetRole: '',
    bio: '',
    college: '',
    degree: '',
    gradYear: '',
    cgpa: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Skill Input
  const [newSkill, setNewSkill] = useState('');

  // Notification Preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    interviewReminders: true,
    overdueTasks: true,
    applicationFollowUps: true,
  });

  // Logout modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        fullName: user.profile?.fullName || '',
        targetRole: user.profile?.targetRole || '',
        bio: user.profile?.bio || '',
        college: user.profile?.college || '',
        degree: user.profile?.degree || '',
        gradYear: user.profile?.gradYear || '',
        cgpa: user.profile?.cgpa || '',
      });
      if (user.profile?.notificationPreferences) {
        setNotificationPreferences(user.profile.notificationPreferences);
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({
      ...profileForm,
      notificationPreferences,
    });
    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    setSavingPassword(true);
    const res = await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (res.success) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setSavingPassword(false);
  };

  const handleAddSkillSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newSkill.trim()) return;
    const tokens = newSkill.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    for (const t of tokens) {
      await addSkill(t);
    }
    setNewSkill('');
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
      showToast('CSV export downloaded!', 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  const userSkills = user?.profile?.skills || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-800 tracking-tight">
          Account &amp; Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal profile, skill inventory, credentials, preferences, and data exports
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* Left Settings Navigation Menu */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-sm space-y-1">
          {[
            { id: 'profile', label: 'User Profile & Bio', icon: User },
            { id: 'skills', label: 'My Skill Inventory', icon: Sparkles },
            { id: 'security', label: 'Security & Password', icon: Shield },
            { id: 'preferences', label: 'Notification Settings', icon: Bell },
            { id: 'data', label: 'Data Export & Logout', icon: Download },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition text-left ${
                  activeTab === item.id
                    ? 'bg-primary-50 text-primary-700 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: Profile & Education Details */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-navy-800">Edit Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your profile details are used across resume previews and skill-gap calculations
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, username: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Email is tied to your account</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Target Role / Goal
                    </label>
                    <input
                      type="text"
                      value={profileForm.targetRole}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, targetRole: e.target.value }))
                      }
                      placeholder="Enter your target role"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* College & Degree */}
                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      College / University
                    </label>
                    <input
                      type="text"
                      value={profileForm.college}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, college: e.target.value }))
                      }
                      placeholder="Enter your college or university"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Degree / Major
                    </label>
                    <input
                      type="text"
                      value={profileForm.degree}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, degree: e.target.value }))
                      }
                      placeholder="Enter your degree or major"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={profileForm.gradYear}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, gradYear: e.target.value }))
                      }
                      placeholder="Enter your graduation year"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      CGPA / Percentage
                    </label>
                    <input
                      type="text"
                      value={profileForm.cgpa}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, cgpa: e.target.value }))
                      }
                      placeholder="Enter your CGPA or percentage"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Profile Summary / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, bio: e.target.value }))
                    }
                    placeholder="Enter your profile summary..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-600/20 transition disabled:opacity-60"
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Manage Current Skills */}
          {activeTab === 'skills' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-navy-800">Manage Current Skills</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These skills are actively compared with your saved applications to calculate match percentages
                </p>
              </div>

              {/* Add Skill Input */}
              <form onSubmit={handleAddSkillSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </form>

              {/* Active Profile Skills Tags */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Your Current Skills ({userSkills.length})
                </h4>
                {userSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy-800 shadow-2xs hover:border-slate-300 transition"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(sk)}
                          className="text-slate-400 hover:text-rose-500 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills in your profile yet.</p>
                )}
              </div>

              {/* Quick Add Suggestions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Popular Student Skill Suggestions:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.filter(
                    (s) => !userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
                  ).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => addSkill(s)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-xs font-semibold text-slate-600 transition"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-navy-800">Change Password</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify your current password and choose a secure replacement (min. 6 characters)
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    placeholder="Enter your current password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    placeholder="Create a new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                    placeholder="Confirm your new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-navy-900 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition disabled:opacity-60"
                >
                  {savingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Notification Preferences */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-navy-800">Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure in-app alerts and deadline indicators
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                {[
                  {
                    key: 'interviewReminders',
                    title: 'Upcoming Interview Alerts',
                    desc: 'Display notifications for interviews scheduled within 24 hours',
                  },
                  {
                    key: 'overdueTasks',
                    title: 'Overdue Task Alerts',
                    desc: 'Highlight pending tasks and follow-up deadlines that have passed',
                  },
                  {
                    key: 'applicationFollowUps',
                    title: 'Application Follow-up Reminders',
                    desc: 'Remind me to check statuses on applications with no response after 14 days',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-navy-800">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationPreferences[item.key]}
                      onChange={(e) =>
                        setNotificationPreferences((p) => ({ ...p, [item.key]: e.target.checked }))
                      }
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                ))}

                <button
                  onClick={handleProfileSubmit}
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm transition"
                >
                  Save Notification Preferences
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Data Export & Logout */}
          {activeTab === 'data' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-navy-800">Data Management &amp; Logout</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export your application pipeline records to CSV or securely sign out of your account
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-navy-800">Export Application Records</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Download an offline CSV spreadsheet containing all your applications, statuses, notes, and skills
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-primary-600" />
                  )}
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Sign Out of CareerTrack</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    End your active session on this device
                  </p>
                </div>
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation */}
      {logoutModalOpen && (
        <ConfirmModal
          isOpen={logoutModalOpen}
          title="Sign out of CareerTrack?"
          message="Are you sure you want to log out? Your data remains securely saved in the database."
          confirmText="Log Out"
          danger={true}
          onConfirm={() => {
            setLogoutModalOpen(false);
            logout();
          }}
          onCancel={() => setLogoutModalOpen(false)}
        />
      )}
    </div>
  );
}
