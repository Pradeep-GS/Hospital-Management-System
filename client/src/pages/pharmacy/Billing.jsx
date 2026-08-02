import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Receipt, CheckCircle, Calculator, ShieldCheck, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPresc = location.state?.presc || null;

  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedPresc, setSelectedPresc] = useState(initialPresc);
  const [invoicePreview, setInvoicePreview] = useState(null);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [loading, setLoading] = useState(!initialPresc);

  useEffect(() => {
    Promise.all([
      api.get('/pharmacy/inventory'),
      !initialPresc ? api.get('/pharmacy/prescriptions/pending') : Promise.resolve(null)
    ])
      .then(([iRes, pRes]) => {
        if (iRes) setInventory(iRes.data.inventory || []);
        if (pRes) {
          setPrescriptions(pRes.data.prescriptions || []);
          if (pRes.data.prescriptions && pRes.data.prescriptions.length > 0) {
            handleSelect(pRes.data.prescriptions[0]);
          }
        } else if (initialPresc) {
          handleSelect(initialPresc);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [initialPresc]);

  const handleSelect = async (presc) => {
    setSelectedPresc(presc);
    setCheckoutResult(null);
    try {
      const res = await api.post('/pharmacy/calculate-bill-preview', {
        appointmentId: presc.appointmentId,
        roomDays: 1
      });
      setInvoicePreview(res.data.preview);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to calculate invoice preview.');
    }
  };

  const handleCheckout = async () => {
    if (!selectedPresc) return;
    try {
      const res = await api.post('/pharmacy/checkout', {
        appointmentId: selectedPresc.appointmentId,
        paymentMethod: 'CARD',
        roomDays: 1
      });
      setCheckoutResult(res.data);
      setSelectedPresc(null);
      setInvoicePreview(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Checkout failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Billing Center...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {checkoutResult && (
        <div className="glass-panel p-6 border-emerald-500 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Tax Invoice Generated (#{checkoutResult.invoice.invoiceNumber})
            </h3>
            <span className="text-xs bg-emerald-950 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-500">
              PAID & DISPENSED
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block">Consultant Fee</span>
              <span className="font-mono font-bold">${checkoutResult.invoice.breakdown.consultantFee}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Room Charge</span>
              <span className="font-mono font-bold">${checkoutResult.invoice.breakdown.roomChargeTotal}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Medicine Subtotal</span>
              <span className="font-mono font-bold">${checkoutResult.invoice.breakdown.medicineSubtotal}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total GST</span>
              <span className="font-mono font-bold text-teal-400">${checkoutResult.invoice.breakdown.gstBreakdown?.totalGst || 0}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl flex items-center justify-between border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Total Amount Paid</span>
              <span className="text-2xl font-extrabold text-white font-mono">${checkoutResult.invoice.breakdown.totalAmount}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-emerald-400 bg-emerald-950 px-3 py-2 rounded-lg border border-emerald-800">
              <ShieldCheck className="w-4 h-4" /> EMR Access Locked Post-Payment
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Prescription Selector (only if not loaded directly from prescription list) */}
        {!initialPresc && prescriptions.length > 0 && (
          <div className="md:col-span-4 glass-panel p-5 space-y-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Pending Queue</span>
            <div className="space-y-2">
              {prescriptions.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleSelect(p)}
                  className={`p-3 rounded-lg border cursor-pointer text-xs ${
                    selectedPresc?._id === p._id ? 'bg-slate-800 border-teal-500' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <p className="font-bold text-white">{p.patientName}</p>
                  <p className="text-[10px] text-slate-400">Dr. {p.doctorName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GST Billing Engine Breakdowns */}
        <div className={`${!initialPresc && prescriptions.length > 0 ? 'md:col-span-8' : 'md:col-span-12'} glass-panel p-6 space-y-6`}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" /> Itemized Billing calculation
          </h3>

          {invoicePreview ? (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Doctor Consultant Fee</span>
                  <span className="font-mono font-bold">${invoicePreview.consultantFee}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Room Charge (1 Day)</span>
                  <span className="font-mono font-bold">${invoicePreview.roomChargeTotal}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Medicine Subtotal</span>
                  <span className="font-mono font-bold">${invoicePreview.medicineSubtotal}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">GST Summary:</span>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>GST (5%)</span>
                    <span className="font-mono">${invoicePreview.gstBreakdown?.gst5PercentAmount || 0}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>GST (12%)</span>
                    <span className="font-mono">${invoicePreview.gstBreakdown?.gst12PercentAmount || 0}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-700 flex justify-between items-center text-sm font-bold text-white">
                  <span>Total Amount Due</span>
                  <span className="text-xl font-mono text-emerald-400">${invoicePreview.totalAmount}</span>
                </div>
              </div>

              {/* Insufficient Stock Verification */}
              {(() => {
                const insufficientItems = selectedPresc?.items?.filter(pItem => {
                  const dbMed = inventory.find(inv => inv.name.toLowerCase() === pItem.medicineName.toLowerCase());
                  return dbMed && dbMed.stockQuantity < pItem.quantityRequired;
                }) || [];

                if (insufficientItems.length > 0) {
                  return (
                    <div className="bg-rose-950/80 border border-rose-600 text-rose-200 text-xs p-3.5 rounded-xl space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> Insufficient Stock Warning
                      </p>
                      {insufficientItems.map((item, idx) => {
                        const dbMed = inventory.find(inv => inv.name.toLowerCase() === item.medicineName.toLowerCase());
                        return (
                          <p key={idx} className="text-[11px] opacity-90">
                            • {item.medicineName} (Prescribed: {item.quantityRequired}, Available: {dbMed?.stockQuantity || 0})
                          </p>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              })()}

              <button
                onClick={handleCheckout}
                disabled={(() => {
                  const insufficientItems = selectedPresc?.items?.filter(pItem => {
                    const dbMed = inventory.find(inv => inv.name.toLowerCase() === pItem.medicineName.toLowerCase());
                    return dbMed && dbMed.stockQuantity < pItem.quantityRequired;
                  }) || [];
                  return insufficientItems.length > 0;
                })()}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Collect Payment & Lock EMR Access
              </button>
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">Select a pending prescription to compute the bill.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
