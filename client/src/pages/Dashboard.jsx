import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CalendarCheck,
  Award,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ContributingAppsModal from '../components/ContributingAppsModal';
import SkillGapModal from '../components/SkillGapModal';
import ApplicationModal from '../components/ApplicationModal';
import StatusBadge from '../components/StatusBadge';

const STATUS_COLORS = {
  Applied: '#3B82F6',
  Assessment: '#6366F1',
  Interview: '#F59E0B',
  Offer: '#10B981',
  Rejected: '#EF4444',
  Withdrawn: '#94A3B8',
};

export default function Dashboard() {
  const { user, addSkill, removeSkill, showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedSkillContributing, setSelectedSkillContributing] = useState(null);
  const [selectedSkillGap, setSelectedSkillGap] = useState(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    try {
      setIsAddingSkill(true);
      await addSkill(newSkillInput.trim());
      setNewSkillInput('');
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to add skill', 'error');
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleQuickRemoveSkill = async (skillName) => {
    try {
      await removeSkill(skillName);
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to remove skill', 'error');
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleUpdate = () => fetchDashboardData();
    window.addEventListener('careertrack_application_updated', handleUpdate);
    return () => window.removeEventListener('careertrack_application_updated', handleUpdate);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Calculating database metrics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const statusDistribution = (data?.statusDistribution || []).filter((item) => item.count > 0);
  const topDemandedSkills = data?.topDemandedSkills || [];
  const skillGap = data?.skillGap || {};
  const recommendedSkills = skillGap?.recommendedSkills || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-800 tracking-tight">
          Performance Dashboard &amp; Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Live statistics, pipeline status breakdown, and job-demand skill intelligence
        </p>
      </div>

      {/* 6 Core Database Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Apps"
          value={stats.totalApplications || 0}
          icon={Briefcase}
          color="indigo"
          subtext="Logged in DB"
        />
        <StatCard
          title="Applied"
          value={stats.applied || 0}
          icon={Clock}
          color="blue"
          subtext="Initial Stage"
        />
        <StatCard
          title="Awaiting Resp."
          value={stats.awaitingResponse || 0}
          icon={Layers}
          color="purple"
          subtext="Applied & Assess"
        />
        <StatCard
          title="Interviews"
          value={stats.interviews || 0}
          icon={CalendarCheck}
          color="amber"
          subtext={`${stats.responseRate || 0}% Response`}
        />
        <StatCard
          title="Offers"
          value={stats.offers || 0}
          icon={Award}
          color="emerald"
          subtext={`${stats.offerRate || 0}% Conversion`}
        />
        <StatCard
          title="Rejections"
          value={stats.rejected || 0}
          icon={XCircle}
          color="rose"
          subtext="Learning Curve"
        />
      </div>

      {/* Charts Row: Application Status Donut + Recent Activity */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-navy-800 text-base">Application Status</h3>
                <p className="text-xs text-slate-400">Distribution across career stages</p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {stats.totalApplications || 0} Total
              </span>
            </div>

            {statusDistribution.length > 0 ? (
              <div className="h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {statusDistribution.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || '#6366F1'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} application(s)`, name]}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                <Layers className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">No applications logged yet.</p>
              </div>
            )}
          </div>

          {/* Status Breakdown Legend Chips */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
            {Object.keys(STATUS_COLORS).map((status) => {
              const count =
                statusDistribution.find((s) => s.status === status)?.count ||
                (stats[status.toLowerCase()] || 0);
              return (
                <div key={status} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[status] }}
                    />
                    <span className="text-slate-600 font-medium">{status}</span>
                  </div>
                  <span className="font-bold text-navy-800">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Demanded Skills in User's Applications (Requirement 8) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-navy-800 text-base">
                    Top Demanded Skills Analysis
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-[10px] font-bold border border-primary-200">
                    Live Analyzer
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Extracted from your saved job descriptions · Click any skill to view contributing jobs
                </p>
              </div>
            </div>

            {topDemandedSkills.length > 0 ? (
              <div className="space-y-3 mt-4">
                {topDemandedSkills.slice(0, 6).map((item) => (
                  <div
                    key={item.skill}
                    onClick={() => setSelectedSkillContributing(item)}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary-200 hover:shadow-xs transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-800 text-sm group-hover:text-primary-600 transition">
                          {item.skill}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({item.count} app{item.count > 1 ? 's' : ''})
                        </span>
                      </div>
                      <span className="font-extrabold text-primary-600 flex items-center gap-1">
                        <span>{item.percentage}% of applications</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition" />
                      </span>
                    </div>

                    {/* Horizontal Bar Visualizer */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-600 to-purple-600 transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(8, item.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-navy-800">No skill data available yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Paste job descriptions into your applications or tag required skills to generate live demand rankings.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-400 italic">
            * Note: This measures demand strictly across your saved job descriptions, not overall external market data.
          </div>
        </div>
      </div>

      {/* Skill Gap Analysis & Learning Recommendations (Requirement 9) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-800">
                Skill Gap Analysis &amp; Learning Roadmap
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {skillGap.hasAnalyzableJobs
                ? `Comparing your profile skills (${skillGap.profileSkillsCount || 0}) with skills requested across ${skillGap.matchableAppsCount || 0} analyzed job posting(s)`
                : `Profile skills: ${skillGap.profileSkillsCount || 0} · No job descriptions or requirements analyzed yet`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-primary-50 border border-primary-200 text-center min-w-[150px]">
              <span className="block text-[10px] font-black uppercase tracking-wider text-primary-600">
                Avg. Job Compatibility
              </span>
              {skillGap.hasAnalyzableJobs && skillGap.averageMatchScore !== null ? (
                <span className="text-xl font-black text-primary-700">
                  {skillGap.averageMatchScore}%
                </span>
              ) : (
                <span
                  className="text-xs font-bold text-slate-500 block mt-0.5"
                  title="Add job requirements to calculate compatibility"
                >
                  Not enough data
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Skills vs Missing Skills Comparison */}
        <div className="mt-6 grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Skills in User Profile with quick add & remove */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Skills in Your Profile ({skillGap.profileSkills?.length || 0})</span>
                </h4>
              </div>

              {skillGap.profileSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skillGap.profileSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy-800 shadow-2xs group hover:border-slate-300 transition"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => handleQuickRemoveSkill(sk)}
                        className="text-slate-400 hover:text-rose-500 transition"
                        title={`Remove ${sk} from profile`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No skills added to profile yet. Add your technical competencies below or in Settings.
                </p>
              )}
            </div>

            {/* Quick Add Profile Skill */}
            <form onSubmit={handleQuickAddSkill} className="mt-4 pt-3 border-t border-slate-200/70 flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add skill (e.g. Python, SQL)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-navy-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={isAddingSkill || !newSkillInput.trim()}
                className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Missing Skills Ranked by Demand OR Helpful Empty State */}
          {!skillGap.hasAnalyzableJobs ? (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-primary-100 text-primary-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-extrabold text-navy-800">
                    Add a job description to analyze your skill gaps.
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  CareerTrack compares your existing profile skills with employer requirements from saved job postings and application descriptions to identify skill gaps and calculate compatibility.
                </p>

                <div className="mt-3.5 p-3 rounded-xl bg-white/80 border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">💡 Two ways to add requirements:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-500">
                    <li>Paste full job descriptions for automatic keyword extraction.</li>
                    <li>Enter required skills manually when logging or editing each application.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Application</span>
                </button>
                <span className="text-[11px] font-semibold text-primary-700">
                  Add job requirements to calculate compatibility
                </span>
              </div>
            </div>
          ) : recommendedSkills.length > 0 ? (
            <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/60 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-500" />
                  <span>Identified Skill Gaps ({recommendedSkills.length})</span>
                </h4>

                <div className="space-y-3">
                  {recommendedSkills.slice(0, 5).map((item) => (
                    <div
                      key={item.skill}
                      onClick={() => setSelectedSkillGap(item)}
                      className="p-3.5 rounded-xl bg-white border border-rose-100 hover:border-rose-300 shadow-2xs hover:shadow-xs transition flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-navy-800 text-sm">{item.skill}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              item.priority === 'High'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {item.priority} Priority
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {item.learningStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Requested in {item.demandCount} of your jobs ({item.demandPercentage}%) &bull; Course: {item.resource?.title || 'Interactive Guides'}
                        </p>
                      </div>

                      <span className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1 shrink-0 ml-2">
                        <span>Learn</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center flex flex-col items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-navy-800">You have all the required skills! 🎉</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Every skill requested across your {skillGap.matchableAppsCount} analyzed application(s) matches a skill in your profile.
              </p>
            </div>
          )}
        </div>

        {/* Suggested Skills for Career Goal (Requirement 8 - Optional Enhancement) */}
        {!skillGap.hasAnalyzableJobs && skillGap.suggestedRoleSkills?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-navy-800">
                    Suggested Skills for Your Career Goal
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-[10px] font-bold">
                    {skillGap.targetRole}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  General role-based recommendations for your target career goal — not skill gaps derived from actual job descriptions.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skillGap.suggestedRoleSkills.map((item) => (
                <div
                  key={item.skill}
                  className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                    item.inProfile
                      ? 'bg-emerald-50/40 border-emerald-200/70'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-primary-200 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-2">
                    <span className="font-bold text-xs text-navy-900">{item.skill}</span>
                    {item.inProfile ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>In Profile</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                        {item.learningStatus || 'Recommended'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    {item.resource?.url ? (
                      <a
                        href={item.resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-bold inline-flex items-center gap-1"
                      >
                        <span>Course</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span />
                    )}

                    {!item.inProfile && (
                      <button
                        type="button"
                        onClick={async () => {
                          await addSkill(item.skill);
                          fetchDashboardData();
                        }}
                        className="text-primary-600 hover:text-primary-800 font-bold text-[11px]"
                      >
                        + Add to Profile
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedSkillContributing && (
        <ContributingAppsModal
          isOpen={!!selectedSkillContributing}
          skillData={selectedSkillContributing}
          onClose={() => setSelectedSkillContributing(null)}
        />
      )}

      {selectedSkillGap && (
        <SkillGapModal
          isOpen={!!selectedSkillGap}
          skillItem={selectedSkillGap}
          onClose={() => setSelectedSkillGap(null)}
          onSuccess={() => fetchDashboardData()}
        />
      )}

      {/* Application Modal */}
      {isAppModalOpen && (
        <ApplicationModal
          isOpen={isAppModalOpen}
          onClose={() => setIsAppModalOpen(false)}
          onSuccess={() => {
            setIsAppModalOpen(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
