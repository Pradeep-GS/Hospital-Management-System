import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleReturn = () => {
    switch (role) {
      case 'SYSTEM_ADMIN': return navigate('/admin/dashboard');
      case 'HOSPITAL_ADMIN': return navigate('/hospital/dashboard');
      case 'DOCTOR': return navigate('/doctor/dashboard');
      case 'RECEPTIONIST': return navigate('/reception/dashboard');
      case 'PATIENT': return navigate('/patient/dashboard');
      case 'PHARMACY': return navigate('/pharmacy/dashboard');
      default: return navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full glass-panel p-8 text-center space-y-5 border-rose-500/40">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400 animate-pulse">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">403 — Unauthorized Access</h2>
          <p className="text-xs text-slate-400">
            Your current role <span className="font-mono text-rose-300 font-bold">[{role || 'UNAUTHENTICATED'}]</span> does not have authorization to view this protected resource.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Logged User: {user?.fullName || 'Guest'}</span>
          <Lock className="w-4 h-4 text-rose-400" />
        </div>

        <button
          onClick={handleReturn}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to My Portal Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
