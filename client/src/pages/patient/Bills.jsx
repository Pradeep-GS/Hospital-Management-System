import React from 'react';
import { Receipt, CheckCircle, CheckCircle2, Printer } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const Bills = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto font-['Inter',sans-serif]">
      <Helmet>
        <title>Billing & Invoices | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Receipt className="w-5 h-5 text-blue-600" /> Invoices & GST Tax Payment Receipts
          </h3>
          <button
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print Tax Receipt
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs hover:border-blue-300 transition-colors">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Invoice #INV-2026-9901</h4>
              <p className="text-slate-500 mt-0.5">Doctor Consultation + Emergency Room + Pharmacy GST</p>
              <span className="text-[11px] font-mono text-slate-400">Date: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-slate-900 font-mono block">$2,817.50</span>
              <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1 text-[10px] mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PAID
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bills;
