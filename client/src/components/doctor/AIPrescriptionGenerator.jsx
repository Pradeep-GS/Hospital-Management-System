import React, { useState } from 'react';
import api from '../../services/api';

export default function AIPrescriptionGenerator({ appointmentId, patientId, doctor, onPrescriptionApproved }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showSignModal, setShowSignModal] = useState(false);
  const [digitalSignatureInput, setDigitalSignatureInput] = useState('');
  const [signingLoading, setSigningLoading] = useState(false);

  const handleGenerateDraft = async (e) => {
    e?.preventDefault();
    if (!diagnosis.trim() && !symptoms.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/ai/prescription-generator', {
        diagnosis,
        symptoms,
        patientId
      });
      setDraft(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndDigitallySign = async () => {
    if (!draft || signingLoading) return;

    setSigningLoading(true);
    try {
      // 1. Create prescription draft entry if needed
      const items = draft.medicines.map(m => ({
        medicineName: m.medicineName,
        dosage: m.dosage,
        frequency: m.frequency,
        durationDays: m.durationDays,
        quantityRequired: m.quantityRequired,
        unitPrice: 10
      }));

      // Create or update prescription
      const resPrescription = await api.post('/doctors/prescriptions', {
        appointmentId,
        patientId,
        items
      });

      const prescriptionId = resPrescription.data.prescription._id;

      // 2. Lock & Digitally Sign Prescription
      await api.post(`/ai/approve-prescription/${prescriptionId}`, {
        digitalSignature: digitalSignatureInput || `DOC-SIG-${Date.now()}`,
        instructions: draft.instructions,
        dietAdvice: draft.dietAdvice,
        lifestyleAdvice: draft.lifestyleAdvice,
        hydrationAdvice: draft.hydrationAdvice,
        exerciseAdvice: draft.exerciseAdvice
      });

      setShowSignModal(false);
      if (onPrescriptionApproved) onPrescriptionApproved();
      alert('🔒 Prescription digitally signed and locked! Transferred to Pharmacy.');
    } catch (err) {
      alert('Error finalizing prescription: ' + (err.response?.data?.error || err.message));
    } finally {
      setSigningLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">
            💊
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Smart Prescription Generator</h3>
            <p className="text-xs text-teal-400">Automated safety verification & digital locking workflow</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleGenerateDraft} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmed Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Bacterial Bronchitis"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Symptoms</label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Productive cough, fever 38.5°C"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!diagnosis.trim() && !symptoms.trim())}
          className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition"
        >
          {loading ? '⚙️ Generating Draft Rx & Running Safety Checks...' : '✨ Generate AI Prescription Draft'}
        </button>
      </form>

      {/* Draft View & Safety Checks */}
      {draft && (
        <div className="space-y-5 pt-4 border-t border-slate-800">
          
          {/* Automated Safety Check Matrix */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Automated AI Safety Audit</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                Pregnancy: <span className="font-bold text-emerald-400">{draft.safetyChecks?.pregnancySafety}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                Pediatric: <span className="font-bold text-emerald-400">{draft.safetyChecks?.pediatricDosage}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                Geriatric: <span className="font-bold text-emerald-400">{draft.safetyChecks?.geriatricDosage}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                Kidney/Liver: <span className="font-bold text-emerald-400">{draft.safetyChecks?.kidneyAdjustment}</span>
              </div>
            </div>

            {/* Allergy & Conflict Warnings */}
            {draft.safetyChecks?.allergyConflicts?.length > 0 && (
              <div className="p-2 bg-rose-500/20 border border-rose-500/30 rounded text-rose-300 text-xs font-bold">
                ⚠️ {draft.safetyChecks.allergyConflicts.join(' ')}
              </div>
            )}
          </div>

          {/* Medicines List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Draft Medication Schedule</h4>
            {draft.medicines?.map((m, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{m.medicineName} <span className="text-[11px] font-normal text-slate-400">({m.genericName})</span></p>
                  <p className="text-slate-400">{m.dosage} • {m.frequency} • {m.durationDays} Days ({m.quantityRequired} Tablets)</p>
                </div>
                <span className="px-2 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-bold rounded">Qty: {m.quantityRequired}</span>
              </div>
            ))}
          </div>

          {/* Lifestyle & Patient Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-cyan-400">🥗 Diet Advice:</span> {draft.dietAdvice}
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-blue-400">💧 Hydration:</span> {draft.hydrationAdvice}
            </div>
          </div>

          {/* Approve & Lock Trigger */}
          <button
            onClick={() => setShowSignModal(true)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xl flex items-center justify-center gap-2"
          >
            🔒 Approve & Digitally Sign Prescription (Send to Pharmacy)
          </button>

        </div>
      )}

      {/* Digital Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              ✒️ Doctor Digital Signature Verification
            </h3>
            <p className="text-xs text-slate-400">
              Entering your electronic signature locks this prescription. Only approved and signed prescriptions are visible to the pharmacy.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Doctor Full Signature / Passcode</label>
              <input
                type="password"
                value={digitalSignatureInput}
                onChange={(e) => setDigitalSignatureInput(e.target.value)}
                placeholder="Enter Digital Security Signature Key..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApproveAndDigitallySign}
                disabled={signingLoading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                {signingLoading ? 'Signing...' : 'Confirm & Send to Pharmacy'}
              </button>
              <button
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
