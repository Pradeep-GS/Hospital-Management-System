import React, { useState } from 'react';
import { Bed, AlertCircle } from 'lucide-react';
import api from '../../services/api';

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
    } catch (err) {
      alert(err.response?.data?.error || 'Allocation failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="glass-panel p-6 space-y-4 border-rose-500/40">
        <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
          <Bed className="w-5 h-5" /> Emergency Room & Oxygen Allocation
        </h3>

        {msg && (
          <div className="bg-rose-950 border border-rose-600 text-rose-200 text-xs p-3 rounded-xl">
            {msg}
          </div>
        )}

        <form onSubmit={handleAllocate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Available Facility Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              required
            >
              <option value="">-- Choose Room --</option>
              <option value="6a6ee7054d5859abe0ed1dcd">General Ward 301 ($100/day)</option>
              <option value="6a6ee7054d5859abe0ed1dcf">ICU Suite 401 ($800/day)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg"
          >
            Allocate Emergency Room & Equipment
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmergencyAdmission;
