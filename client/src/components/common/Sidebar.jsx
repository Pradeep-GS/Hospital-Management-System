import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope, LayoutDashboard, Calendar, FileText, Pill, Users,
  Building2, QrCode, UserPlus, Bed, Wind, Receipt, Clock,
  Settings, LogOut, ChevronRight, Activity
} from 'lucide-react';

export const Sidebar = () => {
  const { role, user, logout } = useAuth();

  // Role-scoped Navigation Routing
  const getNavItems = () => {
    switch (role) {
      case 'DOCTOR':
        return [
          { label: 'Dashboard Overview', path: '/doctor/dashboard', icon: LayoutDashboard },
          { label: "Today's Queue", path: '/doctor/queue', icon: Clock },
          { label: 'EMR Clinical Window', path: '/doctor/emr', icon: FileText },
          { label: 'Prescriptions Roster', path: '/doctor/prescriptions', icon: Pill },
          { label: 'Profile Settings', path: '/doctor/profile', icon: Settings },
        ];
      case 'PATIENT':
        return [
          { label: 'Patient Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { label: 'Book Appointment', path: '/patient/appointments', icon: Calendar },
          { label: 'EMR Health Records', path: '/patient/emr', icon: FileText },
          { label: 'Billing & Invoices', path: '/patient/bills', icon: Receipt },
          { label: 'Profile Settings', path: '/patient/profile', icon: Settings },
        ];
      case 'RECEPTIONIST':
        return [
          { label: 'Reception Desk', path: '/reception/dashboard', icon: LayoutDashboard },
          { label: 'Register Patient', path: '/reception/register-patient', icon: UserPlus },
          { label: 'Universal QR Scanner', path: '/reception/qr-scanner', icon: QrCode },
          { label: 'Emergency Room Allocation', path: '/reception/emergency-admission', icon: Bed },
          { label: 'Profile Settings', path: '/reception/profile', icon: Settings },
        ];
      case 'HOSPITAL_ADMIN':
        return [
          { label: 'Hospital Overview', path: '/hospital/dashboard', icon: LayoutDashboard },
          { label: 'Staff Management', path: '/hospital/staff', icon: Users },
          { label: 'Rooms & Occupancy', path: '/hospital/rooms', icon: Bed },
          { label: 'Equipment & Wards', path: '/hospital/equipment', icon: Wind },
          { label: 'Oxygen Inventory', path: '/hospital/oxygen', icon: Activity },
          { label: 'Smart Reminder Engine', path: '/hospital/reminders', icon: Clock },
          { label: 'Profile Settings', path: '/hospital/profile', icon: Settings },
        ];
      case 'SYSTEM_ADMIN':
        return [
          { label: 'Platform Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Hospital Onboarding', path: '/admin/hospitals', icon: Building2 },
          { label: 'Smart Reminder Engine', path: '/admin/reminders', icon: Clock },
          { label: 'Profile Settings', path: '/admin/profile', icon: Settings },
        ];
      case 'PHARMACY':
        return [
          { label: 'Pharmacy Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard },
          { label: 'Pending Prescriptions', path: '/pharmacy/prescriptions', icon: Pill },
          { label: 'Medicine Stock', path: '/pharmacy/inventory', icon: Building2 },
          { label: 'AI Inventory Forecast', path: '/pharmacy/inventory-prediction', icon: Activity },
          { label: 'GST Invoicing & Checkout', path: '/pharmacy/billing', icon: Receipt },
          { label: 'Profile Settings', path: '/pharmacy/profile', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 min-h-screen font-['Inter',sans-serif]">
      <div>
        {/* Enterprise Brand Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 tracking-tight leading-none font-['Poppins',sans-serif]">
              AegisCare <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">v1.0</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Enterprise Hospital ERP</p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="p-3.5 space-y-1.5">
          <p className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Portal Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-[#EFF6FF] hover:text-blue-700 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'opacity-30'}`} />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Sidebar User Footer */}
      <div className="p-4 border-t border-[#E2E8F0] space-y-3 bg-white/60">
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-xs shadow-2xs">
          <p className="font-bold text-slate-900 leading-tight">{user?.fullName}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{user?.email}</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
