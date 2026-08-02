import React, { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

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
      setInventory(res.data.inventory || []);
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
        toast.success(`Restocked ${selectedMed.name} (+${addQty} units)`);
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
        toast.success(`Medicine ${newName} added to inventory!`);
        setNewName('');
        setGenericName('');
        setBatchNumber('');
      }
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
      toast.error(err.response?.data?.error || 'Action failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Stock Inventory...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-['Inter',sans-serif]">
      <Helmet>
        <title>Medicine Inventory | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Package className="w-5 h-5 text-blue-600" /> Medicine Stock Inventory Tracker
          </h3>
          <p className="text-xs text-slate-500">Track batch numbers, expiration dates, unit prices, and automated stock reorder levels</p>
        </div>
        <button
          onClick={() => {
            setSelectedMed(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="space-y-3">
          {inventory.map((item) => {
            const isLow = item.stockQuantity <= item.reorderLevel;
            return (
              <div key={item._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-blue-300 transition-colors">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-slate-500 mt-0.5 font-mono text-[11px]">Batch: {item.batchNumber} | Expiry: {new Date(item.expiryDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className={`font-mono font-bold text-sm block ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {item.stockQuantity} units
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">${item.unitPrice}/unit</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMed(item);
                      setShowModal(true);
                    }}
                    className="bg-slate-900 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Poppins',sans-serif]">
              {selectedMed ? `Restock ${selectedMed.name}` : 'Add New Medicine Asset'}
            </h3>
            <form onSubmit={handleUpdateStock} className="space-y-3 text-xs">
              {selectedMed ? (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantity to Add</label>
                  <input
                    type="number"
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Medicine Name</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" required placeholder="Aspirin 81mg" />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Generic Name</label>
                      <input type="text" value={genericName} onChange={(e) => setGenericName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" placeholder="Acetylsalicylic Acid" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Batch #</label>
                      <input type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono" placeholder="B-990" />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Stock Qty</label>
                      <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono" required />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Reorder Level</label>
                      <input type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Price ($)</label>
                      <input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono" required />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">GST (%)</label>
                      <input type="number" value={gstRatePercentage} onChange={(e) => setGstRatePercentage(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono" required />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900">
                        <option value="TABLET">TABLET</option>
                        <option value="CAPSULE">CAPSULE</option>
                        <option value="SYRUP">SYRUP</option>
                        <option value="INJECTION">INJECTION</option>
                        <option value="OINTMENT">OINTMENT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Expiry Date</label>
                    <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono" required />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
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
