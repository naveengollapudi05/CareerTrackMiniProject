import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Briefcase,
  CalendarCheck,
  Bell,
  Sparkles,
  ArrowRight,
  Plus,
  FileEdit,
  LayoutDashboard,
  ExternalLink,
  CheckCircle2,
  Clock,
  Video,
  Award,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SkillGapModal from '../components/SkillGapModal';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const openQuickAdd = outletContext?.openQuickAdd;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedSkillForModal, setSelectedSkillForModal] = useState(null);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Error fetching home dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();

    // Listen to updates from other actions
    const handleUpdate = () => fetchHomeData();
    window.addEventListener('careertrack_application_updated', handleUpdate);
    return () => window.removeEventListener('careertrack_application_updated', handleUpdate);
  }, []);

  const studentName = user?.profile?.fullName || user?.username || 'Student';
  const targetRole = user?.profile?.targetRole || 'Software Engineering / Tech';

  const stats = dashboardData?.stats || {
    totalApplications: 0,
    awaitingResponse: 0,
    interviews: 0,
    offers: 0,
  };

  const upcomingInterviews = dashboardData?.upcomingInterviews || [];
  const recentApplications = dashboardData?.recentApplications || [];
  const activeReminders = dashboardData?.activeReminders || [];
  const skillGapData = dashboardData?.skillGap || {};
  const hasAnalyzableJobs = !!skillGapData.hasAnalyzableJobs;
  const recommendedSkills = skillGapData.recommendedSkills?.slice(0, 4) || [];
  const suggestedRoleSkills = skillGapData.suggestedRoleSkills?.slice(0, 4) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-primary-900 to-purple-900 p-6 sm:p-10 text-white shadow-xl shadow-navy-900/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-primary-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Career Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Welcome back, {studentName}! 👋
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Targeting <strong className="text-white">{targetRole}</strong>. Track your interviews,
            refine your applications, and close skill gaps based on employer job postings.
          </p>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => (openQuickAdd ? openQuickAdd() : navigate('/applications'))}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-navy-900 font-bold text-xs sm:text-sm hover:bg-slate-100 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-primary-600" />
              <span>Add New Application</span>
            </button>
            <button
              onClick={() => navigate('/resume-builder')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600/60 hover:bg-primary-600 border border-primary-400/40 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all hover:-translate-y-0.5"
            >
              <FileEdit className="w-4 h-4" />
              <span>Resume Builder</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>View Full Analytics</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 -mb-20 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Snapshot Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/applications')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Applications
            </span>
            <div className="p-2 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-800 mt-2">
            {stats.totalApplications}
          </h3>
          <p className="text-xs text-primary-600 font-semibold mt-1 flex items-center gap-1">
            <span>Manage pipeline</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        <div
          onClick={() => navigate('/interviews')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Interviews
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-800 mt-2">
            {stats.interviews}
          </h3>
          <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
            <span>{upcomingInterviews.length} upcoming</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        <div
          onClick={() => navigate('/applications')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Awaiting Response
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-800 mt-2">
            {stats.awaitingResponse}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Applied &amp; Assessments</p>
        </div>

        <div
          onClick={() => navigate('/applications')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Offers Received
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-800 mt-2">
            {stats.offers}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {stats.offerRate ? `${stats.offerRate}% conversion` : 'Placement goal'}
          </p>
        </div>
      </div>

      {/* Main Grid: Upcoming Interviews & Recent Applications */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-navy-800 text-base">Upcoming Interviews</h3>
                  <p className="text-xs text-slate-400">Scheduled rounds and video links</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/interviews')}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {upcomingInterviews.map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xs transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-navy-800">
                          {item.application?.company || 'Company'}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">· {item.round}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(item.scheduledDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{item.interviewType}</span>
                      </p>
                    </div>

                    {item.meetingUrl ? (
                      <a
                        href={item.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold transition border border-primary-200"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No link</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-navy-800">No interviews scheduled yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  When you receive an assessment or interview invitation, log it in the Interviews tab.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => navigate('/interviews')}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-600 hover:border-primary-500 hover:text-primary-600 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule an Interview Round</span>
            </button>
          </div>
        </div>

        {/* Recent Applications Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-navy-800 text-base">Recent Applications</h3>
                  <p className="text-xs text-slate-400">Latest pipeline submissions</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/applications')}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app._id}
                    onClick={() => navigate('/applications')}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-navy-800 truncate">{app.company}</h4>
                        <span className="text-xs text-slate-400 truncate">· {app.role}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Applied on {new Date(app.applicationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-navy-800">No applications tracked yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Start tracking your college placements and internships today.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => (openQuickAdd ? openQuickAdd() : navigate('/applications'))}
              className="w-full py-2.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Reminders & Recommended Skills to Learn */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reminders Widget */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-navy-800 text-base">Upcoming Reminders</h3>
                <p className="text-xs text-slate-400">Action items, follow-ups, and prep tasks</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/reminders')}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeReminders.length > 0 ? (
            <div className="space-y-3">
              {activeReminders.map((rem) => (
                <div
                  key={rem._id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-navy-800">{rem.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-primary-600">{rem.type}</span>
                      <span>•</span>
                      <span>Due: {new Date(rem.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/reminders')}
                    className="text-xs font-bold text-slate-600 hover:text-navy-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400 italic">No urgent reminders pending! 🎯</p>
            </div>
          )}
        </div>

        {/* Recommended Skills to Learn Widget */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-navy-800 text-base">
                    {hasAnalyzableJobs ? 'Skills in Demand' : 'Career Goal Skill Roadmap'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {hasAnalyzableJobs
                      ? 'Based on your saved job requirements'
                      : `Recommended foundational skills for ${targetRole}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {hasAnalyzableJobs && recommendedSkills.length > 0 ? (
              <div className="space-y-3">
                {recommendedSkills.map((sk) => (
                  <div
                    key={sk.skill}
                    onClick={() => setSelectedSkillForModal(sk)}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy-800">{sk.skill}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                          {sk.priority} Priority
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {sk.learningStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Requested in {sk.demandCount} of your jobs ({sk.demandPercentage}%)
                      </p>
                    </div>

                    <span className="text-xs font-bold text-primary-600 hover:underline">
                      View Course &rarr;
                    </span>
                  </div>
                ))}
              </div>
            ) : !hasAnalyzableJobs && suggestedRoleSkills.length > 0 ? (
              <div className="space-y-2.5">
                <div className="mb-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600">
                  <span className="font-bold text-primary-800">Add a job description</span> to calculate exact compatibility and live skill gaps. Below are standard recommendations for your career goal:
                </div>
                {suggestedRoleSkills.map((sk) => (
                  <div
                    key={sk.skill}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-800">{sk.skill}</span>
                      {sk.inProfile ? (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          In Profile
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>

                    {sk.resource?.url ? (
                      <a
                        href={sk.resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <span>Learn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 font-medium">
                  Add a job description to analyze your skill gaps.
                </p>
                <button
                  onClick={() => (openQuickAdd ? openQuickAdd() : navigate('/applications'))}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 text-xs font-bold border border-primary-200 hover:bg-primary-100 transition"
                >
                  + Add Application
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skill Gap Modal */}
      {selectedSkillForModal && (
        <SkillGapModal
          isOpen={!!selectedSkillForModal}
          skillItem={selectedSkillForModal}
          onClose={() => setSelectedSkillForModal(null)}
          onSuccess={() => {
            fetchHomeData();
          }}
        />
      )}
    </div>
  );
}
