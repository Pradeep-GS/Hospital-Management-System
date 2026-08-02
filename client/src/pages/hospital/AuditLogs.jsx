import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import api from '../../services/api';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hospitals/staff-logs')
      .then((res) => setLogs(res.data.logs))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Audit Logs...</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" /> Staff Sign-In / Logout & Emergency Access Audit Logs
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          {logs.map((l) => (
            <div key={l._id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                  l.action === 'SIGN_IN' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  l.action === 'EMERGENCY_ACCESS' ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {l.action}
                </span>
                <span className="font-bold text-white">{l.userName}</span>
                <span className="text-slate-500">({l.userRole})</span>
              </div>
              <span className="font-mono text-slate-400">{new Date(l.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
