import React, { useState } from 'react';
import api from '../../services/api';

export default function NoShowPredictionBadge({ appointmentId, initialPrediction }) {
  const [prediction, setPrediction] = useState(initialPrediction || null);
  const [loading, setLoading] = useState(false);

  const fetchPrediction = async () => {
    if (!appointmentId) return;
    setLoading(true);
    try {
      const res = await api.get(`/ai/predict-noshow/${appointmentId}`);
      setPrediction(res.data.prediction);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!prediction) {
    return (
      <button
        onClick={fetchPrediction}
        disabled={loading}
        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg border border-slate-700 transition"
      >
        {loading ? 'Analyzing...' : '🎯 Predict No-Show'}
      </button>
    );
  }

  const noShowProb = prediction.noShowProbability || 15;
  const isHighRisk = noShowProb >= 35;

  return (
    <div className="inline-flex items-center gap-2 p-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-semibold">Attendance Prob:</span>
          <span className="font-bold text-emerald-400">{prediction.attendanceProbability}%</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            isHighRisk ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {isHighRisk ? 'High No-Show Risk' : 'Low Risk'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          💡 AI Rec: <span className="text-white font-medium">{prediction.recommendedAction}</span>
        </p>
      </div>
    </div>
  );
}
