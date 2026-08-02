import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope, LayoutDashboard, Calendar, FileText, Pill, Users,
  Building2, QrCode, UserPlus, ShieldAlert, Bed, Wind, Receipt, Clock,
  Settings, LogOut, ChevronRight
} from 'lucide-react';

export const Sidebar = () => {
  const { role, user, logout } = useAuth();

  // Define Navigation Items based on user role
  const getNavItems = () => {
    switch (role) {
      case 'DOCTOR':
        return [
          { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { label: "Today's Queue", path: '/doctor/queue', icon: Clock },
          { label: 'EMR Window', path: '/doctor/emr', icon: FileText },
          { label: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
          { label: 'Profile Settings', path: '/doctor/profile', icon: Settings },
        ];
      case 'PATIENT':
        return [
          { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { label: 'Book Appointment', path: '/patient/appointments', icon: Calendar },
          { label: 'EMR Records', path: '/patient/emr', icon: FileText },
          { label: 'Billing & Invoices', path: '/patient/bills', icon: Receipt },
          { label: 'Profile Settings', path: '/patient/profile', icon: Settings },
        ];
      case 'RECEPTIONIST':
        return [
          { label: 'Dashboard', path: '/reception/dashboard', icon: LayoutDashboard },
          { label: 'Register Patient', path: '/reception/register-patient', icon: UserPlus },
          { label: 'QR Passport Scanner', path: '/reception/qr-scanner', icon: QrCode },
          { label: 'Emergency Room Allocation', path: '/reception/emergency-admission', icon: Bed },
          { label: 'Profile Settings', path: '/reception/profile', icon: Settings },
        ];
      case 'HOSPITAL_ADMIN':
        return [
          { label: 'Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
          { label: 'Staff Management', path: '/hospital/staff', icon: Users },
          { label: 'Rooms & Occupancy', path: '/hospital/rooms', icon: Bed },
          { label: 'Equipment & Wards', path: '/hospital/equipment', icon: Wind },
          { label: 'Oxygen Inventory', path: '/hospital/oxygen', icon: Clock },
          { label: 'Profile Settings', path: '/hospital/profile', icon: Settings },
        ];
      case 'SYSTEM_ADMIN':
        return [
          { label: 'Platform Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Hospital Onboarding', path: '/admin/hospitals', icon: Building2 },
          { label: 'Profile Settings', path: '/admin/profile', icon: Settings },
        ];
      case 'PHARMACY':
        return [
          { label: 'Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard },
          { label: 'Pending Prescriptions', path: '/pharmacy/prescriptions', icon: Pill },
          { label: 'Medicine Stock', path: '/pharmacy/inventory', icon: Building2 },
          { label: 'GST Invoicing & Checkout', path: '/pharmacy/billing', icon: Receipt },
          { label: 'Profile Settings', path: '/pharmacy/profile', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Stethoscope className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white tracking-tight leading-none">
              AegisCare <span className="text-[10px] text-teal-400 font-mono">v1.0</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Enterprise Hospital SaaS</p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="p-3 space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-teal-300 border border-teal-500/30 font-bold shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-40" />
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <p className="font-bold text-white leading-tight">{user?.fullName}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{user?.email}</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
