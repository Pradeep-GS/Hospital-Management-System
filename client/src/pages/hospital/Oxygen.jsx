import React, { useState, useEffect } from 'react';
import { Wind, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export const Oxygen = () => {
  const [oxygen, setOxygen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [cylinderId, setCylinderId] = useState('');
  const [type, setType] = useState('Liquid');
  const [capacity, setCapacity] = useState(40);
  const [status, setStatus] = useState('AVAILABLE');
  const [supplier, setSupplier] = useState('');

  const fetchOxygen = async () => {
    try {
      const res = await api.get('/hospitals/oxygen');
      setOxygen(res.data.oxygen);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOxygen();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCylinderId(`CYL-${Date.now()}`);
    setType('Liquid');
    setCapacity(40);
    setStatus('AVAILABLE');
    setSupplier('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setCylinderId(item.cylinderId);
    setType(item.type);
    setCapacity(item.capacityLitres);
    setStatus(item.status);
    setSupplier(item.supplierName);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      cylinderId, type,
      capacityLitres: Number(capacity),
      status,
      supplierName: supplier
    };

    try {
      if (editingItem) {
        await api.put(`/hospitals/oxygen/${editingItem._id}`, payload);
      } else {
        await api.post('/hospitals/oxygen', payload);
      }
      setShowModal(false);
      fetchOxygen();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cylinder?')) return;
    try {
      await api.delete(`/hospitals/oxygen/${id}`);
      fetchOxygen();
    } catch (err) {
      alert(err.response?.data?.error || 'Deletion failed.');
    }
  };

  const emptyCount = oxygen.filter((c) => c.status === 'EMPTY').length;
  const lowStock = oxygen.filter((c) => c.status === 'REFILLING').length;

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Oxygen Inventory...</div>;

  return (
    <div className="space-y-6 text-xs">
      
      {/* Alert Header if any empty */}
      {(emptyCount > 0 || lowStock > 0) && (
        <div className="bg-rose-950/80 border border-rose-600 text-rose-200 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <h4 className="font-bold">Oxygen Cylinder Alert Triggered</h4>
            <p className="text-[11px] opacity-90">
              There are {emptyCount} empty cylinders and {lowStock} cylinders currently sent for refilling. Please coordinate supply refilling.
            </p>
          </div>
        </div>
      )}

      <div className="glass-panel p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-400" /> Oxygen Cylinder Management
          </h3>
          <p className="text-xs text-slate-400">Manage gas reserves, pressure capacities, and suppliers</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Cylinder
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="space-y-3">
          {oxygen.map((item) => (
            <div key={item._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Cylinder ID: {item.cylinderId}</h4>
                <p className="text-slate-400">Type: {item.type} | Capacity: {item.capacityLitres} L</p>
                <span className="text-[10px] text-slate-500 font-mono">Supplier: {item.supplierName || 'Not Specified'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  item.status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-300' :
                  item.status === 'IN_USE' ? 'bg-cyan-950 text-cyan-300' :
                  item.status === 'EMPTY' ? 'bg-rose-950 text-rose-300' :
                  'bg-amber-950 text-amber-300'
                }`}>
                  {item.status}
                </span>
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-slate-850 hover:bg-slate-800 text-rose-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          {oxygen.length === 0 && (
            <p className="text-center text-slate-500 py-8">No oxygen cylinders registered in database.</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-white">{editingItem ? 'Edit Cylinder' : 'Add Cylinder'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Cylinder ID / Tag</label>
                <input type="text" value={cylinderId} onChange={(e) => setCylinderId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Type</label>
                  <input type="text" value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Capacity (Litres)</label>
                  <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Supplier Name</label>
                <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white">
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="IN_USE">IN USE</option>
                  <option value="REFILLING">REFILLING</option>
                  <option value="EMPTY">EMPTY</option>
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

export default Oxygen;
