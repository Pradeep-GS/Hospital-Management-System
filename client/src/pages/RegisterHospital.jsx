import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Building2, User, KeyRound, Phone, Mail, FileText, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
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
      toast.success('Hospital registered successfully! Pending System Admin Approval.');
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
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Inter',sans-serif]">
      <Helmet>
        <title>Hospital Registration | AegisCare Enterprise</title>
      </Helmet>

      <div className="max-w-2xl w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-md shadow-blue-600/20 text-white">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Poppins',sans-serif]">
            Onboard Your Hospital Facility
          </h1>
          <p className="text-xs text-slate-500">Apply for dual system administrator approval and issue tenant portal credentials</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">{success}</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline text-xs font-bold block pt-1"
            >
              ← Return to Portal Sign-In Page
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Hospital Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-blue-600 uppercase tracking-wider text-[11px]">Facility Information</h3>
                
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Hospital Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="VSB Metro Hospital" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Registration #</label>
                    <input type="text" value={regNo} onChange={(e) => setRegNo(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="REG-1090" />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Govt License #</label>
                    <input type="text" value={licNo} onChange={(e) => setLicNo(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="LIC-9901" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Hospital Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900">
                    <option value="General">General / Specialty</option>
                    <option value="Clinic">Polyclinic</option>
                    <option value="SuperSpecialty">Super Specialty</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Contact Phone</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="+1-555-0100" />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Official Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="admin@metrohospital.org" />
                  </div>
                </div>
              </div>

              {/* Right Column: Address & Admin Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-blue-600 uppercase tracking-wider text-[11px]">Facility Location</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-700 mb-1 font-semibold">Street Address</label>
                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="100 Medical Plaza" />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="Metropolis" />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">State</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="NY" />
                  </div>
                </div>

                <h3 className="font-bold text-blue-600 uppercase tracking-wider text-[11px] pt-1">Administrator Profile</h3>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Full Name</label>
                  <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="Dr. Sarah Connor" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Administrator Password</label>
                  <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="••••••••" />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {loading ? 'Submitting Hospital Application...' : 'Register Hospital & Admin Account'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={() => navigate('/login')}
            className="text-slate-500 hover:text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal Sign-In
          </button>
        </div>

      </div>
    </div>
  );
};

export default RegisterHospital;
