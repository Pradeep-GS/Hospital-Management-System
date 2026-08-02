import React, { useState, useEffect } from 'react';
import { Stethoscope, Activity, Users, Clock, FileText, CheckCircle2, Lock, Unlock, AlertCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/doctors/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Real-time synchronization: poll dashboard data every 4 seconds
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-slate-400">Loading Doctor Dashboard...</div>;

  const activeApt = data.queue.find((a) => a.status === 'ACTIVE');
  const waitingApts = data.queue.filter((a) => a.status === 'CHECKED_IN');
  const bookedApts = data.queue.filter((a) => a.status === 'BOOKED');
  const completedApts = data.queue.filter((a) => ['COMPLETED', 'PAID'].includes(a.status));
  const cancelledApts = data.queue.filter((a) => a.status === 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Welcome, {data.doctor.name}</h2>
            <p className="text-xs text-slate-400">Internal Medicine & Diagnostics | Clinic 302</p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
          <Clock className="w-4 h-4 text-teal-400" />
          <div>
            <span className="text-slate-500 block">Logged Session Active</span>
            <span className="font-mono text-slate-200 font-bold">{new Date(data.doctor.lastLogin).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Current Patient</span>
          <p className="text-sm font-bold text-emerald-400 mt-2 truncate flex items-center gap-1.5">
            <Unlock className="w-4 h-4" />
            {activeApt ? activeApt.patientName : 'No Active Patient'}
          </p>
        </div>
        <div className="glass-panel p-5 border-amber-500/30">
          <span className="text-xs font-semibold text-amber-400 uppercase">Waiting Queue</span>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">{waitingApts.length}</p>
        </div>
        <div className="glass-panel p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Completed Consultations</span>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">{completedApts.length}</p>
        </div>
        <div className="glass-panel p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Cancelled Appointments</span>
          <p className="text-3xl font-extrabold text-rose-500 mt-1">{cancelledApts.length}</p>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Waiting Queue & Current Active */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5 text-teal-400" />
            Live Waiting Queue ({waitingApts.length})
          </h3>

          <div className="space-y-3">
            {activeApt && (
              <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-950/20 flex items-center justify-between text-xs ring-2 ring-emerald-500/30">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                    ★
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">CURRENT: {activeApt.patientName}</h4>
                    <span className="text-emerald-400 font-mono">{activeApt.appointmentNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/doctor/emr')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  View EMR & Vitals
                </button>
              </div>
            )}

            {waitingApts.map((apt) => (
              <div key={apt._id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                    #{apt.queuePosition}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{apt.patientName}</h4>
                    <span className="text-slate-400 font-mono">{apt.appointmentNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/doctor/queue')}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  Activate
                </button>
              </div>
            ))}

            {waitingApts.length === 0 && !activeApt && (
              <p className="text-center text-slate-500 text-xs py-8">No waiting patients in queue.</p>
            )}
          </div>
        </div>

        {/* Booked / Completed / Cancelled History */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-5 h-5 text-purple-400" />
            Today's Appointments Roster
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {completedApts.map((apt) => (
              <div key={apt._id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center justify-between text-xs opacity-60">
                <div>
                  <h4 className="font-bold text-slate-300">{apt.patientName}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">{apt.appointmentNumber}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-900">
                  COMPLETED
                </span>
              </div>
            ))}

            {bookedApts.map((apt) => (
              <div key={apt._id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{apt.patientName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{apt.appointmentNumber}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                  BOOKED (ONLINE)
                </span>
              </div>
            ))}

            {cancelledApts.map((apt) => (
              <div key={apt._id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-900 flex items-center justify-between text-xs opacity-40">
                <div>
                  <h4 className="font-bold text-slate-500">{apt.patientName}</h4>
                  <p className="text-[10px] text-slate-600 font-mono">{apt.appointmentNumber}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-950 text-rose-300">
                  CANCELLED
                </span>
              </div>
            ))}

            {data.queue.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-8">No appointments scheduled for today.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
