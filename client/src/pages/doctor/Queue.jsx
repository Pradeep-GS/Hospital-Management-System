import React, { useState, useEffect } from 'react';
import { Activity, Unlock, Lock, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const Queue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchQueue = async () => {
    try {
      const res = await api.get('/doctors/dashboard');
      setQueue(res.data.queue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleActivate = async (id) => {
    try {
      await api.post(`/doctors/appointments/${id}/activate`);
      fetchQueue();
      navigate('/doctor/emr');
    } catch (err) {
      alert(err.response?.data?.error || 'Activation failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Patient Queue...</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" /> Patient Queue & EMR Unlock Trigger
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Activating an appointment explicitly opens the <strong>EMR Access Window</strong> for that specific patient.
        </p>

        <div className="space-y-4">
          {queue.map((apt) => {
            const isActive = apt.status === 'ACTIVE';
            const isCheckedIn = apt.status === 'CHECKED_IN';

            return (
              <div
                key={apt._id}
                className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/50 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold ${
                    isActive ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    #{apt.queuePosition}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{apt.patientName}</h4>
                    <p className="text-xs text-slate-400 font-mono">Appt ID: {apt.appointmentNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    isActive ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                    isCheckedIn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {apt.status}
                  </span>

                  {isCheckedIn && (
                    <button
                      onClick={() => handleActivate(apt._id)}
                      className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" /> Activate & Open EMR
                    </button>
                  )}

                  {isActive && (
                    <button
                      onClick={() => navigate('/doctor/emr')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow flex items-center gap-1.5"
                    >
                      Proceed to EMR <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Queue;
