import React, { useState, useEffect } from 'react';
import { Pill, Receipt, Package, ArrowRight, Building2 } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

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
        setPrescriptions(pRes.data.prescriptions);
        setInventory(iRes.data.inventory);
        setHospitalInfo(hRes.data.hospital);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Pharmacy Center...</div>;

  return (
    <div className="space-y-6 text-xs font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner displaying Hospital Name explicitly */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-extrabold uppercase text-emerald-400 font-mono tracking-wider">
                Hospital Facility: {hospitalInfo?.name || 'City Central Hospital'} ({hospitalInfo?.hospitalCode || 'HOSP-METRO-01'})
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">Pharmacy & GST Invoicing Center</h2>
            <p className="text-xs text-slate-400">Automated Prescription Routing, Itemized GST Billing & EMR Lock Control</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => navigate('/pharmacy/prescriptions')} className="glass-panel p-6 cursor-pointer hover:border-emerald-500/50 transition-all space-y-3">
          <Pill className="w-8 h-8 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Pending Prescriptions</h3>
          <p className="text-xs text-slate-400">{prescriptions.length} Prescriptions waiting from Doctors.</p>
          <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1">Process Prescriptions <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>

        <div onClick={() => navigate('/pharmacy/billing')} className="glass-panel p-6 cursor-pointer hover:border-emerald-500/50 transition-all space-y-3">
          <Receipt className="w-8 h-8 text-teal-400" />
          <h3 className="font-bold text-white text-base">GST Billing & Checkout</h3>
          <p className="text-xs text-slate-400">Calculate itemized bill, consultant & room fees, collect payment.</p>
          <span className="text-xs text-teal-400 font-semibold inline-flex items-center gap-1">Open Billing Engine <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>

        <div onClick={() => navigate('/pharmacy/inventory')} className="glass-panel p-6 cursor-pointer hover:border-emerald-500/50 transition-all space-y-3">
          <Package className="w-8 h-8 text-cyan-400" />
          <h3 className="font-bold text-white text-base">Medicine Stock Inventory</h3>
          <p className="text-xs text-slate-400">{inventory.length} Medicine items tracked in hospital stock.</p>
          <span className="text-xs text-cyan-400 font-semibold inline-flex items-center gap-1">View Inventory <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
