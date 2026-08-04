import React, { useState, useEffect } from 'react';
import { FileText, Lock, Unlock, CheckCircle2, Send, Activity, User, Receipt, Pill, Plus, Trash2, Stethoscope, Bot } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import DoctorPrescriptionAIAssistant from '../../components/DoctorPrescriptionAIAssistant';

export const EMR = () => {
  const [activeApt, setActiveApt] = useState(null);
  const [fullEmr, setFullEmr] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Vitals State (Editable by Doctor)
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [heartRate, setHeartRate] = useState(72);
  const [temperatureCelsius, setTemperatureCelsius] = useState(36.8);
  const [spO2Percentage, setSpO2Percentage] = useState(98);

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
      if (res.data.emrRecord?.vitals) {
        setBloodPressure(res.data.emrRecord.vitals.bloodPressure || '120/80');
        setHeartRate(res.data.emrRecord.vitals.heartRate || 72);
        setTemperatureCelsius(res.data.emrRecord.vitals.temperatureCelsius || 36.8);
        setSpO2Percentage(res.data.emrRecord.vitals.spO2Percentage || 98);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'EMR Access Denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicineName: '', dosage: '500mg', frequency: '1-0-1', durationDays: 5, quantityRequired: 10 }
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

  const handleApproveAIMedicine = (approvedItem) => {
    setPrescriptionItems((prev) => {
      // Replace placeholder default item if unfilled, else append
      if (prev.length === 1 && (!prev[0].medicineName || prev[0].medicineName === 'Paracetamol 500mg')) {
        return [approvedItem];
      }
      return [...prev, approvedItem];
    });
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
        vitals: {
          bloodPressure,
          heartRate: Number(heartRate) || 72,
          temperatureCelsius: Number(temperatureCelsius) || 36.8,
          spO2Percentage: Number(spO2Percentage) || 98
        },
        items: formattedItems
      });

      setSuccess('✅ Prescription saved to EMR & automatically routed to Pharmacy!');
      toast.success('Prescription & EMR saved! Routed to Pharmacy.');
      setTimeout(() => navigate('/doctor/dashboard'), 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Prescription creation failed.');
      toast.error(err.response?.data?.error || 'Prescription creation failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Validating EMR Access Window...</div>;

  if (!activeApt) {
    return (
      <div className="bg-white border border-slate-200 p-12 rounded-3xl shadow-sm text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-['Poppins',sans-serif]">EMR Access Window Locked</h2>
        <p className="text-xs text-slate-500">
          No patient is currently active in your consultation room. You must activate a patient from your queue to view medical history and issue prescriptions.
        </p>
        <button
          onClick={() => navigate('/doctor/queue')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs"
        >
          Go to Today's Queue →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>EMR Clinical Workbench | AegisCare ERP</title>
      </Helmet>

      {/* Lock Audit Banner */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Unlock className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-bold text-sm">EMR Window UNLOCKED ({activeApt.patientName})</h3>
            <p className="text-xs text-emerald-700 font-medium">Appointment status is ACTIVE. Multi-tenant scoping and audit logs are active.</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold bg-white text-emerald-700 px-3 py-1 rounded-lg border border-emerald-300 shadow-2xs">
          {activeApt.appointmentNumber}
        </span>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">{success}</div>}

      {fullEmr && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 4 Columns: Patient Details & History */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Patient Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <User className="w-4 h-4" /> Patient Profile
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Universal Patient ID</span>
                  <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded">{fullEmr.patient?.universalPatientId}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name</span>
                    <span className="font-bold text-slate-900 text-sm">{fullEmr.patient?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gender / Age</span>
                    <span className="font-semibold text-slate-700">Male / 21 Years</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <span className="text-slate-900 font-mono font-medium">{fullEmr.patient?.phone}</span>
                </div>
              </div>
            </div>

            {/* Previous Billing Summary */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Receipt className="w-4 h-4 text-amber-500" /> Billing History
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar text-xs">
                {fullEmr.invoices?.map((inv) => (
                  <div key={inv._id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between">
                    <div>
                      <span className="text-slate-500 block font-mono text-[10px]">{inv.invoiceNumber}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{inv.paymentStatus}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${inv.breakdown?.totalAmount}</span>
                  </div>
                ))}
                {(!fullEmr.invoices || fullEmr.invoices.length === 0) && (
                  <p className="text-slate-400 text-xs text-center py-2">No billing history found.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right 8 Columns: Interactive Vitals Form & Prescription */}
          <div className="lg:col-span-8 space-y-6">

            {/* Interactive Vitals Form Entry */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
                  <Activity className="w-4 h-4 text-blue-600" /> Patient Clinical Vitals (Record & Edit)
                </h4>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Clinical Examination Mode
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-slate-600 block text-[11px] font-semibold">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    placeholder="120/80"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-slate-600 block text-[11px] font-semibold">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="72"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-blue-600 font-bold text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-slate-600 block text-[11px] font-semibold">Body Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureCelsius}
                    onChange={(e) => setTemperatureCelsius(e.target.value)}
                    placeholder="36.8"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-slate-600 block text-[11px] font-semibold">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    value={spO2Percentage}
                    onChange={(e) => setSpO2Percentage(e.target.value)}
                    placeholder="98"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-emerald-600 font-bold text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Medical Visits History */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
                <FileText className="w-4 h-4 text-blue-600" /> Medical Visits & Diagnostics History
              </h4>
              {fullEmr.history?.map((rec) => (
                <div key={rec._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-500 border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800">Diagnosis: {rec.diagnosis}</span>
                    <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 italic">"{rec.doctorNotes}"</p>
                </div>
              ))}
              {(!fullEmr.history || fullEmr.history.length === 0) && (
                <p className="text-slate-400 text-xs text-center py-2">No diagnosis history recorded.</p>
              )}
            </div>

            {/* Prescription Form & Multi-Item Dynamic Row Builder */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 font-['Poppins',sans-serif]">
                <Pill className="w-4 h-4 text-blue-600" /> New Diagnostics & Multi-Item Prescription Form
              </h4>

              <form onSubmit={handleCreatePrescription} className="space-y-5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Acute Migraine / Tension Headache"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Doctor Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Patient advised hydration, rest, and oral medication as prescribed."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    required
                  ></textarea>
                </div>

                {/* AI Prescription Clinical Assistant */}
                <DoctorPrescriptionAIAssistant
                  patientId={activeApt.patientId}
                  appointmentId={activeApt._id}
                  diagnosis={diagnosis}
                  symptoms={fullEmr.emrRecord?.symptoms?.join(', ') || ''}
                  notes={notes}
                  onApproveMedicine={handleApproveAIMedicine}
                />

                {/* Multi-Item Medicines Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Prescribed Medications</h5>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Medicine Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    {prescriptionItems.map((item, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={item.medicineName}
                            onChange={(e) => handleItemChange(index, 'medicineName', e.target.value)}
                            placeholder="Medicine Name (e.g. Paracetamol)"
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={item.dosage}
                            onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                            placeholder="Dosage (500mg)"
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={item.frequency}
                            onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                            placeholder="Frequency (1-0-1)"
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantityRequired}
                            onChange={(e) => handleItemChange(index, 'quantityRequired', e.target.value)}
                            placeholder="Qty"
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                            required
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remove Medicine Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Send className="w-4 h-4" /> Save Diagnosis & Deliver Multi-Item Prescription to Pharmacy
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
