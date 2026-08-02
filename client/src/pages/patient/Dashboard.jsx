import React, { useState, useEffect } from 'react';
import { User, QrCode, Calendar, Shield, Activity, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const PatientDashboard = () => {
  const [qrData, setQrData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/patients/qr-code'),
      api.get('/patients/appointments')
    ])
      .then(([qRes, aRes]) => {
        setQrData(qRes.data);
        setAppointments(aRes.data.appointments);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !qrData) return <div className="p-8 text-center text-slate-400">Loading Patient Portal...</div>;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Hello, {qrData.fullName}</h2>
            <p className="text-xs text-slate-400 font-mono">UPID: {qrData.universalPatientId}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/patient/appointments')}
          className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Universal QR Passport Card */}
        <div className="md:col-span-5 glass-panel-accent p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-xs font-semibold border border-pink-500/30">
            <Shield className="w-3.5 h-3.5" /> Universal Health Passport
          </div>

          <div className="bg-white p-5 rounded-2xl inline-block shadow-2xl mx-auto border-4 border-pink-500/30">
            <svg className="w-40 h-40 mx-auto" viewBox="0 0 100 100">
              <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M30,40 h30 v30 h-30 z M70,40 h20 v20 h-20 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M80,70 h20 v30 h-20 z" fill="#0f172a" />
            </svg>
            <span className="text-[10px] font-mono text-slate-900 font-extrabold block mt-2">
              {qrData.universalPatientId}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Use this Universal QR Passport at any hospital on the AegisCare platform.
          </p>
        </div>

        {/* Appointments Summary */}
        <div className="md:col-span-7 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-400" /> Active & Past Appointments
            </h3>
            <button onClick={() => navigate('/patient/appointments')} className="text-xs text-pink-400 hover:underline font-semibold">
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt._id}
                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  apt.isCurrentActive
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40'
                    : apt.isGreyedOut
                    ? 'bg-slate-950/40 border-slate-800 opacity-40 grayscale'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{apt.doctorName}</h4>
                  <span className="text-slate-400 font-mono">Appt #: {apt.appointmentNumber}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold uppercase ${
                  apt.isCurrentActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  apt.status === 'CHECKED_IN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
