import React, { useState, useEffect } from 'react';
import { Shield, Building2, Activity, Users } from 'lucide-react';
import api from '../../services/api';

export const SystemAdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/metrics')
      .then((res) => setMetrics(res.data.metrics))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) return <div className="p-8 text-center text-slate-400">Loading Platform Metrics...</div>;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">System Admin Control Center</h2>
            <p className="text-xs text-slate-400">Multi-Hospital Tenant Governance & Global Metrics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Hospitals Onboarded</span>
          <p className="text-3xl font-extrabold text-white mt-1">{metrics.totalHospitals}</p>
        </div>
        <div className="glass-panel p-5 border-amber-500/30">
          <span className="text-xs font-semibold text-amber-400 uppercase">Pending Approvals</span>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">{metrics.pendingApprovals}</p>
        </div>
        <div className="glass-panel p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Platform Doctors</span>
          <p className="text-3xl font-extrabold text-white mt-1">{metrics.totalDoctors}</p>
        </div>
        <div className="glass-panel p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Registered Patients</span>
          <p className="text-3xl font-extrabold text-white mt-1">{metrics.totalPatients}</p>
        </div>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;
