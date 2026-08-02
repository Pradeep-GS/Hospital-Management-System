import React, { useState, useEffect } from 'react';
import { User, QrCode, Calendar, Shield, Activity, ArrowRight, Receipt, FileText } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 font-['Inter',sans-serif]"
    >
      <Helmet>
        <title>Patient Portal | AegisCare ERP</title>
      </Helmet>

      {/* 1. GREETING HERO CARD */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
            <User className="w-3.5 h-3.5 text-teal-300" /> Patient Health Care Portal
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Poppins',sans-serif]">
            👋 Hello, {qrData.fullName}
          </h1>

          <p className="text-xs text-blue-100/90 font-medium leading-relaxed">
            Manage your doctor appointments, view encrypted EMR health records, access tax invoice receipts, and present your Universal QR Health Passport.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/patient/appointments')}
            className="bg-white hover:bg-blue-50 text-blue-800 font-bold px-5 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-blue-600" /> Book Doctor Appointment
          </button>
        </div>
      </div>

      {/* 2. SOFT ACCENT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/patient/appointments')}
          className="bg-[#EFF6FF] border border-blue-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Appointments</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-950 font-['Poppins',sans-serif]">{appointments.length}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">Scheduled</span>
            </div>
            <p className="text-[11px] text-blue-600 font-medium">Doctor visits roster</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/patient/emr')}
          className="bg-[#ECFDF5] border border-emerald-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">EMR Health Vault</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-emerald-950 font-['Poppins',sans-serif]">Encrypted</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Clinical vitals & records</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/patient/bills')}
          className="bg-[#FFF7ED] border border-orange-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Billing History</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-orange-950 font-['Poppins',sans-serif]">Receipts</span>
            </div>
            <p className="text-[11px] text-orange-600 font-medium">GST Invoices paid</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* 3. UNIVERSAL QR PASSPORT & APPOINTMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Universal QR Passport Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-3xl text-center space-y-4 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
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
            Present this Universal QR Passport at reception desks for instant check-in across all AegisCare network hospitals.
          </p>
        </div>

        {/* Appointments Summary */}
        <div className="md:col-span-7 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
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
                    ? 'bg-[#F8FAFC] border-slate-200 opacity-50'
                    : 'bg-[#F8FAFC] border-slate-200'
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
    </motion.div>
  );
};

export default PatientDashboard;
