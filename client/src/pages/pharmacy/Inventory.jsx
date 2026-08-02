import React, { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import api from '../../services/api';

export const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stock update/creation modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [addQty, setAddQty] = useState(50);

  // New Medicine Fields
  const [newName, setNewName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [stockQuantity, setStockQuantity] = useState(100);
  const [reorderLevel, setReorderLevel] = useState(20);
  const [unitPrice, setUnitPrice] = useState(2.5);
  const [gstRatePercentage, setGstRatePercentage] = useState(5);
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [category, setCategory] = useState('TABLET');

  const fetchInventory = async () => {
    try {
      const res = await api.get('/pharmacy/inventory');
      setInventory(res.data.inventory);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (e) => {
    e.preventDefault();

    try {
      if (selectedMed) {
        await api.post('/pharmacy/inventory/update-stock', {
          medicineId: selectedMed._id,
          addQuantity: addQty
        });
      } else {
        await api.post('/pharmacy/inventory/add', {
          name: newName,
          genericName,
          batchNumber,
          stockQuantity: Number(stockQuantity),
          reorderLevel: Number(reorderLevel),
          unitPrice: Number(unitPrice),
          gstRatePercentage: Number(gstRatePercentage),
          expiryDate,
          category
        });
        // Clear fields
        setNewName('');
        setGenericName('');
        setBatchNumber('');
      }
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Stock Inventory...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan-400" /> Medicine Stock Inventory
        </h3>
        <button
          onClick={() => {
            setSelectedMed(null);
            setShowModal(true);
          }}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="space-y-3">
          {inventory.map((item) => {
            const isLow = item.stockQuantity <= item.reorderLevel;
            return (
              <div key={item._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-slate-500">Batch: {item.batchNumber} | Expiry: {new Date(item.expiryDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className={`font-mono font-bold text-sm block ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.stockQuantity} units
                    </span>
                    <span className="text-slate-500 font-mono">${item.unitPrice}/unit</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMed(item);
                      setShowModal(true);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded font-bold"
                  >
                    Restock
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">
              {selectedMed ? `Restock ${selectedMed.name}` : 'Add New Medicine Asset'}
            </h3>
            <form onSubmit={handleUpdateStock} className="space-y-3 text-xs">
              {selectedMed ? (
                <div>
                  <label className="block text-slate-300 mb-1">Quantity to add</label>
                  <input
                    type="number"
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Name</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" required placeholder="Aspirin 81mg" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Generic Name</label>
                      <input type="text" value={genericName} onChange={(e) => setGenericName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="Acetylsalicylic Acid" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Batch</label>
                      <input type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" placeholder="B-990" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Qty</label>
                      <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Reorder Level</label>
                      <input type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Price ($)</label>
                      <input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">GST (%)</label>
                      <input type="number" value={gstRatePercentage} onChange={(e) => setGstRatePercentage(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white">
                        <option value="TABLET">TABLET</option>
                        <option value="CAPSULE">CAPSULE</option>
                        <option value="SYRUP">SYRUP</option>
                        <option value="INJECTION">INJECTION</option>
                        <option value="OINTMENT">OINTMENT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Expiry Date</label>
                    <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" required />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-cyan-600 text-white font-bold">
                  {selectedMed ? 'Add Stock' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
