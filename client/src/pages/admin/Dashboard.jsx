import React, { useState, useEffect } from 'react';
import { Shield, Building2, Activity, Users, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const SystemAdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/metrics')
      .then((res) => setMetrics(res.data.metrics))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) return <div className="p-8 text-center text-slate-500 font-medium">Loading Platform Metrics...</div>;

  const platformChartData = [
    { name: 'Hospitals', count: metrics.totalHospitals, color: '#2563EB' },
    { name: 'Pending', count: metrics.pendingApprovals, color: '#F59E0B' },
    { name: 'Doctors', count: metrics.totalDoctors, color: '#14B8A6' },
    { name: 'Patients', count: metrics.totalPatients, color: '#6366F1' },
  ];

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Platform Admin Dashboard | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Poppins',sans-serif]">Global Platform Governance Center</h2>
            <p className="text-xs text-slate-500">Multi-Hospital Tenant Management & Dual-Verification Governance</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/hospitals')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Building2 className="w-4 h-4" /> Hospital Directory & Approvals
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/admin/hospitals')}>
          <span className="text-slate-500 font-semibold block uppercase text-[11px]">Hospitals Onboarded</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 font-['Poppins',sans-serif]">{metrics.totalHospitals}</p>
        </div>

        <div className="bg-white border border-amber-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-amber-50/30" onClick={() => navigate('/admin/hospitals')}>
          <span className="text-amber-700 font-semibold block uppercase text-[11px]">Pending Approvals</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-1 font-['Poppins',sans-serif]">{metrics.pendingApprovals}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer">
          <span className="text-slate-500 font-semibold block uppercase text-[11px]">Platform Doctors</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-1 font-['Poppins',sans-serif]">{metrics.totalDoctors}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer">
          <span className="text-slate-500 font-semibold block uppercase text-[11px]">Registered Patients</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1 font-['Poppins',sans-serif]">{metrics.totalPatients}</p>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 font-['Poppins',sans-serif]">
          Multi-Tenant Platform Governance Metrics
        </h3>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {platformChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;
