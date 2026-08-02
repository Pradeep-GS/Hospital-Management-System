import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Receipt, CheckCircle, Calculator, ShieldCheck, AlertTriangle, Printer, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

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
      const res = await api.post('/pharmacy/checkout-invoice', {
        appointmentId: selectedPresc.appointmentId,
        roomDays: 1
      });
      setCheckoutResult(res.data);
      toast.success('Invoice checked out & paid successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Checkout failed.');
      toast.error(err.response?.data?.error || 'Checkout failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Billing Engine...</div>;

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>GST Billing Engine | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
              <Receipt className="w-5 h-5 text-blue-600" /> Automated GST Billing & Invoicing Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1">Itemized GST tax calculation, consultation fees, and automatic EMR lock release</p>
          </div>
          {checkoutResult && (
            <button
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Tax Invoice Receipt
            </button>
          )}
        </div>

        {/* Prescription Selector */}
        {!initialPresc && prescriptions.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Pending Prescription</label>
            <select
              value={selectedPresc?._id || ''}
              onChange={(e) => {
                const found = prescriptions.find((p) => p._id === e.target.value);
                if (found) handleSelect(found);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
            >
              {prescriptions.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.patientName} — Prescribed by {p.doctorName} ({p.items?.length || 0} Medicines)
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedPresc && invoicePreview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
            
            {/* Left: Itemized Breakdown */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Patient & Appointment Details</h4>
                <div className="text-slate-600 space-y-1 text-xs">
                  <p>Patient Name: <strong className="text-slate-900">{selectedPresc.patientName}</strong></p>
                  <p>Doctor: <strong className="text-slate-900">{selectedPresc.doctorName}</strong></p>
                  <p>Appointment #: <span className="font-mono font-bold text-blue-600">{selectedPresc.appointmentId}</span></p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Itemized Pharmacy Medicines</h4>
                <div className="space-y-2">
                  {selectedPresc.items?.map((item, idx) => {
                    const stockMatch = inventory.find(
                      (i) => i.name.toLowerCase().includes(item.medicineName.toLowerCase()) || i.name === item.medicineName
                    );
                    const unitPrice = stockMatch?.unitPrice || item.unitPrice || 2.5;
                    const subtotal = (item.quantityRequired || 1) * unitPrice;

                    return (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center shadow-2xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{item.medicineName}</span>
                          <span className="text-[11px] text-slate-500">Qty: {item.quantityRequired} x ${unitPrice.toFixed(2)}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Tax Breakdown & Total Checkout */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between shadow-2xs">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">GST Tax & Billing Calculation</h4>
                
                <div className="space-y-2 text-slate-600 text-xs">
                  <div className="flex justify-between">
                    <span>Medicines Subtotal</span>
                    <span className="font-mono font-bold text-slate-900">${invoicePreview.medicineTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST Tax (5% / 12%)</span>
                    <span className="font-mono text-slate-700">${invoicePreview.gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Doctor Consultation Fee</span>
                    <span className="font-mono text-slate-700">${invoicePreview.consultantFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room & Bed Daily Charges</span>
                    <span className="font-mono text-slate-700">${invoicePreview.roomFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-300 pt-3 flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 text-sm">TOTAL AMOUNT DUE</span>
                  <span className="font-mono font-extrabold text-blue-600 text-xl font-['Poppins',sans-serif]">
                    ${invoicePreview.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {!checkoutResult ? (
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-xs"
                >
                  Confirm Payment & Issue Tax Invoice
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Payment Received & EMR Access Window Released!
                  </div>
                  <p className="text-[11px] text-emerald-700 font-mono">Invoice #: {checkoutResult.invoice?.invoiceNumber}</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
