import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle, XCircle, Plus } from 'lucide-react';
import api from '../../services/api';

export const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/admin/hospitals');
      setHospitals(res.data.hospitals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleApprove = async (id, action) => {
    try {
      await api.post(`/admin/hospitals/${id}/approve`, { action });
      fetchHospitals();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/hospitals', { name, hospitalCode: code });
      setShowModal(false);
      setName('');
      setCode('');
      fetchHospitals();
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Hospital Directory...</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-400" /> Hospital Multi-Tenant Directory & Dual Verification
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Onboard Hospital
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="space-y-3">
          {hospitals.map((h) => {
            const isApproved = h.verificationStatus === 'APPROVED';
            return (
              <div key={h._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{h.name}</h4>
                  <p className="text-slate-400 font-mono">Code: {h.hospitalCode}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase ${
                    isApproved ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {h.verificationStatus}
                  </span>

                  {h.verificationStatus !== 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(h._id, 'APPROVE')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-bold"
                    >
                      Approve
                    </button>
                  )}
                  {h.verificationStatus === 'PENDING_ADMIN' && (
                    <button
                      onClick={() => handleApprove(h._id, 'REJECT')}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-[11px] font-bold"
                    >
                      Reject
                    </button>
                  )}
                  {h.verificationStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(h._id, 'SUSPEND')}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded text-[11px] font-bold"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Onboard Hospital</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Hospital Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" required />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Facility Code</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-purple-600 text-white font-bold">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hospitals;
