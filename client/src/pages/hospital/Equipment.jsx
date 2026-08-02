import React, { useState, useEffect } from 'react';
import { Wind, Plus, Trash2, Edit } from 'lucide-react';
import api from '../../services/api';

export const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Diagnostic');
  const [serialNumber, setSerialNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState(1);
  const [inUseQuantity, setInUseQuantity] = useState(0);
  const [damagedQuantity, setDamagedQuantity] = useState(0);
  const [status, setStatus] = useState('GOOD');

  const fetchEquipment = async () => {
    try {
      const res = await api.get('/hospitals/equipment');
      setEquipment(res.data.equipment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('Diagnostic');
    setSerialNumber(`EQ-${Date.now()}`);
    setManufacturer('');
    setAvailableQuantity(1);
    setInUseQuantity(0);
    setDamagedQuantity(0);
    setStatus('GOOD');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setSerialNumber(item.serialNumber);
    setManufacturer(item.manufacturer);
    setAvailableQuantity(item.availableQuantity);
    setInUseQuantity(item.inUseQuantity);
    setDamagedQuantity(item.damagedQuantity);
    setStatus(item.maintenanceStatus);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name, category, serialNumber, manufacturer,
      availableQuantity: Number(availableQuantity),
      inUseQuantity: Number(inUseQuantity),
      damagedQuantity: Number(damagedQuantity),
      maintenanceStatus: status
    };

    try {
      if (editingItem) {
        await api.put(`/hospitals/equipment/${editingItem._id}`, payload);
      } else {
        await api.post('/hospitals/equipment', payload);
      }
      setShowModal(false);
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this equipment?')) return;
    try {
      await api.delete(`/hospitals/equipment/${id}`);
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.error || 'Deletion failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Equipment Inventory...</div>;

  return (
    <div className="space-y-6 text-xs">
      <div className="glass-panel p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-400" /> Equipment & Medical Machinery CRUD
          </h3>
          <p className="text-xs text-slate-400">Manage ventilators, monitors, and facility assets</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="space-y-3">
          {equipment.map((item) => (
            <div key={item._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{item.name}</h4>
                <p className="text-slate-400">Category: {item.category} | Serial: {item.serialNumber}</p>
                <span className="text-[11px] text-slate-500 font-mono">Qty: (Available: {item.availableQuantity}, In Use: {item.inUseQuantity})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  item.maintenanceStatus === 'GOOD' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}>
                  {item.maintenanceStatus}
                </span>
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-slate-850 hover:bg-slate-800 text-rose-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          {equipment.length === 0 && (
            <p className="text-center text-slate-500 py-8">No equipment items registered.</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-white">{editingItem ? 'Edit Equipment' : 'Add Equipment'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Equipment Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Serial Number</label>
                  <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Available Qty</label>
                  <input type="number" value={availableQuantity} onChange={(e) => setAvailableQuantity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">In Use Qty</label>
                  <input type="number" value={inUseQuantity} onChange={(e) => setInUseQuantity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Damaged Qty</label>
                  <input type="number" value={damagedQuantity} onChange={(e) => setDamagedQuantity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Maintenance Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white">
                  <option value="GOOD">GOOD</option>
                  <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                  <option value="REPAIR_REQUIRED">REPAIR REQUIRED</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-cyan-600 text-white font-bold">{editingItem ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
