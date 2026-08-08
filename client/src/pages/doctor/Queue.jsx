import React, { useState, useEffect } from 'react';
import { Clock, UserCheck, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export const Queue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchQueue = async () => {
    try {
      const res = await api.get('/doctors/dashboard');
      setQueue(res.data.queue || []);
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
      await api.post(`/doctors/queue/${id}/activate`);
      toast.success('Patient consultation window unlocked & active!');
      navigate('/doctor/emr');
    } catch (err) {
      alert(err.response?.data?.error || 'Activation failed.');
      toast.error(err.response?.data?.error || 'Activation failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Queue...</div>;

  return (
    <div className="space-y-4 sm:space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Today's Queue | AegisCare ERP</title>
      </Helmet>

      {/* Header Container - 100% Mobile Responsive */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Clock className="w-5 h-5 text-blue-600 shrink-0" /> Today's Live Consultation Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage patient check-ins and unlock EMR clinical windows</p>
        </div>
        <span className="self-start sm:self-auto text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 shrink-0">
          Total Queue: {queue.length} Patients
        </span>
      </div>

      {/* Queue Items List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-6 shadow-sm space-y-3">
        {queue.map((apt) => {
          const isActive = apt.status === 'ACTIVE';
          const isCheckedIn = apt.status === 'CHECKED_IN';
          const isCompleted = ['COMPLETED', 'PAID'].includes(apt.status);

          return (
            <div
              key={apt._id}
              className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                isActive
                  ? 'bg-blue-50/90 border-blue-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Patient Info */}
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                  isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                }`}>
                  #{apt.queuePosition || 1}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{apt.patientName}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-slate-500 mt-0.5 font-mono text-[11px]">
                    <span className="truncate">Appt: {apt.appointmentNumber}</span>
                    <span className="truncate">Channel: {apt.bookingChannel}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isCheckedIn
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {apt.status}
                </span>

                {isCheckedIn && (
                  <button
                    onClick={() => handleActivate(apt._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs text-xs active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Activate Consultation
                  </button>
                )}

                {isActive && (
                  <button
                    onClick={() => navigate('/doctor/emr')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs text-xs active:scale-95 transition-all"
                  >
                    Open EMR <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {queue.length === 0 && (
          <div className="text-center text-slate-400 text-xs py-12">
            No patients currently in the queue for today.
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
