import React, { useState } from 'react';
import api from '../../services/api';

export default function AISmartTriageModal({ isOpen, onClose }) {
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('35');
  const [symptoms, setSymptoms] = useState('');
  const [pulse, setPulse] = useState('78');
  const [temp, setTemp] = useState('37.0');
  const [bp, setBp] = useState('120/80');
  const [spO2, setSpO2] = useState('98');
  const [bloodSugar, setBloodSugar] = useState('');

  const [triageResult, setTriageResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRunTriage = async (e) => {
    e.preventDefault();
    if (!symptoms.trim() || !patientName.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/ai/triage', {
        patientName,
        patientAge: Number(age),
        symptoms,
        vitals: {
          pulse: Number(pulse),
          temperatureCelsius: Number(temp),
          bloodPressure: bp,
          spO2Percentage: Number(spO2),
          bloodSugar: bloodSugar ? Number(bloodSugar) : null
        }
      });
      setTriageResult(res.data.triageResult);
    } catch (err) {
      alert('AI Triage Calculation error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const colorBadgeMap = {
    RED: 'bg-red-600 text-white animate-bounce',
    ORANGE: 'bg-orange-500 text-white',
    YELLOW: 'bg-yellow-500 text-slate-900 font-bold',
    GREEN: 'bg-emerald-500 text-white font-bold'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">
              🚑
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Smart Emergency Triage System</h3>
              <p className="text-xs text-rose-400">Automated ESI Priority Classification & Emergency Alerting</p>
            </div>
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold transition">
            ✕
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleRunTriage} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Full Name *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age *</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Presenting Symptoms *</label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Severe retrosternal chest pain radiating to left arm..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              required
            />
          </div>

          {/* Vitals Input Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px]">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Pulse (bpm)</label>
              <input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white text-center font-mono" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Temp (°C)</label>
              <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white text-center font-mono" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">BP (mmHg)</label>
              <input type="text" value={bp} onChange={(e) => setBp(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white text-center font-mono" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">SpO₂ (%)</label>
              <input type="number" value={spO2} onChange={(e) => setSpO2(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white text-center font-mono" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Blood Sugar</label>
              <input type="number" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} placeholder="mg/dL" className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-white text-center font-mono" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !symptoms.trim() || !patientName.trim()}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            {loading ? '🚑 Calculating Smart Triage Priority...' : '✨ Run AI Smart Triage Analysis'}
          </button>
        </form>

        {/* Triage Output Card */}
        {triageResult && (
          <div className="printable-triage-card bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Emergency Triage Card</h4>
                <p className="text-[11px] text-slate-400">Card Code: {triageResult.triageCardCode}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${colorBadgeMap[triageResult.priorityColor]}`}>
                Priority: {triageResult.priorityColor} ({triageResult.priorityLevel})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block">Recommended Department</span>
                <p className="font-bold text-white text-sm mt-0.5">{triageResult.recommendedDept}</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block">Specialist Required</span>
                <p className="font-bold text-white text-sm mt-0.5">{triageResult.recommendedSpecialty}</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block">Expected Waiting Time</span>
                <p className="font-bold text-cyan-400 text-sm mt-0.5">{triageResult.expectedWaitTimeMinutes} Minutes</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block">Queue Priority Position</span>
                <p className="font-bold text-emerald-400 text-sm mt-0.5">#{triageResult.queuePosition} in Line</p>
              </div>
            </div>

            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200">
              📌 <strong>Triage Recommendation:</strong> {triageResult.emergencyRecommendation}
            </div>

            <button
              onClick={handlePrintCard}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              🖨️ Print Triage Card
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
