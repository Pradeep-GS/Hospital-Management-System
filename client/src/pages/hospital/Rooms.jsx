import React, { useState, useEffect } from 'react';
import { Bed, Plus, Trash2, Edit } from 'lucide-react';
import api from '../../services/api';

export const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('GENERAL_WARD');
  const [dailyRate, setDailyRate] = useState(100);
  const [floor, setFloor] = useState('Floor 1');

  const fetchRooms = async () => {
    try {
      const res = await api.get('/hospitals/rooms');
      setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setRoomNumber('');
    setRoomType('GENERAL_WARD');
    setDailyRate(100);
    setFloor('Floor 1');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setRoomNumber(item.roomNumber);
    setRoomType(item.roomType);
    setDailyRate(item.dailyRate);
    setFloor(item.floor || 'Floor 1');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      roomNumber,
      roomType,
      dailyRate: Number(dailyRate),
      floor
    };

    try {
      if (editingItem) {
        await api.put(`/hospitals/rooms/${editingItem._id}`, payload);
      } else {
        await api.post('/hospitals/rooms', payload);
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room from inventory?')) return;
    try {
      await api.delete(`/hospitals/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.error || 'Deletion failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Rooms...</div>;

  return (
    <div className="space-y-6 text-xs">
      <div className="glass-panel p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bed className="w-5 h-5 text-blue-400" /> Facility Room Directory CRUD
          </h3>
          <p className="text-xs text-slate-400">Configure General Wards, Private, ICU, and Operation Theatre capacities</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Facility Room
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((item) => (
            <div key={item._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Room {item.roomNumber} ({item.floor || 'Floor 1'})</h4>
                <p className="text-slate-400">Type: {item.roomType} | Daily Rate: ${item.dailyRate}</p>
                <span className="text-[10px] text-slate-500 font-mono">
                  State: {item.isOccupied ? '🔴 Occupied' : '🟢 Available'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-slate-850 hover:bg-slate-800 text-rose-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <p className="text-center text-slate-500 py-8">No hospital rooms created.</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-white">{editingItem ? 'Edit Room' : 'Add Room'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Room Number / Identifier</label>
                <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" required placeholder="302" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Daily rate ($)</label>
                  <input type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Floor Location</label>
                  <input type="text" value={floor} onChange={(e) => setFloor(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="Floor 3" />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Room Type</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white">
                  <option value="GENERAL_WARD">GENERAL WARD</option>
                  <option value="PRIVATE">PRIVATE</option>
                  <option value="SEMI_PRIVATE">SEMI PRIVATE</option>
                  <option value="ICU">ICU</option>
                  <option value="NICU">NICU</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                  <option value="OPERATION_THEATRE">OPERATION THEATRE</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 text-white font-bold">{editingItem ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
