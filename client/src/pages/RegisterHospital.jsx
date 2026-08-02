import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Building2, User, KeyRound, Phone, Mail, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export const RegisterHospital = () => {
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [licNo, setLicNo] = useState('');
  const [type, setType] = useState('General');
  
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register-hospital', {
        name,
        registrationNumber: regNo,
        licenseNumber: licNo,
        hospitalType: type,
        address: { street, city, state, zipCode: zip },
        contactPhone: phone,
        contactEmail: email,
        adminName,
        adminPassword
      });

      setSuccess('🎉 Hospital registered successfully! Verification status: PENDING APPROVAL.');
      setName('');
      setRegNo('');
      setLicNo('');
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setPhone('');
      setEmail('');
      setAdminName('');
      setAdminPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-2xl w-full glass-panel-accent p-8 space-y-6 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-teal-500/20">
            <Building2 className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Onboard Your Hospital Facility</h1>
          <p className="text-xs text-slate-400">Apply for dual system administrator approval</p>
        </div>

        {error && (
          <div className="bg-rose-950 border border-rose-600 text-rose-200 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs p-3.5 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">{success}</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-white hover:underline text-xs font-bold block"
            >
              ← Go back to Login Page
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Hospital Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-teal-400 uppercase tracking-wider">Hospital Details</h3>
                
                <div>
                  <label className="block text-slate-300 mb-1">Hospital Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="City Central Hospital" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1">Registration #</label>
                    <input type="text" value={regNo} onChange={(e) => setRegNo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="REG-1090" />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Govt License #</label>
                    <input type="text" value={licNo} onChange={(e) => setLicNo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="LIC-9901" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Hospital Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white">
                    <option value="General">General / Specialty</option>
                    <option value="Clinic">Polyclinic</option>
                    <option value="SuperSpecialty">Super Specialty</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1">Contact Phone</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="+1-555-0100" />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Official Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="admin@metrohospital.org" />
                  </div>
                </div>
              </div>

              {/* Right Column: Address & Admin Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-teal-400 uppercase tracking-wider">Facility Address</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-300 mb-1">Street Address</label>
                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="100 Medical Plaza" />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="Metropolis" />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">State</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="NY" />
                  </div>
                </div>

                <h3 className="font-bold text-teal-400 uppercase tracking-wider pt-2">Administrator Profile</h3>
                <div>
                  <label className="block text-slate-300 mb-1">Full Name</label>
                  <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="Dr. Sarah Connor" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Administrator Password</label>
                  <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="••••••••" />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-xl"
            >
              {loading ? 'Submitting Application...' : 'Register Hospital & Admin Account'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal Sign-In
          </button>
        </div>

      </div>
    </div>
  );
};

export default RegisterHospital;
