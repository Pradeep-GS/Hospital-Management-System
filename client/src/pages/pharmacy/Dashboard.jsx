import React, { useState, useEffect } from 'react';
import { Pill, Receipt, Package, ArrowRight, Building2, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

export const PharmacyDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/pharmacy/prescriptions/pending'),
      api.get('/pharmacy/inventory'),
      api.get('/pharmacy/hospital-details')
    ])
      .then(([pRes, iRes, hRes]) => {
        setPrescriptions(pRes.data.prescriptions || []);
        setInventory(iRes.data.inventory || []);
        setHospitalInfo(hRes.data.hospital);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Pharmacy Center...</div>;

  const lowStockCount = inventory.filter(i => i.stockQuantity <= i.reorderLevel).length;

  const chartData = [
    { name: 'Pending Prescriptions', count: prescriptions.length, color: '#2563EB' },
    { name: 'Stock Assets', count: inventory.length, color: '#10B981' },
    { name: 'Low Stock Alerts', count: lowStockCount, color: '#F97316' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 font-['Inter',sans-serif]"
    >
      <Helmet>
        <title>Pharmacy Dashboard | AegisCare ERP</title>
      </Helmet>

      {/* 1. GREETING HERO CARD */}
      <div className="bg-gradient-to-r from-indigo-800 via-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-100">
            <Building2 className="w-3.5 h-3.5 text-teal-300" />
            <span>Scope: {hospitalInfo?.name || 'Primary Facility'} ({hospitalInfo?.hospitalCode || 'HOSP-01'})</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Poppins',sans-serif]">
            👋 Pharmacy & GST Invoicing Terminal
          </h1>

          <p className="text-xs text-indigo-100/90 font-medium leading-relaxed">
            Automated prescription routing, batch expiration tracking, GST tax calculation, and EMR checkout lock release.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/pharmacy/billing')}
            className="bg-white hover:bg-indigo-50 text-indigo-900 font-bold px-5 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Receipt className="w-4 h-4 text-indigo-600" /> Open GST Billing Engine
          </button>
        </div>
      </div>

      {/* 2. SOFT ACCENT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
        
        {/* Pending Prescriptions (#EFF6FF Soft Blue) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/pharmacy/prescriptions')}
          className="bg-[#EFF6FF] border border-blue-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Pending Prescriptions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-950 font-['Poppins',sans-serif]">{prescriptions.length}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">Doctor Routed</span>
            </div>
            <p className="text-[11px] text-blue-600 font-medium">Ready for checkout</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <Pill className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Medicine Inventory Assets (#ECFDF5 Soft Green) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/pharmacy/inventory')}
          className="bg-[#ECFDF5] border border-emerald-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Stock Medicine Assets</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-950 font-['Poppins',sans-serif]">{inventory.length}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Tracked</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Batch & expiration active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Low Stock Alerts (#FFF7ED Soft Orange) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/pharmacy/inventory')}
          className="bg-[#FFF7ED] border border-orange-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Low Stock Reorders</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-orange-950 font-['Poppins',sans-serif]">{lowStockCount}</span>
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">Alert</span>
            </div>
            <p className="text-[11px] text-orange-600 font-medium">Below reorder threshold</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </motion.div>

      </div>

      {/* 3. RECHARTS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Analytics */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <h3 className="text-xl font-bold text-slate-900 font-['Poppins',sans-serif] border-b border-slate-100 pb-3">
            Pharmacy Operations Breakdown
          </h3>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px', boxShadow: '0 4px 20px rgba(15,23,42,0.06)' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Action Cards Grid */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 font-['Poppins',sans-serif]">
            Pharmacy Quick Actions
          </h3>

          <div className="space-y-3 text-xs">
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => navigate('/pharmacy/prescriptions')}
              className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Process Pending Prescriptions</h4>
                  <p className="text-[11px] text-slate-500">Checkout doctor-prescribed medications</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => navigate('/pharmacy/billing')}
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">GST Billing & Checkout Engine</h4>
                  <p className="text-[11px] text-slate-500">Itemized tax receipts & EMR lock release</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => navigate('/pharmacy/inventory')}
              className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Manage Medicine Inventory</h4>
                  <p className="text-[11px] text-slate-500">Add asset rows & restock batch items</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </motion.div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default PharmacyDashboard;
