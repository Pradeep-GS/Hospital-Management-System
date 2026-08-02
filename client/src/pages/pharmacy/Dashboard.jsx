import React, { useState, useEffect } from 'react';
import { Pill, Receipt, Package, ArrowRight, Building2, Activity, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

  const chartData = [
    { name: 'Pending Prescriptions', count: prescriptions.length, color: '#2563EB' },
    { name: 'Medicine Inventory', count: inventory.length, color: '#14B8A6' },
    { name: 'Low Stock Items', count: inventory.filter(i => i.stockQuantity <= i.reorderLevel).length, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <Helmet>
        <title>Pharmacy Dashboard | AegisCare ERP</title>
      </Helmet>

      {/* Top Banner displaying Hospital Name */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase text-indigo-700 font-mono tracking-wider">
                Facility Scope: {hospitalInfo?.name || 'City Central Hospital'} ({hospitalInfo?.hospitalCode || 'HOSP-METRO-01'})
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5 font-['Poppins',sans-serif]">Pharmacy & GST Invoicing Terminal</h2>
            <p className="text-xs text-slate-500">Automated Prescription Routing, Itemized GST Billing & EMR Lock Control</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/pharmacy/prescriptions')}
          className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 hover:border-blue-300"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Pill className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base font-['Poppins',sans-serif]">Pending Prescriptions</h3>
          <p className="text-xs text-slate-500">{prescriptions.length} Prescriptions waiting from Doctors.</p>
          <span className="text-xs text-blue-600 font-bold inline-flex items-center gap-1">Process Prescriptions <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>

        <div
          onClick={() => navigate('/pharmacy/billing')}
          className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 hover:border-blue-300"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base font-['Poppins',sans-serif]">GST Billing & Checkout</h3>
          <p className="text-xs text-slate-500">Calculate itemized bill, consultant & room fees, collect payment.</p>
          <span className="text-xs text-teal-600 font-bold inline-flex items-center gap-1">Open Billing Engine <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>

        <div
          onClick={() => navigate('/pharmacy/inventory')}
          className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 hover:border-blue-300"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base font-['Poppins',sans-serif]">Medicine Stock Inventory</h3>
          <p className="text-xs text-slate-500">{inventory.length} Medicine items tracked in hospital stock.</p>
          <span className="text-xs text-indigo-600 font-bold inline-flex items-center gap-1">View Inventory <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 font-['Poppins',sans-serif]">
          Pharmacy Operations & Inventory Metrics
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
    </div>
  );
};

export default PharmacyDashboard;
