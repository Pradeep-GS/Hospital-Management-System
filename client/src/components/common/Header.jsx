import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Bell, User, LogOut, ShieldCheck, Building2, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Header = ({ title = 'Dashboard' }) => {
  const { user, role, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'SYSTEM_ADMIN': return { label: 'System Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'HOSPITAL_ADMIN': return { label: 'Hospital Admin', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'DOCTOR': return { label: 'Doctor', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      case 'RECEPTIONIST': return { label: 'Receptionist', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'PATIENT': return { label: 'Patient Portal', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'PHARMACY': return { label: 'Pharmacy & Billing', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default: return { label: r, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const badge = getRoleBadge(role);

  // Generate breadcrumb path
  const pathParts = location.pathname.split('/').filter(Boolean);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
      {/* Left: Breadcrumbs & Page Title */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
          <span className="hover:text-slate-200 capitalize font-medium">AegisCare</span>
          {pathParts.map((part, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              <span className={`capitalize ${index === pathParts.length - 1 ? 'text-teal-400 font-semibold' : ''}`}>
                {part}
              </span>
            </React.Fragment>
          ))}
        </nav>
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Hospital Facility Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <Building2 className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-300 font-medium">{user?.hospitalName || 'Facility Center'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Role Badge */}
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${badge.color}`}>
          {badge.label}
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 space-y-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">System Alerts</h4>
                <span className="text-[10px] text-teal-400 font-mono">Real-time</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <p className="text-slate-200 font-medium">EMR Audit Window Active</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Logged session verified via JWT claim</p>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <p className="text-slate-200 font-medium">Multi-tenant Isolation Verified</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Hospital ID scoped to current session</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
              {user ? user.fullName?.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">{user ? user.fullName : 'User'}</p>
              <p className="text-[10px] text-slate-400">{user ? user.email : ''}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
              <div className="p-2.5 border-b border-slate-800 mb-1">
                <p className="text-xs font-bold text-white">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 font-mono">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
