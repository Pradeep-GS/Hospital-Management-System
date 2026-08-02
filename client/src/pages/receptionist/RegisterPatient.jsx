import React, { useState } from 'react';
import { UserPlus, QrCode, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

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
      setFullName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setDob('');
      setAddress('');
      setEmergencyContact('');
    } catch (err) {
      alert(err.response?.data?.error || 'Patient registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-xs font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="glass-panel p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" /> Facility Patient Registration Portal
          </h3>
          <p className="text-slate-400">Register new patient accounts, assign default password (12345), and generate QR pass</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Patient Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Username / Email ID (Login ID)</label>
              <input
                type="email"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setEmail(e.target.value);
                }}
                placeholder="jane.doe@gmail.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0199"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
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
              <label className="block text-slate-300 mb-1 font-semibold">Emergency Contact Phone</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+1-555-9110"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="742 Evergreen Terrace, Springfield"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
            />
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200">
            <span className="font-bold block">Auto Credentials System:</span>
            Default Login Password will be set to <strong className="font-mono text-amber-300">12345</strong>. The patient will be forced to update password on first login.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg transition-all"
          >
            {loading ? 'Processing Registration...' : 'Register Patient & Generate Universal QR Code'}
          </button>
        </form>

        {result && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/50 space-y-3 mt-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase">
              <CheckCircle2 className="w-5 h-5" /> Patient Registered & Universal QR Code Generated
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div><span className="text-slate-500 block">Patient Name</span><span className="font-bold text-white">{result.fullName}</span></div>
              <div><span className="text-slate-500 block">Patient ID (UPID)</span><span className="font-mono font-bold text-teal-400">{result.universalPatientId}</span></div>
              <div><span className="text-slate-500 block">Login Username</span><span className="font-mono text-slate-300">{result.email}</span></div>
              <div><span className="text-slate-500 block">Default Password</span><span className="font-mono text-amber-300 font-bold">12345</span></div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl font-mono text-[10px] text-slate-300 border border-slate-800 break-all">
              QR Tag Payload: {result.qrCodePayload}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPatient;
