import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock, Building2, Stethoscope, ArrowRight } from 'lucide-react';
import api from '../../services/api';

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
  const [showBookForm, setShowBookForm] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/patients/appointments');
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/patients/hospitals');
      setHospitals(res.data.hospitals);
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
      setDoctors(res.data.doctors);
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
      setShowBookForm(false);
      setSelectedHospital('');
      setSelectedDoctor('');
      setBookingDate('');
      setBookingNotes('');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Appointments...</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-400" /> Book & Manage Appointments
          </h3>
          <p className="text-xs text-slate-400">Queue ordering automatically assigns your position.</p>
        </div>

        <button
          onClick={() => setShowBookForm(!showBookForm)}
          className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> {showBookForm ? 'Hide Form' : 'Book Online Appointment'}
        </button>
      </div>

      {success && (
        <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Booking Form Layout */}
      {showBookForm && (
        <div className="glass-panel p-6 space-y-4 border-pink-500/30">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Appointment Booking Wizard</h4>
          <form onSubmit={handleBook} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hospital */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select Hospital Facility</label>
                <select
                  value={selectedHospital}
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                >
                  <option value="">-- Choose Hospital --</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select Doctor List</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                  disabled={!selectedHospital}
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.fullName} — {d.doctorDetails?.specialization || d.department || 'General Physician'} ({d.doctorDetails?.roomNo || 'Clinic'}, Fee: ${d.doctorDetails?.consultationFee || 100})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Choose Appointment Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Available Time Slot</label>
                <select
                  value={bookingTimeSlot}
                  onChange={(e) => setBookingTimeSlot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
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
              <label className="block text-slate-300 mb-1 font-semibold">Symptoms / Booking Notes</label>
              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Briefly describe symptoms..."
                rows="2"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5"
            >
              Confirm Booking & Generate ID <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="glass-panel p-6 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Your Appointments</h4>

        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt._id}
              className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                apt.isCurrentActive
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40'
                  : apt.isGreyedOut
                  ? 'bg-slate-950/30 border-slate-800 opacity-40 grayscale'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div>
                <h4 className="font-bold text-white text-sm">{apt.doctorName}</h4>
                <p className="text-slate-400 font-mono">Appt ID: {apt.appointmentNumber}</p>
                <p className="text-[10px] text-slate-500">Date: {apt.date || 'TBD'} | Time: {apt.timeSlot || 'TBD'}</p>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full font-extrabold uppercase ${
                  apt.isCurrentActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' :
                  apt.status === 'CHECKED_IN' ? 'bg-amber-950 text-amber-300 border border-amber-500' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {apt.status}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">Queue #{apt.queuePosition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
