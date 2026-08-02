import React, { useState, useEffect } from 'react';
import { User, KeyRound, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loginLogs, setLoginLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProfile = async () => {
    try {
      const [pRes, lRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/auth/login-history')
      ]);
      setProfileData(pRes.data.user);
      setLoginLogs(lRes.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      return setErrorMsg('New password and confirm password do not match.');
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      setSuccessMsg('✅ Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Password update failed.');
    }
  };

  if (loading || !profileData) return <div className="p-8 text-center text-slate-400">Loading Profile...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-xs">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Basic Details & Login Logs */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Profile Card */}
          <div className="glass-panel p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-xl font-bold text-slate-950 mx-auto shadow-md">
              {profileData.fullName?.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{profileData.fullName}</h3>
              <p className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">{profileData.role}</p>
            </div>
            <div className="pt-2 text-left space-y-2 border-t border-slate-800">
              <div>
                <span className="text-slate-500 block">Email Address</span>
                <span className="text-slate-200 font-semibold">{profileData.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone Number</span>
                <span className="text-slate-200 font-mono">{profileData.phone || 'Not Specified'}</span>
              </div>
              {profileData.employeeId && (
                <div>
                  <span className="text-slate-500 block">Employee ID</span>
                  <span className="text-slate-200 font-mono font-bold text-teal-400">{profileData.employeeId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Login History */}
          <div className="glass-panel p-5 space-y-3">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" /> Session History
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {loginLogs.map((log) => (
                <div key={log._id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-300 font-mono text-[10px]">{log.ipAddress}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.loginTime).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{log.browser}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Change Password */}
        <div className="md:col-span-7 glass-panel p-6 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <KeyRound className="w-4 h-4 text-teal-400" /> Security Settings — Update Password
          </h3>

          {successMsg && (
            <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-950 border border-rose-600 text-rose-200 p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">New Password</label>
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
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
