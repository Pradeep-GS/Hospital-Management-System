import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock, Building2, Stethoscope, ArrowRight, CheckCircle2, Bot, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import PatientChatbot from '../../components/PatientChatbot';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('09:00 AM - 09:30 AM');
  const [bookingNotes, setBookingNotes] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [showBookForm, setShowBookForm] = useState(true);
  const [bookingMode, setBookingMode] = useState('ai_chat'); // 'ai_chat' or 'manual'

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/patients/appointments');
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/patients/hospitals');
      setHospitals(res.data.hospitals || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchAppointments(), fetchHospitals()])
      .finally(() => setLoading(false));
  }, []);

  const handleHospitalChange = async (hospitalId) => {
    setSelectedHospital(hospitalId);
    setSelectedDoctor('');
    setDoctors([]);
    if (!hospitalId) return;

    try {
      const res = await api.get(`/patients/hospitals/${hospitalId}/doctors`);
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedHospital || !selectedDoctor || !bookingDate || !bookingTimeSlot) {
      return alert('Please fill in all booking details.');
    }

    try {
      await api.post('/patients/appointments/book', {
        hospitalId: selectedHospital,
        doctorId: selectedDoctor,
        date: bookingDate,
        timeSlot: bookingTimeSlot,
        bookingNotes
      });
      setSuccess('✅ Appointment booked successfully! Sent to doctor & receptionist queue.');
      toast.success('Appointment booked successfully!');
      setShowBookForm(false);
      setSelectedHospital('');
      setSelectedDoctor('');
      setBookingDate('');
      setBookingNotes('');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed.');
      toast.error(err.response?.data?.error || 'Booking failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Appointments...</div>;

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Book Appointments | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Calendar className="w-5 h-5 text-blue-600" /> Book & Manage Doctor Appointments
          </h3>
          <p className="text-xs text-slate-500">Automated queue ordering & real-time doctor schedule booking</p>
        </div>

        <button
          onClick={() => setShowBookForm(!showBookForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> {showBookForm ? 'Hide Booking Form' : 'Book Online Appointment'}
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {success}
        </div>
      )}

      {/* Booking Mode Selector Header */}
      {showBookForm && (
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setBookingMode('ai_chat')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              bookingMode === 'ai_chat'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-teal-300" /> 🤖 AI Symptom & Appointment Booking Chatbot
          </button>
          <button
            onClick={() => setBookingMode('manual')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              bookingMode === 'manual'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-pink-300" /> Standard Manual Booking Form
          </button>
        </div>
      )}

      {/* AI Chatbot Assistant Component */}
      {showBookForm && bookingMode === 'ai_chat' && (
        <PatientChatbot hospitals={hospitals} onBookSuccess={fetchAppointments} />
      )}

      {/* Manual Booking Form Layout */}
      {showBookForm && bookingMode === 'manual' && (
        <div className="glass-panel p-6 space-y-4 border-pink-500/30">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Appointment Booking Wizard</h4>
          <form onSubmit={handleBook} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Select Hospital Facility</label>
                <select
                  value={selectedHospital}
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  required
                >
                  <option value="">-- Choose Hospital --</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Select On-Duty Doctor</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  required
                  disabled={!selectedHospital}
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.fullName} — {d.doctorDetails?.specialization || 'General Physician'} (Fee: ${d.doctorDetails?.consultationFee || 100})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Choose Appointment Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Available Time Slot</label>
                <select
                  value={bookingTimeSlot}
                  onChange={(e) => setBookingTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                  required
                >
                  <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                  <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                  <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                  <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                  <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Symptoms / Patient Notes</label>
              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Briefly describe symptoms..."
                rows="2"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              Confirm Booking & Generate Queue Position <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-['Poppins',sans-serif]">Your Scheduled Appointments</h4>

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
                <p className="text-slate-500 font-mono text-[11px]">Appt ID: {apt.appointmentNumber}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Date: {apt.date || 'TBD'} | Time: {apt.timeSlot || 'TBD'}</p>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  apt.isCurrentActive ? 'bg-emerald-600 text-white' :
                  apt.status === 'CHECKED_IN' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {apt.status}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1 font-mono font-semibold">Queue Position #{apt.queuePosition}</span>
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div className="text-center text-slate-400 text-xs py-10">No appointments recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
