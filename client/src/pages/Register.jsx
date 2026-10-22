import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, ArrowRight, Loader2, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    targetRole: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) {
      errs.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const { confirmPassword, ...registrationPayload } = formData;
    const res = await register(registrationPayload);
    setSubmitting(false);

    if (res.success) {
      navigate('/');
    } else if (res.message) {
      const serverErrs = { form: res.message };
      if (res.message.toLowerCase().includes('email')) {
        serverErrs.email = res.message;
      }
      if (res.message.toLowerCase().includes('username')) {
        serverErrs.username = res.message;
      }
      setErrors(serverErrs);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Back to Home Link */}
      <div className="max-w-md w-full mb-3 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-block group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md shadow-primary-500/20 mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-800 tracking-tight">
            Create CareerTrack Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track applications, discover skill gaps, and manage student placements
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          {errors.form && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              <p>{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, username: e.target.value }));
                    if (errors.username) setErrors((p) => ({ ...p, username: '', form: '' }));
                  }}
                  placeholder="Choose a username"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.username ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-white'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, email: e.target.value }));
                    if (errors.email) setErrors((p) => ({ ...p, email: '', form: '' }));
                  }}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-white'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password & Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, password: e.target.value }));
                    if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                  }}
                  placeholder="Create a password (min 6 characters)"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-white'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, confirmPassword: e.target.value }));
                    if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
                  }}
                  placeholder="Re-enter your password to confirm"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.confirmPassword
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Optional Profile Info */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData((p) => ({ ...p, targetRole: e.target.value }))}
                  placeholder="e.g. SDE Intern"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{submitting ? 'Creating Account...' : 'Register Account'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 text-center">
            <p>
              Already registered?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
