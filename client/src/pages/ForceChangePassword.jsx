import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export const ForceChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setErrorMsg('New password and confirm password do not match.');
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      setSuccess('✅ Password changed successfully! Redirecting you to login...');
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full glass-panel-accent p-8 space-y-6 relative z-10 text-xs">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Security Credentials Verification</h1>
          <p className="text-slate-400">You must change your default password before proceeding</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-950 border border-rose-600 text-rose-200 p-3 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-1">Current Default Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Choose New Secure Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-extrabold py-3 rounded-xl text-xs transition-all shadow-lg"
            >
              {loading ? 'Updating Password...' : 'Save & Login with New Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForceChangePassword;
