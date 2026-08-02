import React from 'react';
import { Receipt, CheckCircle } from 'lucide-react';

export const Bills = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-pink-400" /> Invoices & Receipts History
        </h3>

        <div className="space-y-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-white text-sm">Invoice #INV-2026-9901</h4>
              <p className="text-slate-400">Consultant + Room + Pharmacy GST</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-white font-mono block">$2,817.50</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Paid
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bills;
