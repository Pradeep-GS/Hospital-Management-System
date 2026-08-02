import React, { useState, useEffect } from 'react';
import { UserPlus, QrCode, Bed, Users, Calendar, Plus, Search, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

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
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Reception Desk | AegisCare ERP</title>
      </Helmet>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/reception/register-patient')}
          className="bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Poppins',sans-serif]">Register New Patient</h3>
              <p className="text-xs text-slate-500">Create UPID digital health profile & QR passport</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => navigate('/reception/qr-scanner')}
          className="bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Poppins',sans-serif]">Scan Universal QR Passport</h3>
              <p className="text-xs text-slate-500">Instant check-in via patient QR code scanner</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => navigate('/reception/emergency-admission')}
          className="bg-white border border-slate-200 hover:border-rose-300 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Poppins',sans-serif]">Emergency Admission</h3>
              <p className="text-xs text-slate-500">Instant bed & oxygen cylinder allocation</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Main Grid: Walk-In Booking & Available Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Columns: Walk-In Appointment Booking Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 font-['Poppins',sans-serif]">
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
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:border-blue-600 focus:outline-none"
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
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:border-blue-600 focus:outline-none"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs"
            >
              Check-In Patient & Generate Live Queue Position Token
            </button>
          </form>
        </div>

        {/* Right 6 Columns: On-Duty Doctor Roster */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3 font-['Poppins',sans-serif]">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> On-Duty Doctors Roster
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">{doctors.length} Doctors</span>
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {doctors.map((doc) => (
              <div key={doc._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
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
    </div>
  );
};

export default ReceptionDashboard;
