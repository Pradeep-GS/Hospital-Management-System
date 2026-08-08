import React from 'react';
import { NavLink } from 'react-router-dom';
import { QrCode, Calendar, FileText, Receipt, Sparkles } from 'lucide-react';

export const MobileBottomNav = ({ onOpenCopilot }) => {
  const navItems = [
    { to: '/patient/dashboard', label: 'Passport', icon: QrCode },
    { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/patient/emr', label: 'EMR Records', icon: FileText },
    { to: '/patient/bills', label: 'Billing', icon: Receipt },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-blue-400 font-bold bg-blue-500/10 scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}

        {/* Quick Copilot AI Floating Button on Bottom Nav */}
        <button
          onClick={onOpenCopilot}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-teal-400 hover:text-teal-300 font-bold transition-all duration-200 active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-teal-300 mt-0.5">AI Copilot</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
