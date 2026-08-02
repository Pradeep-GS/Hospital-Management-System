import React, { useState } from 'react';
import { Bed, AlertCircle, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export const EmergencyAdmission = () => {
  const [patientId, setPatientId] = useState('6a6ee7054d5859abe0ed1dc5');
  const [roomId, setRoomId] = useState('');
  const [msg, setMsg] = useState('');

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!roomId) return alert('Please select a room.');
    try {
      await api.post('/reception/emergency/allocate-room', {
        patientId,
        roomId,
        equipmentId: '6a6ee7054d5859abe0ed1dd5',
        estimatedDischargeDays: 3
      });
      setMsg('🚨 Emergency room and Oxygen cylinder allocated successfully.');
      toast.success('Emergency Room & Oxygen Cylinder Allocated!');
    } catch (err) {
      alert(err.response?.data?.error || 'Allocation failed.');
      toast.error(err.response?.data?.error || 'Allocation failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto font-['Inter',sans-serif]">
      <Helmet>
        <title>Emergency Admission | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-rose-200 p-8 rounded-3xl shadow-sm space-y-5">
        <div className="border-b border-rose-100 pb-3">
          <h3 className="text-xl font-bold text-rose-600 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Bed className="w-5 h-5" /> Emergency Room & Oxygen Allocation Terminal
          </h3>
          <p className="text-xs text-slate-500 mt-1">Instant ward allocation for critical & trauma patients</p>
        </div>

        {msg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl font-bold">
            {msg}
          </div>
        )}

        <form onSubmit={handleAllocate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Available Facility Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:border-rose-600 focus:outline-none"
              required
            >
              <option value="">-- Choose Room --</option>
              <option value="6a6ee7054d5859abe0ed1dcd">General Ward 301 ($100/day)</option>
              <option value="6a6ee7054d5859abe0ed1dcf">ICU Suite 401 ($800/day)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md"
          >
            Allocate Emergency Room & Oxygen Equipment
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmergencyAdmission;
