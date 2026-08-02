import React, { useState } from 'react';
import { UserPlus, QrCode, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export const RegisterPatient = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/reception/patients/register', {
        fullName,
        username: username || email,
        email: email || username,
        phone,
        age: dob ? new Date().getFullYear() - new Date(dob).getFullYear() : undefined,
        gender,
        bloodGroup,
        address,
        emergencyContact
      });
      setResult(res.data.patient);
      toast.success(`Patient ${res.data.patient.fullName} registered! UPID generated.`);
      setFullName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setDob('');
      setAddress('');
      setEmergencyContact('');
    } catch (err) {
      alert(err.response?.data?.error || 'Patient registration failed.');
      toast.error(err.response?.data?.error || 'Patient registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-['Inter',sans-serif]">
      <Helmet>
        <title>Register Patient | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <UserPlus className="w-5 h-5 text-blue-600" /> Patient Digital Health Profile Registration
          </h3>
          <p className="text-xs text-slate-500 mt-1">Register new patient accounts, assign default credentials (12345), and generate QR health passport</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Patient Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Username / Email ID (Login ID)</label>
              <input
                type="email"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setEmail(e.target.value);
                }}
                placeholder="jane.doe@gmail.com"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0199"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Emergency Contact Phone</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+1-555-9110"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="742 Evergreen Terrace, Springfield"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
            <span className="font-bold block">Auto Credentials System:</span>
            Default Login Password will be set to <strong className="font-mono text-blue-700">12345</strong>. The patient will be forced to update password on first login.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-xs"
          >
            {loading ? 'Processing Registration...' : 'Register Patient & Generate Universal QR Code'}
          </button>
        </form>

        {result && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-blue-200 space-y-4 mt-4 shadow-xs">
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs">
              <CheckCircle2 className="w-5 h-5" /> Patient Registered & Universal QR Passport Active
            </div>
            <div className="grid grid-cols-2 gap-3 text-slate-700 text-xs">
              <div><span className="text-slate-400 block text-[11px]">Patient Name</span><span className="font-bold text-slate-900">{result.fullName}</span></div>
              <div><span className="text-slate-400 block text-[11px]">Patient ID (UPID)</span><span className="font-mono font-bold text-blue-600">{result.universalPatientId}</span></div>
              <div><span className="text-slate-400 block text-[11px]">Login Username</span><span className="font-mono text-slate-800">{result.email}</span></div>
              <div><span className="text-slate-400 block text-[11px]">Default Password</span><span className="font-mono text-blue-600 font-bold">12345</span></div>
            </div>
            <div className="bg-white p-3 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-200 break-all">
              QR Tag Payload: {result.qrCodePayload}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPatient;
