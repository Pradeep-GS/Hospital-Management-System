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
      className="space-y-4 sm:space-y-6 font-['Inter',sans-serif]"
    >
      <Helmet>
        <title>Doctor Dashboard | AegisCare ERP</title>
      </Helmet>

      {/* 1. GREETING HERO CARD WITH ABSTRACT MEDICAL GRAPHIC */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        
        {/* Background Subtle Glowing Accents */}
        <div className="absolute -top-12 -right-12 w-60 sm:w-80 h-60 sm:h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-40 sm:w-60 h-40 sm:h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2 sm:space-y-4 max-w-2xl min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
            <HeartPulse className="w-3.5 h-3.5 text-teal-300 animate-pulse" /> Live Clinical Session
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white font-['Poppins',sans-serif] truncate">
            👋 {getTimeGreeting()}, Dr. {data.doctor.name}
          </h1>

          {/* Quick Metrics Summary Chips */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-blue-100 font-medium pt-1">
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-300 shrink-0" />
              <span><strong>{data.queue.length}</strong> appts</span>
            </div>
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span><strong>{waitingApts.length}</strong> waiting</span>
            </div>
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5 sm:gap-2">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
              <span>Avg: <strong>14 min</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side Consultation Room Info */}
        <div className="relative z-10 hidden sm:flex flex-col sm:items-end gap-2 text-right">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl space-y-0.5">
            <span className="text-[10px] text-blue-200 uppercase font-mono font-bold block">Consultation Room</span>
            <span className="text-sm sm:text-base font-bold text-white block">Clinic 302 (Internal Medicine)</span>
            <span className="text-[10px] text-teal-300 font-mono block">Logged: {new Date(data.doctor.lastLogin).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Card 1: Current Patient */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-[#EFF6FF] border border-blue-200 p-3.5 sm:p-6 rounded-2xl shadow-sm flex items-center justify-between min-w-0"
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-700">Current</span>
            <h3 className="text-base sm:text-xl font-extrabold text-blue-950 font-['Poppins',sans-serif] truncate">
              {activeApt ? activeApt.patientName : 'Idle'}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-blue-600 font-mono truncate">
              {activeApt ? activeApt.appointmentNumber : 'Queue ready'}
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <Unlock className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </motion.div>

        {/* Card 2: Waiting Queue */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-[#FFF7ED] border border-orange-200 p-3.5 sm:p-6 rounded-2xl shadow-sm flex items-center justify-between min-w-0"
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-700">Waiting</span>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-xl sm:text-3xl font-extrabold text-orange-950 font-['Poppins',sans-serif]">{waitingApts.length}</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-orange-600 font-medium truncate">In lobby desk</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </motion.div>

        {/* Card 3: Completed */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-[#ECFDF5] border border-emerald-200 p-3.5 sm:p-6 rounded-2xl shadow-sm flex items-center justify-between min-w-0"
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">Done</span>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-xl sm:text-3xl font-extrabold text-emerald-950 font-['Poppins',sans-serif]">{completedApts.length}</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium truncate">Delivered</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </motion.div>

        {/* Card 4: Cancelled */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-[#FEF2F2] border border-rose-200 p-3.5 sm:p-6 rounded-2xl shadow-sm flex items-center justify-between min-w-0"
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700">No Shows</span>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-xl sm:text-3xl font-extrabold text-rose-950 font-['Poppins',sans-serif]">{cancelledApts.length}</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-rose-600 font-medium truncate">Cancelled</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </motion.div>

      </div>

      {/* 3. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left: Live Queue Window */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif] truncate">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
              Live Consultation Queue
            </h3>
            <button
              onClick={() => navigate('/doctor/queue')}
              className="text-xs font-bold text-blue-600 hover:underline shrink-0"
            >
              Full Roster →
            </button>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {activeApt && (
              <div className="p-3.5 sm:p-4 rounded-2xl border border-blue-300 bg-blue-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    #1
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{activeApt.patientName}</h4>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{activeApt.appointmentNumber}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase">
                    ACTIVE
                  </span>
                  <button
                    onClick={() => navigate('/doctor/emr')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs"
                  >
                    Open EMR <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {waitingApts.slice(0, 4).map((apt, idx) => (
              <div
                key={apt._id}
                className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                    #{idx + 2}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{apt.patientName}</h4>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">{apt.appointmentNumber}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 uppercase border border-amber-200">
                    CHECKED IN
                  </span>
                </div>
              </div>
            ))}

            {!activeApt && waitingApts.length === 0 && (
              <div className="text-center text-slate-400 text-xs py-8">
                No active patients in consultation room.
              </div>
            )}
          </div>
        </div>

        {/* Right: Daily Analytics Chart */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4 min-w-0">
          <h3 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
            Daily Patient Distribution
          </h3>
          <div className="h-[200px] sm:h-[240px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default DoctorDashboard;
