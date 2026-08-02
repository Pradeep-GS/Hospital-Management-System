import React, { useState, useEffect } from 'react';
import { Pill, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/pharmacy/prescriptions/pending')
      .then((res) => setPrescriptions(res.data.prescriptions))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Prescriptions...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-emerald-400" /> Pending Doctor Prescriptions
        </h3>

        <div className="space-y-3">
          {prescriptions.map((presc) => (
            <div key={presc._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-white text-sm">{presc.patientName}</h4>
                <p className="text-slate-400">Prescribed by: {presc.doctorName}</p>
                <span className="text-[11px] font-mono text-teal-400">{presc.items.length} Medicines</span>
              </div>
              <button
                onClick={() => navigate('/pharmacy/billing', { state: { presc } })}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                Checkout <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8">No pending prescriptions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
