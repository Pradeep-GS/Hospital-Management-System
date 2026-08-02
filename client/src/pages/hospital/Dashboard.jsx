import React, { useState, useEffect } from 'react';
import { Building2, Stethoscope, Bed, Wind, Users, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    { name: 'Reception', count: metrics.receptionistCount, color: '#F59E0B' },
    { name: 'Pharmacy', count: metrics.pharmacyCount, color: '#6366F1' },
    { name: 'Lab Techs', count: metrics.labCount, color: '#EC4899' },
  ];

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Hospital Dashboard | AegisCare ERP</title>
      </Helmet>

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Poppins',sans-serif]">{user?.hospitalName || 'Hospital Facility'} Operations</h2>
            <p className="text-xs text-slate-500 font-medium">Hospital Multi-Tenant Staff & Facility Control Panel</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/hospital/staff')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Users className="w-4 h-4" /> Manage Hospital Staff
        </button>
      </div>

      {/* Staff Counts Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-500 font-semibold block uppercase text-[11px]">Doctors</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-1 font-['Poppins',sans-serif]">{metrics.doctorCount}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-500 font-semibold block uppercase text-[11px]">Nurses</span>
          <p className="text-3xl font-extrabold text-teal-600 mt-1 font-['Poppins',sans-serif]">{metrics.nurseCount}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-500 font-semibold block uppercase text-[11px]">Receptionists</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-1 font-['Poppins',sans-serif]">{metrics.receptionistCount}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-500 font-semibold block uppercase text-[11px]">Pharmacy Staff</span>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1 font-['Poppins',sans-serif]">{metrics.pharmacyCount}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-500 font-semibold block uppercase text-[11px]">Total Staff</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 font-['Poppins',sans-serif]">{metrics.totalEmployees}</p>
        </div>

        <div className="bg-white border border-emerald-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-emerald-50/30" onClick={() => navigate('/hospital/staff')}>
          <span className="text-emerald-700 font-semibold block uppercase text-[11px]">Active Accounts</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1 font-['Poppins',sans-serif]">{metrics.activeStaff}</p>
        </div>

        <div className="bg-white border border-rose-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-rose-50/30" onClick={() => navigate('/hospital/staff')}>
          <span className="text-rose-700 font-semibold block uppercase text-[11px]">Suspended Staff</span>
          <p className="text-3xl font-extrabold text-rose-600 mt-1 font-['Poppins',sans-serif]">{metrics.inactiveStaff}</p>
        </div>

        <div className="bg-white border border-purple-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-purple-50/30" onClick={() => navigate('/hospital/staff')}>
          <span className="text-purple-700 font-semibold block uppercase text-[11px]">Lab Technicians</span>
          <p className="text-3xl font-extrabold text-purple-600 mt-1 font-['Poppins',sans-serif]">{metrics.labCount}</p>
        </div>
      </div>

      {/* Analytics Chart & Facility Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Staff Breakdown Chart */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 font-['Poppins',sans-serif]">
            Hospital Employee Roles Distribution
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {staffChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wards & Oxygen Summary */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2"><Bed className="w-4 h-4 text-blue-600" /> Wards & Rooms Occupancy</span>
              <button onClick={() => navigate('/hospital/rooms')} className="text-blue-600 hover:underline text-xs font-semibold">View Wards →</button>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Total Rooms</span>
                <span className="font-bold text-slate-900 text-base">{metrics.rooms.total}</span>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                <span className="block text-[10px]">Occupied</span>
                <span className="font-bold text-base">{metrics.rooms.occupied}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <span className="block text-[10px]">Available</span>
                <span className="font-bold text-base">{metrics.rooms.available}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2"><Wind className="w-4 h-4 text-teal-600" /> Oxygen Cylinders Roster</span>
              <button onClick={() => navigate('/hospital/oxygen')} className="text-teal-600 hover:underline text-xs font-semibold">Manage Stock →</button>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Total Cylinders</span>
                <span className="font-bold text-slate-900 text-base">{metrics.machinery.totalOxygenCylinders}</span>
              </div>
              <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200 text-teal-800">
                <span className="block text-[10px]">Available Units</span>
                <span className="font-bold text-base">{metrics.machinery.availableOxygenCylinders}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;
