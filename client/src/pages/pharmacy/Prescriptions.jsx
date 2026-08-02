import React, { useState, useEffect } from 'react';
import { Pill, ArrowRight, User } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/pharmacy/prescriptions/pending')
      .then((res) => setPrescriptions(res.data.prescriptions || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Prescriptions...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-['Inter',sans-serif]">
      <Helmet>
        <title>Pending Prescriptions | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Pill className="w-5 h-5 text-blue-600" /> Pending Doctor Prescriptions Roster
          </h3>
          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
            {prescriptions.length} Pending
          </span>
        </div>

        <div className="space-y-3">
          {prescriptions.map((presc) => (
            <div key={presc._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs hover:border-blue-300 transition-colors">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" /> {presc.patientName}
                </h4>
                <p className="text-slate-500 mt-0.5">Prescribed by: <strong className="text-slate-800">{presc.doctorName}</strong></p>
                <span className="text-[11px] font-mono text-blue-600 font-semibold mt-1 inline-block bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {presc.items?.length || 0} Medicines Prescribed
                </span>
              </div>
              <button
                onClick={() => navigate('/pharmacy/billing', { state: { presc } })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all text-xs"
              >
                <span>Proceed to Billing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <p className="text-center text-slate-400 text-xs py-12">No pending prescriptions waiting in pharmacy queue.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
