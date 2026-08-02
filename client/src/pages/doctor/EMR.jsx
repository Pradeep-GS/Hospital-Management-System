import React, { useState, useEffect } from 'react';
import { FileText, Lock, Unlock, CheckCircle2, Send, Activity, User, Receipt, Pill, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const EMR = () => {
  const [activeApt, setActiveApt] = useState(null);
  const [fullEmr, setFullEmr] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Multi-item Prescription State
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1 (After Meals)', durationDays: 5, quantityRequired: 10 }
  ]);

  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctors/dashboard')
      .then((res) => {
        const active = res.data.queue.find((a) => a.status === 'ACTIVE');
        setActiveApt(active || null);
        if (active) {
          fetchEMR(active._id, active.patientId);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setError('Failed to fetch active appointment.');
        setLoading(false);
      });
  }, []);

  const fetchEMR = async (appointmentId, patientId) => {
    try {
      const res = await api.get(`/doctors/emr?patientId=${patientId}&appointmentId=${appointmentId}`);
      setFullEmr(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'EMR Access Denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicineName: '', dosage: '1 Tablet', frequency: '1-0-1 (After Meals)', durationDays: 5, quantityRequired: 10 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (prescriptionItems.length === 1) return;
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...prescriptionItems];
    updated[index][field] = value;
    setPrescriptionItems(updated);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!activeApt) return;

    try {
      const formattedItems = prescriptionItems.map((item) => ({
        ...item,
        quantityRequired: Number(item.quantityRequired) || 1,
        durationDays: Number(item.durationDays) || 5,
        unitPrice: 2.5,
        gstRatePercentage: 5
      }));

      await api.post('/doctors/emr/prescription', {
        appointmentId: activeApt._id,
        patientId: activeApt.patientId,
        diagnosis,
        doctorNotes: notes,
        items: formattedItems
      });

      setSuccess('✅ Prescription saved to EMR & automatically routed to Pharmacy!');
      setTimeout(() => navigate('/doctor/dashboard'), 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Prescription creation failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Validating EMR Access Window...</div>;

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* EMR Access Status Header */}
      <div className={`p-5 rounded-2xl border flex items-center justify-between ${
        activeApt
          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
          : 'bg-rose-950/40 border-rose-800 text-rose-300'
      }`}>
        <div className="flex items-center gap-3">
          {activeApt ? <Unlock className="w-6 h-6 text-emerald-400" /> : <Lock className="w-6 h-6 text-rose-400" />}
          <div>
            <h3 className="font-bold text-base">
              {activeApt ? `EMR Window UNLOCKED (${activeApt.patientName})` : 'EMR Access Window LOCKED'}
            </h3>
            <p className="text-xs opacity-80">
              {activeApt
                ? 'Appointment status is ACTIVE. Medical records access granted.'
                : 'Select and activate an appointment from the Queue to access patient records.'}
            </p>
          </div>
        </div>
      </div>

      {error && !activeApt && (
        <div className="glass-panel p-8 text-center space-y-4">
          <p className="text-rose-400 text-sm font-semibold">{error}</p>
          <button onClick={() => navigate('/doctor/dashboard')} className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs">
            Go to Queue to Activate Appointment
          </button>
        </div>
      )}

      {activeApt && fullEmr && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 4 Columns: Patient Card & History */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Patient Demographics */}
            <div className="glass-panel p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-400" /> Patient Profile
              </h4>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block">Name</span>
                  <span className="text-white font-bold text-sm">{fullEmr.patient?.fullName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block">Age</span>
                    <span className="text-white font-semibold">{fullEmr.patient?.age || '34'} Years</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gender</span>
                    <span className="text-white font-semibold">{fullEmr.patient?.gender || 'Male'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <span className="text-white font-mono">{fullEmr.patient?.phone}</span>
                </div>
              </div>
            </div>

            {/* Previous Billing Summary */}
            <div className="glass-panel p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-400" /> Billing History
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar text-xs">
                {fullEmr.invoices?.map((inv) => (
                  <div key={inv._id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between">
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px]">{inv.invoiceNumber}</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{inv.paymentStatus}</span>
                    </div>
                    <span className="font-mono font-bold text-white">${inv.breakdown?.totalAmount}</span>
                  </div>
                ))}
                {(!fullEmr.invoices || fullEmr.invoices.length === 0) && (
                  <p className="text-slate-500 text-[11px] text-center">No billing history found.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right 8 Columns: Prescriptions history & New Input Form */}
          <div className="lg:col-span-8 space-y-6">

            {/* Vitals */}
            <div className="glass-panel p-6">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" /> Patient Vitals
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Blood Pressure</span>
                  <span className="font-mono font-bold text-white text-base">{fullEmr.emrRecord?.vitals?.bloodPressure || '120/80'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Heart Rate</span>
                  <span className="font-mono font-bold text-teal-400 text-base">{fullEmr.emrRecord?.vitals?.heartRate || 72} bpm</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Body Temp</span>
                  <span className="font-mono font-bold text-white text-base">{fullEmr.emrRecord?.vitals?.temperatureCelsius || 36.8} °C</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">SpO2 Oxygen</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">{fullEmr.emrRecord?.vitals?.spO2Percentage || 98}%</span>
                </div>
              </div>
            </div>

            {/* Previous Visit Details */}
            <div className="glass-panel p-6">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" /> Medical Visits & Diagnostics History
              </h4>
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar text-xs">
                {fullEmr.history?.map((record) => (
                  <div key={record._id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Date: {new Date(record.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-white">Diagnosis: {record.diagnosis}</span>
                    </div>
                    <p className="text-slate-300">Notes: {record.doctorNotes}</p>
                  </div>
                ))}
                {(!fullEmr.history || fullEmr.history.length === 0) && (
                  <p className="text-slate-500 text-center py-4">No diagnosis history recorded.</p>
                )}
              </div>
            </div>

            {/* New Diagnostics & Multi-Item Treatment Form */}
            <div className="glass-panel p-6 space-y-5">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" /> New Diagnostics & Multi-Item Prescription Form
              </h4>

              {success && (
                <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {success}
                </div>
              )}

              <form onSubmit={handleCreatePrescription} className="space-y-5 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Tension Headache / Acute Bronchitis"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Doctor Consultation Progress Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Advised hydration, bed rest for 3 days..."
                    rows="2"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Multi-Item Prescribed Medicines Builder */}
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-white text-xs flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-400" /> Prescribed Medicines & Tablets List ({prescriptionItems.length})
                    </h5>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Another Medicine
                    </button>
                  </div>

                  <div className="space-y-3">
                    {prescriptionItems.map((item, index) => (
                      <div key={index} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-teal-400 font-bold">Item #{index + 1}</span>
                          {prescriptionItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-rose-400 hover:text-rose-300 font-bold p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 mb-1">Medicine / Tablet Name</label>
                            <input
                              type="text"
                              value={item.medicineName}
                              onChange={(e) => handleItemChange(index, 'medicineName', e.target.value)}
                              placeholder="e.g. Amoxicillin 500mg"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1">Dosage</label>
                            <input
                              type="text"
                              value={item.dosage}
                              onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                              placeholder="e.g. 500mg"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-400 mb-1">Frequency</label>
                            <input
                              type="text"
                              value={item.frequency}
                              onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                              placeholder="1-0-1 (After Meals)"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1">Days</label>
                            <input
                              type="number"
                              value={item.durationDays}
                              onChange={(e) => handleItemChange(index, 'durationDays', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1">Total Quantity</label>
                            <input
                              type="number"
                              value={item.quantityRequired}
                              onChange={(e) => handleItemChange(index, 'quantityRequired', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Save Diagnosis & Deliver Multi-Item Prescription ({prescriptionItems.length})
                </button>
              </form>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default EMR;
