import React from 'react';
import { UserCheck, QrCode, UserPlus, Bed, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReceptionDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Reception & Check-In Desk</h2>
            <p className="text-xs text-slate-400">Universal Patient Passport Scanner & Room Allocation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/reception/register-patient')}
          className="glass-panel p-6 cursor-pointer hover:border-amber-500/50 transition-all space-y-3"
        >
          <UserPlus className="w-8 h-8 text-amber-400" />
          <h3 className="font-bold text-white text-base">Register New Patient</h3>
          <p className="text-xs text-slate-400">Generate Universal QR Code Passport for walk-in patients.</p>
          <span className="text-xs text-amber-400 font-semibold inline-flex items-center gap-1">Open Form <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>

        <div
          onClick={() => navigate('/reception/qr-scanner')}
          className="glass-panel p-6 cursor-pointer hover:border-amber-500/50 transition-all space-y-3"
        >
          <QrCode className="w-8 h-8 text-amber-400" />
          <h3 className="font-bold text-white text-base">QR Passport Scanner</h3>
          <p className="text-xs text-slate-400">Scan existing QR code to check in and activate appointments.</p>
          <span className="text-xs text-amber-400 font-semibold inline-flex items-center gap-1">Launch Scanner <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>

        <div
          onClick={() => navigate('/reception/emergency-admission')}
          className="glass-panel p-6 cursor-pointer hover:border-rose-500/50 transition-all space-y-3"
        >
          <Bed className="w-8 h-8 text-rose-400" />
          <h3 className="font-bold text-white text-base">Emergency Room Allocation</h3>
          <p className="text-xs text-slate-400">Allocate available rooms and oxygen machinery to critical cases.</p>
          <span className="text-xs text-rose-400 font-semibold inline-flex items-center gap-1">Allocate Resources <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
