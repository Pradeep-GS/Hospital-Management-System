import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Building2, User, KeyRound, Phone, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export const RegisterPharmacy = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/patients/hospitals')
      .then((res) => {
        setHospitals(res.data.hospitals);
        if (res.data.hospitals.length > 0) {
          setSelectedHospital(res.data.hospitals[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        fullName,
        email,
        password,
        phone,
        role: 'PHARMACY',
        hospitalId: selectedHospital,
        employeeId,
        licenseNumber
      });
      setSuccess('🎉 Pharmacy staff registration application submitted successfully! Status: PENDING APPROVAL.');
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setEmployeeId('');
      setLicenseNumber('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full glass-panel-accent p-8 space-y-6 relative z-10 text-xs">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Pill className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Pharmacy Staff Onboarding</h1>
          <p className="text-slate-400">Submit staff registration for pharmacy validations</p>
        </div>

        {error && (
          <div className="bg-rose-950 border border-rose-600 text-rose-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">{success}</span>
            </div>
            <button onClick={() => navigate('/login')} className="text-white hover:underline font-bold block">
              ← Back to Sign-In
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-1">Select Hospital Facility</label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                required
              >
                <option value="">-- Choose Hospital --</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Employee ID</label>
                <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="EMP-PHARM-01" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="Dr. Rajesh Koothrappali" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="rajesh@hospital.org" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="+1-555-0104" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">License Number (Optional)</label>
              <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" placeholder="LIC-PHARM-8839" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
            >
              {loading ? 'Submitting Application...' : 'Register as Pharmacy Staff'}
            </button>
          </form>
        )}

        <div className="text-center">
          <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-white font-semibold inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign-In
          </button>
        </div>

      </div>
    </div>
  );
};

export default RegisterPharmacy;
