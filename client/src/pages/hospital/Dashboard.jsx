import React, { useState, useEffect } from 'react';
import { Building2, Stethoscope, Bed, Wind, Users, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, UserPlus, Activity } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

export const HospitalDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/hospitals/dashboard-metrics')
      .then((res) => setMetrics(res.data.metrics))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) return <div className="p-8 text-center text-slate-500 font-medium">Loading Hospital Metrics...</div>;

  const staffChartData = [
    { name: 'Doctors', count: metrics.doctorCount, color: '#2563EB' },
    { name: 'Nurses', count: metrics.nurseCount, color: '#14B8A6' },
    { name: 'Reception', count: metrics.receptionistCount, color: '#F97316' },
    { name: 'Pharmacy', count: metrics.pharmacyCount, color: '#6366F1' },
    { name: 'Lab Techs', count: metrics.labCount, color: '#EC4899' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 font-['Inter',sans-serif]"
    >
      <Helmet>
        <title>Hospital Admin Dashboard | AegisCare ERP</title>
      </Helmet>

      {/* 1. GREETING HERO CARD */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 rounded-3xl p-8 text-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
            <Building2 className="w-3.5 h-3.5 text-teal-300" /> Multi-Tenant Facility Governance
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Poppins',sans-serif]">
            👋 Welcome, {user?.hospitalName || 'Hospital Facility Administrator'}
          </h1>

          <p className="text-xs text-blue-100/90 font-medium leading-relaxed">
            Real-time management of doctors, nursing staff, receptionists, pharmacy inventory, ward room occupancy, and emergency oxygen allocation.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/hospital/staff')}
            className="bg-white hover:bg-blue-50 text-blue-700 font-bold px-5 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-blue-600" /> Add & Manage Hospital Staff
          </button>
        </div>
      </div>

      {/* 2. SOFT ACCENT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
        
        {/* Doctors Card (#EFF6FF Soft Blue) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/hospital/staff')}
          className="bg-[#EFF6FF] border border-blue-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Doctors On-Duty</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-950 font-['Poppins',sans-serif]">{metrics.doctorCount}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">Active</span>
            </div>
            <p className="text-[11px] text-blue-600 font-medium">Internal & Specialist Physicians</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Staff (#ECFDF5 Soft Green) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/hospital/staff')}
          className="bg-[#ECFDF5] border border-emerald-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Employees</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-950 font-['Poppins',sans-serif]">{metrics.totalEmployees}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Verified</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">All department staff</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Receptionists (#FFF7ED Soft Orange) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/hospital/staff')}
          className="bg-[#FFF7ED] border border-orange-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Reception Desk</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-orange-950 font-['Poppins',sans-serif]">{metrics.receptionistCount}</span>
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">Active</span>
            </div>
            <p className="text-[11px] text-orange-600 font-medium">Front desk operators</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Suspended Accounts (#FEF2F2 Soft Red) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/hospital/staff')}
          className="bg-[#FEF2F2] border border-rose-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Deactivated Staff</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-950 font-['Poppins',sans-serif]">{metrics.inactiveStaff}</span>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">Action Req</span>
            </div>
            <p className="text-[11px] text-rose-600 font-medium">Deactivated user accounts</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </motion.div>

      </div>

      {/* 3. CHARTS & WARDS OCCUPANCY SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Staff Breakdown Recharts Chart */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <h3 className="text-xl font-bold text-slate-900 font-['Poppins',sans-serif] border-b border-slate-100 pb-3">
            Employee Department & Role Distribution
          </h3>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px', boxShadow: '0 4px 20px rgba(15,23,42,0.06)' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {staffChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wards & Oxygen Summary Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5 font-['Poppins',sans-serif]">
              <span className="flex items-center gap-2"><Bed className="w-4 h-4 text-blue-600" /> Wards Occupancy</span>
              <button onClick={() => navigate('/hospital/rooms')} className="text-blue-600 hover:underline text-xs font-semibold">View Wards →</button>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total</span>
                <span className="font-bold text-slate-900 text-base">{metrics.rooms.total}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                <span className="block text-[10px] uppercase font-semibold">Occupied</span>
                <span className="font-bold text-base">{metrics.rooms.occupied}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <span className="block text-[10px] uppercase font-semibold">Available</span>
                <span className="font-bold text-base">{metrics.rooms.available}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5 font-['Poppins',sans-serif]">
              <span className="flex items-center gap-2"><Wind className="w-4 h-4 text-teal-600" /> Oxygen Cylinders Roster</span>
              <button onClick={() => navigate('/hospital/oxygen')} className="text-teal-600 hover:underline text-xs font-semibold">Manage Stock →</button>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Units</span>
                <span className="font-bold text-slate-900 text-base">{metrics.machinery.totalOxygenCylinders}</span>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-800">
                <span className="block text-[10px] uppercase font-semibold">Available</span>
                <span className="font-bold text-base">{metrics.machinery.availableOxygenCylinders}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default HospitalDashboard;
