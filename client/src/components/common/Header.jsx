import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, Building2, ChevronDown, Search, ShieldCheck, User, KeyRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Header = ({ title = 'Dashboard' }) => {
  const { user, role, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'SYSTEM_ADMIN': return { label: 'System Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'HOSPITAL_ADMIN': return { label: 'Hospital Admin', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'DOCTOR': return { label: 'Doctor', color: 'bg-teal-100 text-teal-700 border-teal-200' };
      case 'RECEPTIONIST': return { label: 'Reception Desk', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'PATIENT': return { label: 'Patient Portal', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'PHARMACY': return { label: 'Pharmacy & Billing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      default: return { label: r || 'User', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge(role);
  const pathParts = location.pathname.split('/').filter(Boolean);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    alert(`🔍 Global Search Query: "${globalSearch}" — Filtering records across Patients, Doctors, and Inventory.`);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-xs">
      
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex items-center gap-6">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5 font-medium">
            <span className="text-slate-600 hover:text-slate-900 cursor-pointer" onClick={() => navigate('/')}>AegisCare ERP</span>
            {pathParts.map((part, index) => (
              <React.Fragment key={index}>
                <span>/</span>
                <span className={`capitalize ${index === pathParts.length - 1 ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>
                  {part}
                </span>
              </React.Fragment>
            ))}
          </nav>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden lg:block flex-1 max-w-md mx-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Global search patients, doctors, queue, medicines, rooms..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all shadow-xs"
          />
          <kbd className="hidden sm:inline-block absolute right-3 top-2.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 rounded shadow-2xs">⌘K</kbd>
        </form>
      </div>

      {/* Right: Facility, Role, Notifications & User Chip */}
      <div className="flex items-center gap-3.5">
        
        {/* Hospital Facility Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs shadow-2xs">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-blue-950 font-bold">{user?.hospitalName || 'Facility Center'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Role Badge */}
        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase border shadow-2xs ${badge.color}`}>
          {badge.label}
        </span>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Notifications</h4>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Live Alerts</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-blue-50/50 transition-colors">
                  <p className="text-slate-800 font-semibold">EMR Access Window Verified</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Session token encrypted via AES-256 JWT claim</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-blue-50/50 transition-colors">
                  <p className="text-slate-800 font-semibold">Hospital Data Isolation Active</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Facility scope: {user?.hospitalName || 'Primary Tenant'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user ? user.fullName?.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden sm:block pr-1">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user ? user.fullName : 'User'}</p>
              <p className="text-[10px] text-slate-500 font-mono">{user ? user.email : ''}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-slate-500" /> View Profile & Settings
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/force-change-password');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <KeyRound className="w-4 h-4 text-slate-500" /> Security & Password
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
