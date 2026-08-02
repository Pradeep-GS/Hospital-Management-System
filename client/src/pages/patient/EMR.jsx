import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EMR = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-400" /> Electronic Medical Record (EMR) Vault
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Your medical records are encrypted and protected. Doctors can only view your EMR during an ACTIVE appointment.
        </p>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-white text-sm">Consultation Record — Tension Headache with Aura</h4>
              <p className="text-slate-400">Dr. Gregory House | {user?.hospitalName || 'Partner Facility'}</p>
            </div>
            <span className="bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-full font-semibold border border-emerald-800">
              Verified Log
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
            <div><span className="text-slate-500 block">BP</span> 120/80</div>
            <div><span className="text-slate-500 block">Heart Rate</span> 72 bpm</div>
            <div><span className="text-slate-500 block">Temp</span> 36.8 °C</div>
            <div><span className="text-slate-500 block">SpO2</span> 98%</div>
          </div>

          <p className="text-slate-300 pt-2">
            <strong>Notes:</strong> Patient advised rest, hydration, and prescribed Sumatriptan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EMR;
