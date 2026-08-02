import React, { useState, useEffect } from 'react';
import {
  Stethoscope, Activity, Users, Clock, FileText, CheckCircle2, Unlock,
  AlertCircle, Calendar, ArrowRight, UserCheck, Play, Pill, Plus, HeartPulse, ShieldAlert
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

export const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/doctors/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-slate-500 font-medium">Loading Clinical Workbench...</div>;

  const activeApt = data.queue.find((a) => a.status === 'ACTIVE');
  const waitingApts = data.queue.filter((a) => a.status === 'CHECKED_IN');
  const bookedApts = data.queue.filter((a) => a.status === 'BOOKED');
  const completedApts = data.queue.filter((a) => ['COMPLETED', 'PAID'].includes(a.status));
  const cancelledApts = data.queue.filter((a) => a.status === 'CANCELLED');

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const chartData = [
    { name: 'Active', count: activeApt ? 1 : 0, color: '#2563EB' },
    { name: 'Waiting', count: waitingApts.length, color: '#F97316' },
    { name: 'Booked', count: bookedApts.length, color: '#6366F1' },
    { name: 'Completed', count: completedApts.length, color: '#10B981' },
    { name: 'Cancelled', count: cancelledApts.length, color: '#EF4444' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 font-['Inter',sans-serif]"
    >
      <Helmet>
        <title>Doctor Dashboard | AegisCare ERP</title>
      </Helmet>

      {/* 1. GREETING HERO CARD WITH ABSTRACT MEDICAL GRAPHIC */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 text-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Background Subtle Glowing Accents & Medical Wave Pattern */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
            <HeartPulse className="w-3.5 h-3.5 text-teal-300 animate-pulse" /> Live Clinical Session
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Poppins',sans-serif]">
            👋 {getTimeGreeting()}, Dr. {data.doctor.name}
          </h1>

          {/* Quick Metrics Summary Chips */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100 font-medium pt-1">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-300" />
              <span><strong>{data.queue.length}</strong> appointments today</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300" />
              <span><strong>{waitingApts.length}</strong> patients waiting</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>Avg Consultation: <strong>14 min</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side Abstract Graphic / Session Badge */}
        <div className="relative z-10 hidden lg:flex flex-col items-end gap-3 text-right">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] text-blue-200 uppercase font-mono font-bold block">Consultation Room</span>
            <span className="text-lg font-bold text-white">Clinic 302 (Internal Medicine)</span>
            <span className="text-[11px] text-teal-300 font-mono block">Logged: {new Date(data.doctor.lastLogin).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS WITH SOFT ACCENT BACKGROUNDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Current Patient (#EFF6FF Soft Blue) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          className="bg-[#EFF6FF] border border-blue-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Current Patient</span>
            <h3 className="text-xl font-extrabold text-blue-950 font-['Poppins',sans-serif] truncate max-w-[140px]">
              {activeApt ? activeApt.patientName : 'None Active'}
            </h3>
            <p className="text-[11px] text-blue-600 font-mono font-semibold">
              {activeApt ? activeApt.appointmentNumber : 'Queue Idle'}
            </p>
          </div>
          <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <Unlock className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 2: Waiting Queue (#FFF7ED Soft Orange) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          className="bg-[#FFF7ED] border border-orange-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Waiting Queue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-orange-950 font-['Poppins',sans-serif]">{waitingApts.length}</span>
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                ↑ +12% today
              </span>
            </div>
            <p className="text-[11px] text-orange-600 font-medium">Patients checked in desk</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 3: Completed Consultations (#ECFDF5 Soft Green) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          className="bg-[#ECFDF5] border border-emerald-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Completed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-950 font-['Poppins',sans-serif]">{completedApts.length}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ On Track
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Prescriptions delivered</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 4: Cancelled Appointments (#FEF2F2 Soft Red) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          className="bg-[#FEF2F2] border border-rose-200 p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Cancelled</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-950 font-['Poppins',sans-serif]">{cancelledApts.length}</span>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                Normal
              </span>
            </div>
            <p className="text-[11px] text-rose-600 font-medium">Patient no-shows</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
        </motion.div>

      </div>

      {/* 3. MAIN DASHBOARD GRID: QUEUE & RECHARTS Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Live Queue Window */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
              <Activity className="w-5 h-5 text-blue-600" />
              Live Consultation Queue ({waitingApts.length} Waiting)
            </h3>
            <button
              onClick={() => navigate('/doctor/queue')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Full Queue Roster →
            </button>
          </div>

          <div className="space-y-3">
            {activeApt && (
              <div className="p-4 rounded-2xl border border-blue-300 bg-blue-50/70 flex items-center justify-between text-xs shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ★
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-950 text-sm">CURRENT ACTIVE: {activeApt.patientName}</h4>
                    <span className="text-blue-700 font-mono text-[11px] font-semibold">{activeApt.appointmentNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/doctor/emr')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Open EMR Window</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {waitingApts.map((apt) => (
              <div key={apt._id} className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] flex items-center justify-between text-xs hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3.5">
                  <span className="w-9 h-9 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center font-bold font-mono text-xs">
                    #{apt.queuePosition}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{apt.patientName}</h4>
                    <span className="text-slate-500 font-mono text-[11px]">{apt.appointmentNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/doctor/queue')}
                  className="bg-slate-900 hover:bg-blue-600 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors"
                >
                  Activate Consultation
                </button>
              </div>
            ))}

            {waitingApts.length === 0 && !activeApt && (
              <div className="text-center text-slate-400 text-xs py-12 space-y-2">
                <UserCheck className="w-9 h-9 mx-auto text-slate-300" />
                <p>No patients currently waiting in queue.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Analytics Chart */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <h3 className="text-xl font-bold text-slate-900 font-['Poppins',sans-serif] border-b border-slate-100 pb-3">
            Consultation Analytics
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

      </div>

      {/* 4. RECENT ACTIVITY TIMELINE & QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Activity Timeline Cards */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 font-['Poppins',sans-serif]">
            Recent Clinical Activity Timeline
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900">EMR Prescription Created</h4>
                  <span className="text-[10px] text-slate-400 font-mono">10:25 AM</span>
                </div>
                <p className="text-slate-500 mt-0.5">Paracetamol & Sumatriptan routed to Pharmacy for checkout.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900">Patient Consultation Activated</h4>
                  <span className="text-[10px] text-slate-400 font-mono">10:10 AM</span>
                </div>
                <p className="text-slate-500 mt-0.5">Unlocked clinical vitals window for active consultation.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 mt-1.5"></span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900">Reception Check-In Received</h4>
                  <span className="text-[10px] text-slate-400 font-mono">09:45 AM</span>
                </div>
                <p className="text-slate-500 mt-0.5">Universal QR Code scanned at reception desk.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Interactive Grid */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 font-['Poppins',sans-serif]">
            Doctor Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => navigate('/doctor/emr')}
              className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 cursor-pointer space-y-2 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Open EMR Window</h4>
              <p className="text-[11px] text-slate-500 leading-tight">View & edit patient clinical vitals</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => navigate('/doctor/prescriptions')}
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer space-y-2 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Pill className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Write Prescription</h4>
              <p className="text-[11px] text-slate-500 leading-tight">Issue multi-item prescriptions</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => navigate('/doctor/queue')}
              className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-50 cursor-pointer space-y-2 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">View Queue</h4>
              <p className="text-[11px] text-slate-500 leading-tight">Manage waiting patient check-ins</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => navigate('/doctor/profile')}
              className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 cursor-pointer space-y-2 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Profile Settings</h4>
              <p className="text-[11px] text-slate-500 leading-tight">Update room & specialty details</p>
            </motion.div>
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default DoctorDashboard;
