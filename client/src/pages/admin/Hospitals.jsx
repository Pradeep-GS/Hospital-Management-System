import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle, XCircle, Plus, KeyRound, Mail, User, Phone, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('admin123');
  const [phone, setPhone] = useState('');

  const [actionMsg, setActionMsg] = useState('');

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

  const handleOpenAddModal = () => {
    setName('');
    setCode('');
    setAdminName('');
    setEmail('');
    setPassword('admin123');
    setPhone('');
    setActionMsg('');
    setShowModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setActionMsg('');

    try {
      const res = await api.post('/admin/hospitals', {
        name,
        hospitalCode: code,
        adminName,
        contactEmail: email,
        password,
        contactPhone: phone
      });

      setActionMsg(`🎉 ${res.data.message || 'Hospital & Admin credentials created!'}`);
      setTimeout(() => {
        setShowModal(false);
        setActionMsg('');
        fetchHospitals();
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Hospital Directory...</div>;

  return (
    <div className="space-y-6 text-xs font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" /> Hospital Multi-Tenant Directory & Dual Verification
          </h3>
          <p className="text-xs text-slate-400">Manage registered facilities, approve applications, and issue admin credentials</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl shadow flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Onboard New Hospital
        </button>
      </div>

      {/* Directory Table */}
      <div className="glass-panel p-6">
        <div className="space-y-3">
          {hospitals.map((h) => {
            const isApproved = h.verificationStatus === 'APPROVED';
            return (
              <div key={h._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{h.name}</h4>
                  <div className="flex items-center gap-3 text-slate-400 mt-1">
                    <span className="font-mono text-purple-400">Code: {h.hospitalCode}</span>
                    <span>Admin Email: {h.contactEmail || 'N/A'}</span>
                    <span>Phone: {h.contactPhone || 'N/A'}</span>
                  </div>
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
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Approve & Grant Login Access
                    </button>
                  )}
                  {h.verificationStatus === 'PENDING_ADMIN' && (
                    <button
                      onClick={() => handleApprove(h._id, 'REJECT')}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Reject
                    </button>
                  )}
                  {h.verificationStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(h._id, 'SUSPEND')}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Suspend Access
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Onboard Hospital & Create Admin Credentials Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Onboard Facility & Generate Admin Login Credentials</h3>
              <p className="text-slate-400">Fill in the facility details and assign administrator login credentials</p>
            </div>

            {actionMsg && (
              <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{actionMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Hospital Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                    placeholder="VSB Hospital"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Facility Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase"
                    required
                    placeholder="HOSP-VSB-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Administrator Full Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                    placeholder="Dr. Sarah Connor"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    placeholder="+1-555-0199"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Login ID / Admin Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                    placeholder="admin@vsbhospital.org"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Administrator Password</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    required
                    placeholder="admin123"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-200">
                <span className="font-bold block">Login Credentials Summary:</span>
                Hospital Admin will log in using <strong className="font-mono text-purple-300">{email || 'email'}</strong> and password <strong className="font-mono text-purple-300">{password}</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold">Register & Issue Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Hospitals;
