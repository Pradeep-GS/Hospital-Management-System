import React, { useState, useEffect } from 'react';
import { Shield, Building2, Activity, Users, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

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
    { name: 'Pending', count: metrics.pendingApprovals, color: '#F97316' },
    { name: 'Doctors', count: metrics.totalDoctors, color: '#10B981' },
    { name: 'Patients', count: metrics.totalPatients, color: '#8B5CF6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 font-['Inter',sans-serif]"
    >
      <Helmet>
        <title>Platform Admin Dashboard | AegisCare ERP</title>
      </Helmet>

      {/* 1. GREETING HERO CARD */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-purple-100">
            <Shield className="w-3.5 h-3.5 text-purple-300" /> Platform Multi-Tenant Governance Engine
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Poppins',sans-serif]">
            👋 Welcome, Platform System Administrator
          </h1>

          <p className="text-xs text-purple-100/90 font-medium leading-relaxed">
            Oversee tenant onboarding, dual-verification hospital approvals, system audit logs, and global patient UPID registries.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/admin/hospitals')}
            className="bg-white hover:bg-purple-50 text-purple-800 font-bold px-5 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-purple-600" /> Manage Onboarding & Approvals
          </button>
        </div>
      </div>

      {/* 2. SOFT ACCENT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
        
        {/* Onboarded Hospitals (#EFF6FF Soft Blue) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/admin/hospitals')}
          className="bg-[#EFF6FF] border border-blue-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Hospitals Onboarded</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-950 font-['Poppins',sans-serif]">{metrics.totalHospitals}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">Active</span>
            </div>
            <p className="text-[11px] text-blue-600 font-medium">Multi-tenant facility scope</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Pending Approvals (#FFF7ED Soft Orange) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/admin/hospitals')}
          className="bg-[#FFF7ED] border border-orange-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Pending Verification</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-orange-950 font-['Poppins',sans-serif]">{metrics.pendingApprovals}</span>
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">Action Req</span>
            </div>
            <p className="text-[11px] text-orange-600 font-medium">Awaiting dual verification</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Platform Doctors (#ECFDF5 Soft Green) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          className="bg-[#ECFDF5] border border-emerald-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Platform Doctors</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-950 font-['Poppins',sans-serif]">{metrics.totalDoctors}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Verified</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Across all medical tenants</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Registered Patients (#F3E8FF Soft Purple) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          className="bg-[#F3E8FF] border border-purple-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Registered Patients</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-purple-950 font-['Poppins',sans-serif]">{metrics.totalPatients}</span>
              <span className="text-[11px] font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">UPID Active</span>
            </div>
            <p className="text-[11px] text-purple-600 font-medium">Universal Health Passports</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </motion.div>

      </div>

      {/* 3. RECHARTS GOVERNANCE CHART */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
        <h3 className="text-xl font-bold text-slate-900 font-['Poppins',sans-serif] border-b border-slate-100 pb-3">
          Multi-Tenant Platform Growth & Governance Metrics
        </h3>
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px', boxShadow: '0 4px 20px rgba(15,23,42,0.06)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {platformChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemAdminDashboard;
