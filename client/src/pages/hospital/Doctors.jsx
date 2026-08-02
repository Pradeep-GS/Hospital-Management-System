import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus } from 'lucide-react';
import api from '../../services/api';

export const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [spec, setSpec] = useState('Cardiology');
  const [fee, setFee] = useState(150);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/hospitals/doctors');
      setDoctors(res.data.doctors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hospitals/doctors', {
        fullName: name,
        email,
        password: 'doc123',
        specialization: spec,
        consultationFee: fee
      });
      setShowModal(false);
      setName('');
      setEmail('');
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Doctor Roster...</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-400" /> Doctor Roster & Registrations
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Register New Doctor
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div key={doc._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-white text-sm">{doc.fullName}</h4>
                <p className="text-slate-400">{doc.doctorDetails?.specialization}</p>
                <span className="text-slate-500 font-mono">Fee: ${doc.doctorDetails?.consultationFee}</span>
              </div>
              <span className="bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-full font-bold uppercase">
                {doc.approvalStatus}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Register Doctor</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" required />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" required />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Specialization</label>
                <input type="text" value={spec} onChange={(e) => setSpec(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Fee ($)</label>
                <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 text-white font-bold">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
