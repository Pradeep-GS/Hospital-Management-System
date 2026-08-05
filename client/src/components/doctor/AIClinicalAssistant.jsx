import React, { useState } from 'react';
import api from '../../services/api';

export default function AIClinicalAssistant({ onApplyDiagnosis }) {
  const [symptoms, setSymptoms] = useState('');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [heartRate, setHeartRate] = useState('75');
  const [temp, setTemp] = useState('37.0');
  const [spO2, setSpO2] = useState('98');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/clinical-assistant', {
        symptoms,
        vitals: {
          bloodPressure,
          heartRate: Number(heartRate),
          temperatureCelsius: Number(temp),
          spO2Percentage: Number(spO2)
        },
        medicalHistory,
        allergies
      });
      setAnalysis(res.data);
    } catch (err) {
      setError('Clinical analysis error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
            🧠
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Clinical Decision Assistant</h3>
            <p className="text-xs text-indigo-400">Differential diagnosis, investigation & treatment recommendations</p>
          </div>
        </div>

        <span className="text-[11px] px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full font-semibold">
          Decision Support System
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Chief Symptoms & Presentation *</label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Chest discomfort, dyspnea on exertion, diaphoresis..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Past History & Allergies</label>
            <textarea
              rows={2}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="e.g. Hypertension 5 yrs, Penicillin allergy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Vitals Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase">BP (mmHg)</label>
            <input
              type="text"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Heart Rate (bpm)</label>
            <input
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase">SpO₂ (%)</label>
            <input
              type="number"
              value={spO2}
              onChange={(e) => setSpO2(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !symptoms.trim()}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition"
        >
          {loading ? '⚡ AI Clinical Reasoning in Progress...' : '✨ Run AI Clinical Analysis'}
        </button>
      </form>

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-5 pt-4 border-t border-slate-800">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Confidence Score</span>
              <p className="text-xl font-black text-cyan-400">{(analysis.confidenceScore * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Clinical Risk Score</span>
              <p className={`text-xl font-black ${analysis.riskScore > 7 ? 'text-rose-400' : 'text-amber-400'}`}>
                {analysis.riskScore} / 10
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Suspected Diagnosis</span>
              <p className="text-xs font-bold text-white truncate mt-1">{analysis.suggestedDiagnosis}</p>
            </div>
          </div>

          {/* Possible Diseases Table */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Differential Diagnosis</h4>
            <div className="space-y-2">
              {analysis.possibleDiseases?.map((d, i) => (
                <div key={i} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white">{d.disease}</span>
                    <p className="text-[11px] text-slate-400">{d.reasoning}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    d.probability === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {d.probability}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Investigations & Treatment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-cyan-400 uppercase mb-2">Suggested Investigations</h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {analysis.suggestedInvestigations?.map((inv, i) => (
                  <li key={i}>{inv}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Treatment Recommendations</h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {analysis.treatmentRecommendations?.map((rx, i) => (
                  <li key={i}>{rx}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons for Doctor */}
          <div className="flex gap-3">
            <button
              onClick={() => onApplyDiagnosis && onApplyDiagnosis(analysis.suggestedDiagnosis)}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg"
            >
              ✓ Approve & Insert Diagnosis
            </button>
            <button
              onClick={() => setAnalysis(null)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Reject / Dismiss
            </button>
          </div>

          {/* MANDATORY LEGAL DISCLAIMER */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 text-center font-medium">
            ⚠️ {analysis.disclaimer}
          </div>

        </div>
      )}

    </div>
  );
}
