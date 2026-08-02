import React from 'react';
import { FileText, ShieldCheck, Activity, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';

export const EMR = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-4xl mx-auto font-['Inter',sans-serif]">
      <Helmet>
        <title>EMR Health Records | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <FileText className="w-5 h-5 text-blue-600" /> Electronic Medical Records (EMR Vault)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Your medical records are encrypted and protected. Doctors can only view your EMR during an ACTIVE appointment.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Consultation Record — Tension Headache with Aura</h4>
              <p className="text-slate-500 mt-0.5">Attending Physician: <strong className="text-slate-800">Dr. Gregory House</strong> | {user?.hospitalName || 'Metro General Hospital'}</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold border border-emerald-200 text-[10px]">
              HIPAA Verified Record
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-slate-700">
            <div><span className="text-slate-400 block text-[10px] uppercase font-semibold">Blood Pressure</span> <strong className="text-slate-900 text-sm font-mono">120/80</strong></div>
            <div><span className="text-slate-400 block text-[10px] uppercase font-semibold">Heart Rate</span> <strong className="text-blue-600 text-sm font-mono">72 bpm</strong></div>
            <div><span className="text-slate-400 block text-[10px] uppercase font-semibold">Body Temp</span> <strong className="text-slate-900 text-sm font-mono">36.8 °C</strong></div>
            <div><span className="text-slate-400 block text-[10px] uppercase font-semibold">SpO2 Oxygen</span> <strong className="text-emerald-600 text-sm font-mono">98%</strong></div>
          </div>

          <p className="text-slate-700 pt-1 leading-relaxed">
            <strong className="text-slate-900">Doctor Clinical Notes:</strong> Patient advised rest, hydration, and prescribed Sumatriptan & Paracetamol 500mg.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EMR;
