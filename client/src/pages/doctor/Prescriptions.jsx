import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';

export const Prescriptions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-slate-400">Loading Prescriptions Roster...</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-teal-400" /> Prescriptions History & Pharmacy Auto-Routing
        </h3>

        <div className="space-y-3">
          {data.queue.map((apt) => (
            <div key={apt._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-white text-sm">{apt.patientName}</h4>
                <p className="text-slate-400 font-mono">Appt #: {apt.appointmentNumber}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full font-bold uppercase ${
                  ['COMPLETED', 'PAID'].includes(apt.status)
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {apt.status === 'PAID' ? 'DISPENSED & PAID' : apt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
