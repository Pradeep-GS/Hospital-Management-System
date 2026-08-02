import React, { useState, useEffect } from 'react';
import { UserPlus, QrCode, Bed, Users, Calendar, Plus, Search, CheckCircle2, ArrowRight, Activity, Clock } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export const ReceptionDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Walk-In Appointment Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [docRes, patRes] = await Promise.all([
        api.get('/reception/doctors'),
        api.get('/patients')
      ]);
      setDoctors(docRes.data.doctors || []);
      setPatients(patRes.data.patients || patRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookWalkIn = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId) {
      alert('Please select both Patient and Doctor.');
      return;
    }

    try {
      const res = await api.post('/reception/appointments/book-walkin', {
        patientId: selectedPatientId,
        doctorId: selectedDoctorId
      });
      setBookingSuccess(`🎉 Appointment Booked! Queue Position: #${res.data.appointment.queuePosition}`);
      toast.success(`Appointment Booked! Queue Position: #${res.data.appointment.queuePosition}`);
      setSelectedPatientId('');
      setSelectedDoctorId('');
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed.');
      toast.error(err.response?.data?.error || 'Booking failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Reception Desk...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 font-['Inter',sans-serif]"
    >
      <Helmet>
        <title>Reception Desk | AegisCare ERP</title>
      </Helmet>

      {/* 1. GREETING HERO CARD */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 rounded-3xl p-8 text-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-100">
            <Users className="w-3.5 h-3.5 text-amber-300" /> Front Desk Operations
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Poppins',sans-serif]">
            👋 Front Desk & Patient Admission Terminal
          </h1>

          <p className="text-xs text-amber-100/90 font-medium leading-relaxed">
            Register new patient profiles (UPID), scan universal health passports, process walk-in check-in queues, and allocate emergency ward beds.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/reception/register-patient')}
            className="bg-white hover:bg-amber-50 text-amber-900 font-bold px-5 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-amber-600" /> Register Patient Profile
          </button>
        </div>
      </div>

      {/* 2. SOFT ACCENT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/reception/register-patient')}
          className="bg-[#EFF6FF] border border-blue-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Registered Patients</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-950 font-['Poppins',sans-serif]">{patients.length}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">UPID Active</span>
            </div>
            <p className="text-[11px] text-blue-600 font-medium">Digital health profiles</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          className="bg-[#FFF7ED] border border-orange-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">On-Duty Doctors</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-orange-950 font-['Poppins',sans-serif]">{doctors.length}</span>
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">Available</span>
            </div>
            <p className="text-[11px] text-orange-600 font-medium">Consultation clinics active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/reception/qr-scanner')}
          className="bg-[#ECFDF5] border border-emerald-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Universal QR Passport</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-emerald-950 font-['Poppins',sans-serif]">Scanner Ready</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Instant check-in active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* 3. QUICK ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.button
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => navigate('/reception/register-patient')}
          className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Poppins',sans-serif]">Register New Patient</h3>
              <p className="text-xs text-slate-500">Create UPID digital health profile</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </motion.button>

        <motion.button
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => navigate('/reception/qr-scanner')}
          className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Poppins',sans-serif]">Scan QR Passport</h3>
              <p className="text-xs text-slate-500">Instant check-in via patient QR code</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </motion.button>

        <motion.button
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => navigate('/reception/emergency-admission')}
          className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Poppins',sans-serif]">Emergency Admission</h3>
              <p className="text-xs text-slate-500">Instant bed & oxygen allocation</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
        </motion.button>
      </div>

      {/* 4. MAIN GRID: WALK-IN WIZARD & DOCTOR ROSTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Walk-In Appointment Booking Form */}
        <div className="lg:col-span-6 bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 font-['Poppins',sans-serif]">
            <Calendar className="w-5 h-5 text-blue-600" /> Walk-In Queue Booking Wizard
          </h3>

          {bookingSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{bookingSuccess}</span>
            </div>
          )}

          <form onSubmit={handleBookWalkIn} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Patient Profile (Registered UPID)</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:border-blue-600 focus:outline-none"
                required
              >
                <option value="">-- Choose Registered Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.fullName} ({p.universalPatientId || p.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Doctor & Specialty</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:border-blue-600 focus:outline-none"
                required
              >
                <option value="">-- Select On-Duty Doctor --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.fullName} — {d.doctorDetails?.specialization || 'General Physician'} (Fee: ${d.doctorDetails?.consultationFee || 100})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-xs"
            >
              Check-In Patient & Generate Live Queue Position Token
            </button>
          </form>
        </div>

        {/* On-Duty Doctor Roster */}
        <div className="lg:col-span-6 bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3 font-['Poppins',sans-serif]">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> On-Duty Doctors Roster
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">{doctors.length} Doctors</span>
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {doctors.map((doc) => (
              <div key={doc._id} className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{doc.fullName}</h4>
                  <p className="text-blue-600 font-medium mt-0.5">{doc.doctorDetails?.specialization}</p>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">Room: {doc.doctorDetails?.roomNo || 'Clinic 302'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-slate-900 text-sm block">${doc.doctorDetails?.consultationFee || 100}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 mt-1 inline-block">
                    AVAILABLE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default ReceptionDashboard;
