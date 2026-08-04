import React, { useState } from 'react';
import { Bot, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, Plus, Info, Activity, History } from 'lucide-react';
import api from '../services/api';

export const DoctorPrescriptionAIAssistant = ({
  patientId,
  appointmentId,
  diagnosis,
  symptoms,
  notes,
  onApproveMedicine
}) => {
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState('');
  const [approvedItems, setApprovedItems] = useState({});

  const handleRunAnalysis = async () => {
    if (!patientId) {
      setError('Patient session missing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/ai/doctor-prescription-recommendations', {
        patientId,
        appointmentId,
        diagnosis: diagnosis || 'General Consultation',
        symptoms: symptoms || '',
        notes: notes || ''
      });

      setAiData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'AI Prescription Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (rec) => {
    onApproveMedicine({
      medicineName: rec.medicineName,
      dosage: rec.dosage,
      frequency: rec.frequency,
      durationDays: rec.durationDays,
      quantityRequired: rec.quantityRequired
    });

    setApprovedItems((prev) => ({ ...prev, [rec.id]: true }));
  };

  return (
    <div className="glass-panel p-5 space-y-4 border-teal-500/30 rounded-2xl font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              Prescription AI Clinical Assistant <Sparkles className="w-4 h-4 text-teal-400" />
            </h4>
            <p className="text-[11px] text-slate-400">
              Cross-checks diagnosis & symptoms against past medical history for side effects and drug safety
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunAnalysis}
          disabled={loading}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing EMR History...' : 'Analyze & Suggest Prescription'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {!aiData && !loading && (
        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl text-center space-y-1">
          <p className="text-xs text-slate-400">
            Click <strong className="text-teal-300">"Analyze & Suggest Prescription"</strong> to scan patient's prior visits, past prescriptions, and potential side-effects before issuing medications.
          </p>
        </div>
      )}

      {/* AI Analysis Output */}
      {aiData && (
        <div className="space-y-4 text-xs">
          {/* Summary Banner */}
          <div className="bg-teal-950/30 border border-teal-500/40 p-3 rounded-xl flex items-start gap-2.5 text-teal-200">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs text-white">{aiData.summary}</p>
              {aiData.patientHistoryOverview && (
                <div className="flex items-center gap-4 text-[10px] text-teal-300/80 mt-1 font-mono">
                  <span>Past EMR Visits: {aiData.patientHistoryOverview.totalPastVisits}</span>
                  <span>Prior Medications Scanned: {aiData.patientHistoryOverview.pastMedicationsCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Recommended Medicines & Safety Analysis ({aiData.recommendations.length})
            </h5>

            {aiData.recommendations.map((rec) => {
              const isApproved = approvedItems[rec.id];

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-xl border space-y-3 transition-all ${
                    rec.riskLevel === 'HIGH_CONTRAINDICATION'
                      ? 'bg-rose-950/30 border-rose-800'
                      : rec.riskLevel === 'MODERATE_WARNING'
                      ? 'bg-amber-950/30 border-amber-800'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h6 className="font-bold text-white text-sm">{rec.medicineName}</h6>
                      <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono mt-0.5">
                        <span>Dosage: {rec.dosage}</span>
                        <span>•</span>
                        <span>Freq: {rec.frequency}</span>
                        <span>•</span>
                        <span>{rec.durationDays} Days</span>
                      </div>
                    </div>

                    {/* Risk Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        rec.riskLevel === 'HIGH_CONTRAINDICATION'
                          ? 'bg-rose-950 text-rose-300 border-rose-500'
                          : rec.riskLevel === 'MODERATE_WARNING'
                          ? 'bg-amber-950 text-amber-300 border-amber-500'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                      }`}
                    >
                      {rec.riskLevel === 'HIGH_CONTRAINDICATION'
                        ? '⚠️ Risk Alert'
                        : rec.riskLevel === 'MODERATE_WARNING'
                        ? '⚡ Caution'
                        : '✅ Verified Safe'}
                    </span>
                  </div>

                  {/* Rationale & Safety Note */}
                  <div className="space-y-1.5 text-[11px] bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                    <p className="text-slate-300">
                      <strong className="text-teal-400">Clinical Rationale:</strong> {rec.reasoning}
                    </p>

                    {rec.interactionWarning ? (
                      <p className="text-amber-300 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        {rec.interactionWarning}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-[10px]">
                        <strong className="text-slate-300">Safety Check:</strong> {rec.safetyNote}
                      </p>
                    )}
                  </div>

                  {/* Action Button: Doctor Approval */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 italic">
                      Doctor approval required before appending to official prescription.
                    </span>

                    <button
                      type="button"
                      onClick={() => handleApprove(rec)}
                      disabled={isApproved}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition-all ${
                        isApproved
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 opacity-80 cursor-default'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approved & Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Approve & Add to Prescription
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptionAIAssistant;
