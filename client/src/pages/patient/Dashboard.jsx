import React, { useState, useEffect } from 'react';
import { User, QrCode, Calendar, Shield, Activity, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

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
        setAppointments(aRes.data.appointments || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !qrData) return <div className="p-8 text-center text-slate-500 font-medium">Loading Patient Portal...</div>;

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Patient Portal | AegisCare ERP</title>
      </Helmet>

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Poppins',sans-serif]">Hello, {qrData.fullName}</h2>
            <p className="text-xs text-slate-500 font-mono">Universal Patient ID: {qrData.universalPatientId}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/patient/appointments')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" /> Book Doctor Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Universal QR Passport Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-3.5 py-1 rounded-full text-xs font-bold border border-blue-200 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> Universal Health Passport
          </div>

          <div className="bg-white p-5 rounded-2xl inline-block shadow-md mx-auto border-2 border-blue-200">
            <svg className="w-40 h-40 mx-auto" viewBox="0 0 100 100">
              <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M30,40 h30 v30 h-30 z M70,40 h20 v20 h-20 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M80,70 h20 v30 h-20 z" fill="#1e293b" />
            </svg>
            <span className="text-[11px] font-mono text-blue-700 font-extrabold block mt-2">
              {qrData.universalPatientId}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Show this Universal QR Passport at reception desks for instant check-in across all AegisCare network hospitals.
          </p>
        </div>

        {/* Appointments Summary */}
        <div className="md:col-span-7 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
              <Activity className="w-5 h-5 text-blue-600" /> Active & Scheduled Appointments
            </h3>
            <button onClick={() => navigate('/patient/appointments')} className="text-xs text-blue-600 hover:underline font-bold">
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt._id}
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  apt.isCurrentActive
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : apt.isGreyedOut
                    ? 'bg-slate-50 border-slate-200 opacity-50'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{apt.doctorName}</h4>
                  <span className="text-slate-500 font-mono text-[11px]">Appt #: {apt.appointmentNumber}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  apt.isCurrentActive ? 'bg-emerald-600 text-white' :
                  apt.status === 'CHECKED_IN' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="text-center text-slate-400 text-xs py-10">
                No appointments scheduled.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
