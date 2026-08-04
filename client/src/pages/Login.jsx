import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2, Building2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export const Login = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleRoleRedirect = (user) => {
    toast.success(`Welcome back, ${user.fullName}! Redirecting to portal...`);
    if (user.mustChangePassword) {
      return navigate('/force-change-password');
    }
    switch (user.role) {
      case 'SYSTEM_ADMIN': return navigate('/admin/dashboard');
      case 'HOSPITAL_ADMIN': return navigate('/hospital/dashboard');
      case 'DOCTOR': return navigate('/doctor/dashboard');
      case 'RECEPTIONIST': return navigate('/reception/dashboard');
      case 'PATIENT': return navigate('/patient/dashboard');
      case 'PHARMACY': return navigate('/pharmacy/dashboard');
      default: return navigate('/unauthorized');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login(email, password, '');
    if (res.success) {
      handleRoleRedirect(res.user);
    } else {
      setError(res.error);
      toast.error(res.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-['Inter',sans-serif]">
      <Helmet>
        <title>Sign In | AegisCare Enterprise ERP</title>
      </Helmet>

      {/* LEFT SIDE: Enterprise Medical Illustration & Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-12 text-white flex-col justify-between relative overflow-hidden">
        
        {/* Background Decorative Waves & Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl tracking-tight text-white leading-none">
              AegisCare <span className="text-xs text-blue-200 font-mono font-medium ml-1">Enterprise</span>
            </h2>
            <p className="text-xs text-blue-200/80">Multi-Tenant Hospital Management Platform</p>
          </div>
        </div>

        {/* Hero Illustration & Description */}
        <div className="relative z-10 space-y-8 my-auto max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
            <ShieldCheck className="w-4 h-4 text-teal-300" /> HIPAA Compliant Multi-Facility ERP Engine
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight font-['Poppins',sans-serif]">
            Streamlined Healthcare Workflow & Clinical Intelligence
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed">
            Unified digital operating system for hospital administrators, doctors, receptionists, pharmacists, and patients with real-time queue management, EMR vitals recording, and multi-tenant security.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Real-Time Patient Queue</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
              <span>EMR & Clinical Vitals</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Universal QR Scanner</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Pharmacy & GST Invoicing</span>
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-blue-200 font-medium">
          <div className="flex items-center gap-6">
            <span>⚡ 99.9% Platform Uptime</span>
            <span>🏥 Multi-Tenant Isolation</span>
          </div>
          <span>v1.0 Release</span>
        </div>
      </div>

      {/* RIGHT SIDE: Modern Light Login Card Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="max-w-md w-full bg-white border border-slate-200/80 p-8 md:p-10 rounded-3xl shadow-xl space-y-6">
          
          {/* Card Header Logo & Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-md shadow-blue-600/20 text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Poppins',sans-serif]">
              Sign In to Portal
            </h2>
            <p className="text-xs text-slate-500">Enter your credentials to access your hospital portal</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Login ID Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Login ID / Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => toast.info('Please contact your Hospital Administrator to reset your password.')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Authenticating Session...
                </span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              © 2026 AegisCare Enterprise Platform. All rights reserved.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
