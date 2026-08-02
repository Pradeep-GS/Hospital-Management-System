import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Inter',sans-serif]">
      <Helmet>
        <title>403 Unauthorized | AegisCare ERP</title>
      </Helmet>

      <div className="max-w-md w-full bg-white border border-rose-200 p-8 text-center space-y-5 rounded-3xl shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Poppins',sans-serif]">403 — Unauthorized Access</h2>
          <p className="text-xs text-slate-500">
            Your current role <span className="font-mono text-rose-600 font-bold">[{role || 'UNAUTHENTICATED'}]</span> does not have authorization to view this protected resource.
          </p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>Logged User: <strong>{user?.fullName || 'Guest'}</strong></span>
          <Lock className="w-4 h-4 text-rose-500" />
        </div>

        <button
          onClick={handleReturn}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Return to My Portal Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
