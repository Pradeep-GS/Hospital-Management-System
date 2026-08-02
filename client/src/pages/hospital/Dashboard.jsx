import React, { useState, useEffect } from 'react';
import { Building2, Stethoscope, Bed, Wind, Users, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

  if (loading || !metrics) return <div className="p-8 text-center text-slate-400">Loading Hospital Metrics...</div>;

  return (
    <div className="space-y-6 text-xs">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white text-base">{user?.hospitalName || 'Hospital Facility'} Operations</h2>
            <p className="text-xs text-slate-400">Hospital Multi-Tenant Staff & Facility Control</p>
          </div>
        </div>
      </div>

      {/* Staff Counts Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Doctors Card */}
        <div className="glass-panel p-5 cursor-pointer hover:border-blue-500/30 transition-all" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-400 font-semibold block uppercase">Doctors</span>
          <p className="text-2xl font-extrabold text-white mt-1">{metrics.doctorCount}</p>
        </div>

        {/* Nurses Card */}
        <div className="glass-panel p-5 cursor-pointer hover:border-blue-500/30 transition-all" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-400 font-semibold block uppercase">Nurses</span>
          <p className="text-2xl font-extrabold text-white mt-1">{metrics.nurseCount}</p>
        </div>

        {/* Receptionists Card */}
        <div className="glass-panel p-5 cursor-pointer hover:border-blue-500/30 transition-all" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-400 font-semibold block uppercase">Receptionists</span>
          <p className="text-2xl font-extrabold text-white mt-1">{metrics.receptionistCount}</p>
        </div>

        {/* Pharmacy Card */}
        <div className="glass-panel p-5 cursor-pointer hover:border-blue-500/30 transition-all" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-400 font-semibold block uppercase">Pharmacy Staff</span>
          <p className="text-2xl font-extrabold text-white mt-1">{metrics.pharmacyCount}</p>
        </div>

        {/* Lab Tech Card */}
        <div className="glass-panel p-5 cursor-pointer hover:border-blue-500/30 transition-all" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-400 font-semibold block uppercase">Lab Technicians</span>
          <p className="text-2xl font-extrabold text-white mt-1">{metrics.labCount}</p>
        </div>

        {/* Total Employees */}
        <div className="glass-panel p-5 cursor-pointer hover:border-blue-500/30 transition-all" onClick={() => navigate('/hospital/staff')}>
          <span className="text-slate-400 font-semibold block uppercase font-mono">Total Staff</span>
          <p className="text-2xl font-extrabold text-white mt-1">{metrics.totalEmployees}</p>
        </div>

        {/* Active Staff */}
        <div className="glass-panel p-5 border-emerald-500/20 cursor-pointer" onClick={() => navigate('/hospital/staff')}>
          <span className="text-emerald-400 font-semibold block uppercase">Active Accounts</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{metrics.activeStaff}</p>
        </div>

        {/* Inactive Staff */}
        <div className="glass-panel p-5 border-rose-500/20 cursor-pointer" onClick={() => navigate('/hospital/staff')}>
          <span className="text-rose-400 font-semibold block uppercase">Suspended / Inactive</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">{metrics.inactiveStaff}</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Rooms Summary */}
        <div className="md:col-span-6 glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3" onClick={() => navigate('/hospital/rooms')}>
            <Bed className="w-5 h-5 text-blue-400" />
            Wards & Rooms Occupancy Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Total Ward Rooms</span>
              <span className="font-bold text-white">{metrics.rooms.total}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Occupied Beds</span>
              <span className="font-bold text-rose-400">{metrics.rooms.occupied}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Available Beds</span>
              <span className="font-bold text-emerald-400">{metrics.rooms.available}</span>
            </div>
          </div>
        </div>

        {/* Oxygen Cylinder Summary */}
        <div className="md:col-span-6 glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3" onClick={() => navigate('/hospital/oxygen')}>
            <Wind className="w-5 h-5 text-cyan-400" />
            Oxygen Cylinders Roster Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Total Cylinders</span>
              <span className="font-bold text-white">{metrics.machinery.totalOxygenCylinders}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Available Cylinders</span>
              <span className="font-bold text-cyan-400">{metrics.machinery.availableOxygenCylinders}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default HospitalDashboard;
