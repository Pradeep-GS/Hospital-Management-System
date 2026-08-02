import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, FileText, Send, Clock, User } from 'lucide-react';
import api from '../../services/api';
import { Helmet } from 'react-helmet-async';

export const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors/dashboard')
      .then((res) => {
        setPrescriptions(res.data.prescriptions || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Prescriptions...</div>;

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Prescriptions Roster | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Pill className="w-5 h-5 text-blue-600" /> Prescriptions Roster & Pharmacy Dispense Logs
          </h2>
          <p className="text-xs text-slate-500">Track multi-item prescriptions issued to patients and routed to pharmacy</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200">
          Total Prescriptions: {prescriptions.length}
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        {prescriptions.map((presc) => (
          <div key={presc._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" /> {presc.patientName || 'Patient Record'}
                </h3>
                <span className="text-slate-500 font-mono text-[11px]">Date: {new Date(presc.createdAt).toLocaleDateString()}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                presc.dispenseStatus === 'DISPENSED'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {presc.dispenseStatus || 'PENDING'}
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Prescribed Items ({presc.items?.length || 0})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {presc.items?.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">{item.medicineName}</span>
                      <span className="text-[11px] text-slate-500">{item.dosage} | {item.frequency}</span>
                    </div>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      Qty: {item.quantityRequired}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {prescriptions.length === 0 && (
          <div className="text-center text-slate-400 text-xs py-12">
            No prescriptions issued today.
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
