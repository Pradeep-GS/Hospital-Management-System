import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle, XCircle, Plus, KeyRound, Mail, User, Phone, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

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
      setHospitals(res.data.hospitals || []);
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
      toast.success(`Hospital ${action} request processed!`);
      fetchHospitals();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
      toast.error(err.response?.data?.error || 'Action failed.');
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
      toast.success('Hospital onboarded & admin credentials issued!');
      setTimeout(() => {
        setShowModal(false);
        setActionMsg('');
        fetchHospitals();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed.');
      toast.error(err.response?.data?.error || 'Registration failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Hospital Directory...</div>;

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Hospital Directory | AegisCare ERP</title>
      </Helmet>

      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Building2 className="w-5 h-5 text-purple-600" /> Hospital Multi-Tenant Directory & Dual Verification
          </h3>
          <p className="text-xs text-slate-500 mt-1">Manage registered facilities, approve applications, and issue admin credentials</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" /> Onboard New Hospital
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="space-y-3">
          {hospitals.map((h) => {
            const isApproved = h.verificationStatus === 'APPROVED';
            return (
              <div key={h._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-purple-300 transition-colors">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{h.name}</h4>
                  <div className="flex items-center gap-4 text-slate-500 mt-1 font-mono text-[11px]">
                    <span className="text-purple-600 font-bold">Code: {h.hospitalCode}</span>
                    <span>Admin Email: {h.contactEmail || 'N/A'}</span>
                    <span>Phone: {h.contactPhone || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    isApproved ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {h.verificationStatus}
                  </span>

                  {h.verificationStatus !== 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(h._id, 'APPROVE')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs"
                    >
                      Approve Facility
                    </button>
                  )}
                  {h.verificationStatus === 'PENDING_ADMIN' && (
                    <button
                      onClick={() => handleApprove(h._id, 'REJECT')}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs"
                    >
                      Reject
                    </button>
                  )}
                  {h.verificationStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(h._id, 'SUSPEND')}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs"
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

      {/* Onboard Hospital Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-['Poppins',sans-serif]">Onboard Facility & Issue Admin Login Credentials</h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill in facility profile details to create hospital admin account</p>
            </div>

            {actionMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{actionMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hospital Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    required
                    placeholder="VSB Hospital"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Facility Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono uppercase"
                    required
                    placeholder="HOSP-VSB-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Administrator Full Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    required
                    placeholder="Dr. Sarah Connor"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    placeholder="+1-555-0199"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Login ID / Admin Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    required
                    placeholder="admin@vsbhospital.org"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Administrator Password</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono"
                    required
                    placeholder="admin123"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs">
                <span className="font-bold block">Credentials Summary:</span>
                Hospital Admin login ID: <strong className="font-mono text-purple-700">{email || 'email'}</strong> | Password: <strong className="font-mono text-purple-700">{password}</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold">Register & Issue Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Hospitals;
