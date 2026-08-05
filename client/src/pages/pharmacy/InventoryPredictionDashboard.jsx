import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function InventoryPredictionDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventoryPredictions();
  }, []);

  const fetchInventoryPredictions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/inventory-predictions');
      setPredictions(res.data.predictions || []);
    } catch (err) {
      setError('Failed to load inventory predictions.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4 max-w-7xl mx-auto">
        <div className="h-8 bg-slate-800 rounded w-1/3 animate-pulse"></div>
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const criticalItems = predictions.filter(p => p.remainingStockDays <= 7 || p.expiryRisk === 'CRITICAL');
  const fastMovingItems = predictions.filter(p => p.demandClassification === 'FAST_MOVING');

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl shadow-lg">📈</span>
            AI Pharmacy Inventory Demand & Predictive Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Machine learning forecast for medicine stock depletion, reorder dates, and expiry risk mitigation
          </p>
        </div>

        <button
          onClick={fetchInventoryPredictions}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
        >
          🔄 Refresh Forecast Model
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-xl">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Inventory Tracked</span>
          <p className="text-2xl font-black text-white mt-1">{predictions.length} Items</p>
        </div>

        <div className="bg-slate-900/80 border border-rose-800/40 p-5 rounded-2xl backdrop-blur-xl">
          <span className="text-xs font-bold text-rose-400 uppercase">Critical Reorder Alerts</span>
          <p className="text-2xl font-black text-rose-400 mt-1">{criticalItems.length} Medicines</p>
        </div>

        <div className="bg-slate-900/80 border border-emerald-800/40 p-5 rounded-2xl backdrop-blur-xl">
          <span className="text-xs font-bold text-emerald-400 uppercase">Fast-Moving Demand</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{fastMovingItems.length} Products</p>
        </div>

        <div className="bg-slate-900/80 border border-cyan-800/40 p-5 rounded-2xl backdrop-blur-xl">
          <span className="text-xs font-bold text-cyan-400 uppercase">Predicted Monthly Outflow</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            {predictions.reduce((acc, p) => acc + (p.predictedMonthlyDemand || 0), 0).toLocaleString()} Units
          </p>
        </div>
      </div>

      {/* Critical Reorder Alerts Section */}
      {criticalItems.length > 0 && (
        <div className="bg-rose-950/20 border border-rose-800/40 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            ⚠️ Urgent Reorder Alerts ({criticalItems.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalItems.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-rose-900/50 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <p className="text-slate-400">{item.genericName || 'Generic Formulation'}</p>
                  </div>
                  <span className="px-2 py-1 bg-rose-500/20 text-rose-400 font-bold rounded text-[10px]">
                    Depletes in {item.remainingStockDays} Days
                  </span>
                </div>
                <p className="text-rose-200">{item.purchaseRecommendation}</p>
                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Suggested Qty: <strong className="text-white">{item.suggestedReorderQuantity} Units</strong></span>
                  <button className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition">
                    Dispatch Purchase Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Predictive Stock Depletion Graphs / Table */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6">
        <h3 className="text-base font-bold text-white">Full Inventory Demand Forecasting Matrix</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                <th className="p-3">Medicine Name</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Remaining Stock Days</th>
                <th className="p-3">Demand Velocity</th>
                <th className="p-3">Expiry Risk</th>
                <th className="p-3">Suggested Reorder Date</th>
                <th className="p-3 text-right">Reorder Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {predictions.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-white">
                    {item.name}
                    <span className="block text-[10px] font-normal text-slate-400">{item.genericName}</span>
                  </td>
                  <td className="p-3 font-mono text-cyan-400 font-bold">{item.stockQuantity} Units</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${item.remainingStockDays <= 7 ? 'bg-rose-500' : item.remainingStockDays <= 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (item.remainingStockDays / 30) * 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-white">{item.remainingStockDays}d</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.demandClassification}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(item.expiryRisk)}`}>
                      {item.expiryRisk}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(item.suggestedReorderDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-400">
                    +{item.suggestedReorderQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
