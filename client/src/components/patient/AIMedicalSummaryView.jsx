import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AIMedicalSummaryView({ patientId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);

  const fetchSummary = async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/ai/patient-summary/${patientId}`);
      setSummary(res.data.summary);
    } catch (err) {
      setError('Failed to load AI Medical Summary.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/ai/patient-summary/${patientId}/history`);
      setHistoryLogs(res.data.histories || []);
      setShowHistoryModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [patientId]);

  if (loading) {
    return (
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-4 bg-slate-800 rounded w-2/3"></div>
        <div className="h-20 bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center">
        <p className="text-slate-400 text-sm mb-3">{error || 'No AI Medical Summary generated yet.'}</p>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl text-xs hover:bg-blue-500 transition"
        >
          ✨ Generate AI Summary
        </button>
      </div>
    );
  }

  const riskBadgeColor = {
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    MODERATE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
  }[summary.riskLevel || 'LOW'];

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-6 text-slate-200">
      
      {/* Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
            🩺
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              AI Medical History Summary
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v{summary.version || 1} Auto-Generated
              </span>
            </h3>
            <p className="text-xs text-slate-400">Comprehensive historical EHR snapshot for clinical decision support</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${riskBadgeColor}`}>
            Risk Level: {summary.riskLevel || 'LOW'}
          </span>

          <button
            onClick={fetchSummary}
            className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 rounded-xl text-xs font-semibold transition"
          >
            🔄 Regenerate Summary
          </button>

          <button
            onClick={fetchHistory}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
          >
            📜 Audit History
          </button>
        </div>
      </div>

      {/* Patient Overview */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Patient Clinical Overview</h4>
        <p className="text-sm text-slate-200 leading-relaxed">{summary.patientOverview}</p>
      </div>

      {/* High Risk Conditions & Important Alerts */}
      {(summary.importantAlerts?.length > 0 || summary.highRiskConditions?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.importantAlerts?.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-800/40 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                ⚠️ Critical Alerts
              </h4>
              <ul className="list-disc list-inside text-xs text-rose-200 space-y-1">
                {summary.importantAlerts.map((alert, i) => (
                  <li key={i}>{alert}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.highRiskConditions?.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-800/40 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                ⚡ High-Risk Conditions
              </h4>
              <ul className="list-disc list-inside text-xs text-amber-200 space-y-1">
                {summary.highRiskConditions.map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Medical Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Diagnoses & Allergies */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-4 min-w-0">
          <div>
            <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2.5">Previous Diagnoses</h5>
            <div className="flex flex-wrap gap-2">
              {summary.previousDiagnoses?.length > 0 ? (
                summary.previousDiagnoses.map((d, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 shadow-sm leading-normal">
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No previous diagnoses logged</span>
              )}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2.5">Allergies & Sensitivities</h5>
            <div className="flex flex-wrap gap-2">
              {summary.allergies?.length > 0 ? (
                summary.allergies.map((a, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-rose-500/10 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 flex items-center gap-1.5 shadow-sm leading-normal">
                    <span className="shrink-0">🚫</span> {a}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No known drug allergies</span>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Current Active Medications */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3 min-w-0">
          <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2.5">Current Active Medications</h5>
          <div className="space-y-2">
            {summary.currentMedications?.length > 0 ? (
              summary.currentMedications.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-200 flex items-center gap-2 min-w-0">
                  <span className="text-blue-400 text-sm shrink-0">💊</span>
                  <span className="font-semibold truncate">{m}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No active medications currently on file</p>
            )}
          </div>
        </div>

        {/* Column 3: Lifestyle Matrix */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3 min-w-0">
          <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5">Lifestyle Matrix</h5>
          <div className="space-y-2 text-xs">
            <div className="bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between gap-2 min-w-0">
              <span className="text-slate-400 font-medium text-xs shrink-0">🚬 Smoking</span>
              <span className="font-bold text-slate-100 text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 truncate">{summary.lifestyleHabits?.smoking || 'Non-smoker'}</span>
            </div>
            <div className="bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between gap-2 min-w-0">
              <span className="text-slate-400 font-medium text-xs shrink-0">🍷 Alcohol</span>
              <span className="font-bold text-slate-100 text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 truncate">{summary.lifestyleHabits?.alcohol || 'Occasional social'}</span>
            </div>
            <div className="bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between gap-2 min-w-0">
              <span className="text-slate-400 font-medium text-xs shrink-0">🏃 Exercise</span>
              <span className="font-bold text-slate-100 text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 truncate">{summary.lifestyleHabits?.exercise || 'Moderate 3x weekly'}</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1 min-w-0">
              <span className="text-slate-400 font-medium text-xs shrink-0">🥗 Diet</span>
              <span className="font-semibold text-slate-200 text-xs leading-relaxed">{summary.lifestyleHabits?.diet || 'Low sodium, balanced cardio diet'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lab & Radiology Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-cyan-400 uppercase mb-1">Laboratory Summary</h4>
          <p className="text-xs text-slate-300">{summary.laboratoryReportSummary || 'Routine labs unremarkable.'}</p>
        </div>

        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-cyan-400 uppercase mb-1">Radiology & Imaging Summary</h4>
          <p className="text-xs text-slate-300">{summary.radiologyReportSummary || 'No recent radiology findings.'}</p>
        </div>
      </div>

      {/* Audit History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">📜 Summary Audit Log History</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3">
              {historyLogs.map((log, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Version {log.version} - Risk: <span className="text-amber-400">{log.riskLevel}</span></p>
                    <p className="text-slate-400">Generated by: {log.generatedBy?.fullName || 'System'}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
