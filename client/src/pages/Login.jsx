import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Lock, Mail, AlertTriangle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('house@metrohospital.org');
  const [password, setPassword] = useState('doc123');
  
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleRoleRedirect = (user) => {
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Background Subtle Gradient Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel-accent p-8 relative z-10 space-y-6 text-xs">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-teal-500/20">
            <Stethoscope className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            AegisCare Enterprise
          </h1>
          <p className="text-xs text-slate-400">Multi-Tenant Hospital Management Platform</p>
        </div>

        {error && (
          <div className="bg-rose-950/80 border border-rose-600 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Login ID / Username (Email)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="hover:text-white cursor-pointer font-semibold">Forgot Password?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
