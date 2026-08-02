import React, { useState, useEffect } from 'react';
import { Stethoscope, Activity, Users, Clock, FileText, CheckCircle2, Unlock, AlertCircle, Calendar, ArrowRight, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

  if (loading || !data) return <div className="p-8 text-center text-slate-500 font-medium">Loading Doctor Workbench...</div>;

  const activeApt = data.queue.find((a) => a.status === 'ACTIVE');
  const waitingApts = data.queue.filter((a) => a.status === 'CHECKED_IN');
  const bookedApts = data.queue.filter((a) => a.status === 'BOOKED');
  const completedApts = data.queue.filter((a) => ['COMPLETED', 'PAID'].includes(a.status));
  const cancelledApts = data.queue.filter((a) => a.status === 'CANCELLED');

  const chartData = [
    { name: 'Active', count: activeApt ? 1 : 0, color: '#2563EB' },
    { name: 'Waiting', count: waitingApts.length, color: '#F59E0B' },
    { name: 'Booked', count: bookedApts.length, color: '#6366F1' },
    { name: 'Completed', count: completedApts.length, color: '#22C55E' },
    { name: 'Cancelled', count: cancelledApts.length, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Doctor Dashboard | AegisCare ERP</title>
      </Helmet>

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Poppins',sans-serif]">Welcome, {data.doctor.name}</h2>
            <p className="text-xs text-slate-500 font-medium">Internal Medicine & Diagnostics | Consultation Clinic 302</p>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-3 text-xs">
          <Clock className="w-4 h-4 text-blue-600" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Active Session</span>
            <span className="font-mono text-slate-900 font-bold">{new Date(data.doctor.lastLogin).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Patient</span>
          <p className="text-sm font-bold text-blue-600 mt-2 truncate flex items-center gap-1.5">
            <Unlock className="w-4 h-4" />
            {activeApt ? activeApt.patientName : 'No Active Patient'}
          </p>
        </div>

        <div className="bg-white border border-amber-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all bg-gradient-to-br from-white to-amber-50/30">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Waiting Queue</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-1 font-['Poppins',sans-serif]">{waitingApts.length}</p>
        </div>

        <div className="bg-white border border-emerald-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all bg-gradient-to-br from-white to-emerald-50/30">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Completed Consultations</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1 font-['Poppins',sans-serif]">{completedApts.length}</p>
        </div>

        <div className="bg-white border border-rose-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all bg-gradient-to-br from-white to-rose-50/30">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Cancelled</span>
          <p className="text-3xl font-extrabold text-rose-600 mt-1 font-['Poppins',sans-serif]">{cancelledApts.length}</p>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Waiting Queue & Current Active */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 font-['Poppins',sans-serif]">
            <Activity className="w-5 h-5 text-blue-600" />
            Live Waiting Queue ({waitingApts.length})
          </h3>

          <div className="space-y-3">
            {activeApt && (
              <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/60 flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    ★
                  </span>
                  <div>
                    <h4 className="font-bold text-blue-950 text-sm">CURRENT: {activeApt.patientName}</h4>
                    <span className="text-blue-700 font-mono text-[11px] font-semibold">{activeApt.appointmentNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/doctor/emr')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-all flex items-center gap-1"
                >
                  <span>Open EMR Workbench</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {waitingApts.map((apt) => (
              <div key={apt._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                    #{apt.queuePosition}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{apt.patientName}</h4>
                    <span className="text-slate-500 font-mono">{apt.appointmentNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/doctor/queue')}
                  className="bg-slate-900 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Activate Consultation
                </button>
              </div>
            ))}

            {waitingApts.length === 0 && !activeApt && (
              <div className="text-center text-slate-400 text-xs py-10 space-y-2">
                <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
                <p>No patients currently waiting in queue.</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Chart & Appointments Roster */}
        <div className="space-y-6">
          
          {/* Recharts Queue Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 font-['Poppins',sans-serif]">
              Today's Consultation Analytics
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completed / Booked Roster */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Appointment History</span>
              <span className="text-xs text-slate-500 font-mono">Total: {data.queue.length}</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {completedApts.map((apt) => (
                <div key={apt._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{apt.patientName}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">{apt.appointmentNumber}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                    COMPLETED
                  </span>
                </div>
              ))}

              {bookedApts.map((apt) => (
                <div key={apt._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{apt.patientName}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">{apt.appointmentNumber}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">
                    BOOKED (ONLINE)
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
