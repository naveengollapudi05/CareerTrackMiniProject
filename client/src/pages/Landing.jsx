import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Check,
  Briefcase,
  Target,
  BarChart3,
  Sparkles,
  Search,
  Rocket,
  Menu,
  X,
  FileText,
  CalendarCheck,
  Bell,
  Shield,
  Layers,
  Clock,
  Award,
  Video,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (id === 'top' || id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* 2. Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Left: Brand with graduation-cap icon */}
          <div
            onClick={() => scrollToSection('top')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-navy-900 block leading-tight">
                CareerTrack
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-600 block">
                STUDENT TRACKER
              </span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('top')}
              className="hover:text-blue-600 transition"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-blue-600 transition"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-blue-600 transition"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-blue-600 transition"
            >
              About
            </button>
          </nav>

          {/* Right: Navigation Actions (Login / Get Started / Dashboard) */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
            <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-700">
              <button
                onClick={() => scrollToSection('top')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-100"
              >
                About
              </button>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={handleDashboardClick}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  className="py-2 rounded-xl border border-slate-200 text-navy-900 font-bold text-xs text-center hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="py-2 rounded-xl bg-slate-100 text-navy-900 font-bold text-xs text-center hover:bg-slate-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section */}
      <section id="top" className="relative pt-12 pb-20 sm:pt-20 sm:pb-24 overflow-hidden">
        {/* Decorative background grid and gradient accents */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-6 text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-extrabold tracking-wider text-blue-700 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>TRACK • ORGANIZE • ANALYZE • GROW</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-navy-900 tracking-tight leading-[1.15]">
                Your Career Journey,{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Organized in One Place.
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Manage job and internship applications, track interview progress, discover the
                skills employers demand, build professional resumes and stay on top of every
                opportunity with CareerTrack.
              </p>

              {/* Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-navy-800 font-bold text-sm sm:text-base border border-slate-200 shadow-sm transition"
                >
                  <span>Login</span>
                </Link>
              </div>

              {/* Benefit statements with green check icons */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Organized application tracking.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Personalized skill insights.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Career preparation in one place.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Dashboard Illustration Preview */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-2xl shadow-navy-900/10 space-y-4 relative z-10">
                {/* Header Window Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="ml-2 text-xs font-bold text-slate-400">
                      Workspace Overview
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                    Live UI Preview
                  </span>
                </div>

                {/* 1. Application summary cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Applications</p>
                    <p className="text-lg font-black text-navy-900 mt-0.5">Pipeline</p>
                    <span className="text-[10px] font-semibold text-blue-600">Active Stage</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Interviews</p>
                    <p className="text-lg font-black text-navy-900 mt-0.5">Scheduled</p>
                    <span className="text-[10px] font-semibold text-amber-600">Video Rounds</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Demanded</p>
                    <p className="text-lg font-black text-navy-900 mt-0.5">Skills</p>
                    <span className="text-[10px] font-semibold text-emerald-600">Ranked by JD</span>
                  </div>
                </div>

                {/* 2. Application Status Chart & 3. Top Demanded Skills Panel */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Status Chart Mockup */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-navy-800">
                      <span>Status Breakdown</span>
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>Applied</span>
                          <span className="text-blue-600">Reviewing</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full w-[70%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>Technical Interview</span>
                          <span className="text-amber-600">Round 1</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full w-[45%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>Offer Received</span>
                          <span className="text-emerald-600">Selected</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[25%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top-demanded-skills Panel */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-navy-800">
                      <span>Employer Demands</span>
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white border border-slate-100">
                        <span className="font-bold text-navy-800">React.js</span>
                        <span className="text-[10px] font-bold text-blue-600">Frequent</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white border border-slate-100">
                        <span className="font-bold text-navy-800">Python</span>
                        <span className="text-[10px] font-bold text-blue-600">Frequent</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white border border-slate-100">
                        <span className="font-bold text-navy-800">SQL</span>
                        <span className="text-[10px] font-bold text-blue-600">Core</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Small Upcoming-Interview Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-900">
                        Technical Interview (Live Coding)
                      </p>
                      <p className="text-[11px] text-slate-500">Upcoming Round · Google Meet</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs">
                    Join Link Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Project Overview Strip */}
      <section className="bg-navy-900 text-white py-12 border-y border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <h3 className="text-xl sm:text-2xl font-black text-blue-400">Application Tracking</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Full Stage Management</p>
            </div>
            <div className="p-3">
              <h3 className="text-xl sm:text-2xl font-black text-blue-400">Career Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time Metrics</p>
            </div>
            <div className="p-3">
              <h3 className="text-xl sm:text-2xl font-black text-blue-400">Skill Analysis</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">JD Keyword Extraction</p>
            </div>
            <div className="p-3">
              <h3 className="text-xl sm:text-2xl font-black text-blue-400">
                Learning Recommendations
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Curated Resources</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Section Introduction */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
              FEATURES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-navy-900 tracking-tight mt-3">
              Everything a Student Needs to Stay on Top of Placements
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
              From the first application to the final offer letter — organized, measurable and
              beautifully visualized.
            </p>
          </div>

          {/* 6 Feature Cards (3-col desktop, 2-col tablet, 1-col mobile) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 — Application Tracking */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Application Tracking</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Log internships and job applications with company, role, location, links, dates,
                statuses and notes.
              </p>
            </div>

            {/* Card 2 — Smart Skill Matching */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Smart Skill Matching</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Compare your existing skills with the requirements of individual job descriptions
                and identify potential skill gaps.
              </p>
            </div>

            {/* Card 3 — Career Analytics */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Career Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Understand application progress through status charts, interview counts, offers and
                recent activity.
              </p>
            </div>

            {/* Card 4 — Skill Library */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Skill Library</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Maintain your technical and soft skills and update your profile as you learn new
                technologies.
              </p>
            </div>

            {/* Card 5 — Skill-Gap Analysis */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Skill-Gap Analysis</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Discover skills requested by your saved job descriptions that are not yet listed in
                your profile.
              </p>
            </div>

            {/* Card 6 — Growth Suggestions */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-pink-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Growth Suggestions</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Explore learning resources for potentially missing skills and keep track of your
                learning progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
              HOW IT WORKS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-navy-900 tracking-tight mt-3">
              Four Simple Steps to a Sharper Job Search
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2.5">
              Follow this structured process to organize applications, prepare interviews and close
              skill gaps.
            </p>
          </div>

          {/* 4 Steps Timeline on Desktop, Stacked on Mobile */}
          <div className="relative">
            {/* Desktop Horizontal Line */}
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-blue-200 -translate-y-8 z-0" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Step 01 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 font-black text-base flex items-center justify-center mb-5 shadow-2xs">
                    01
                  </div>
                  <h3 className="text-base font-bold text-navy-900">Create Your Account</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    Register, log in securely and complete your student profile.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 font-black text-base flex items-center justify-center mb-5 shadow-2xs">
                    02
                  </div>
                  <h3 className="text-base font-bold text-navy-900">Add Your Skills</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    Record your current technical skills, soft skills and career goal.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 font-black text-base flex items-center justify-center mb-5 shadow-2xs">
                    03
                  </div>
                  <h3 className="text-base font-bold text-navy-900">Log Applications</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    Save job and internship details, application links and pasted job descriptions.
                  </p>
                </div>
              </div>

              {/* Step 04 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 font-black text-base flex items-center justify-center mb-5 shadow-2xs">
                    04
                  </div>
                  <h3 className="text-base font-bold text-navy-900">Track and Grow</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    Review your application progress, understand demanded skills and discover
                    learning resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. About and Call-to-Action Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-8 sm:p-14 text-white shadow-2xl shadow-blue-900/20">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold uppercase tracking-wider text-blue-100 border border-white/20">
                  Student Focused
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Built for Students, by Students
                </h2>
                <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl">
                  Spreadsheets become difficult to manage as applications grow. CareerTrack provides
                  one organized workspace for application tracking, skill-gap insights, career
                  analytics, resume preparation, interview scheduling and reminders.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-navy-900 font-bold text-sm shadow-md hover:bg-slate-100 transition"
                  >
                    <span>Start Tracking Now</span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition"
                  >
                    <span>I Already Have an Account</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: 2x2 Translucent Cards */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left space-y-1.5">
                  <Briefcase className="w-5 h-5 text-blue-200" />
                  <h4 className="text-sm font-bold text-white">Full Application Management</h4>
                  <p className="text-[11px] text-blue-200">Track company, roles, dates and notes</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left space-y-1.5">
                  <Target className="w-5 h-5 text-emerald-200" />
                  <h4 className="text-sm font-bold text-white">Skill Matching</h4>
                  <p className="text-[11px] text-blue-200">Compare skills with job descriptions</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left space-y-1.5">
                  <BarChart3 className="w-5 h-5 text-amber-200" />
                  <h4 className="text-sm font-bold text-white">Career Analytics</h4>
                  <p className="text-[11px] text-blue-200">Stage conversions &amp; charts</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left space-y-1.5">
                  <CalendarCheck className="w-5 h-5 text-purple-200" />
                  <h4 className="text-sm font-bold text-white">Resume &amp; Prep</h4>
                  <p className="text-[11px] text-blue-200">Interviews, reminders and ATS PDF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-navy-900 text-slate-400 py-12 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pb-10 border-b border-navy-800">
            {/* Brand Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-white">CareerTrack</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                A student career-management workspace for organizing applications, analyzing skills
                and preparing for opportunities.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="hover:text-white transition"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-white transition"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={handleDashboardClick} className="hover:text-white transition">
                    Dashboard
                  </button>
                </li>
              </ul>
            </div>

            {/* Account Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Account
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/login" className="hover:text-white transition">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="hover:text-white transition">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Line */}
          <div className="pt-8 text-center sm:text-left text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>CareerTrack — Student Job &amp; Internship Management System</p>
            <p>© 2026 CareerTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
