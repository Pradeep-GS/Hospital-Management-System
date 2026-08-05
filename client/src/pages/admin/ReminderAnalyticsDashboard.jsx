import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ReminderAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAnalytics, resLogs] = await Promise.all([
        api.get('/reminders/analytics'),
        api.get('/reminders/logs')
      ]);
      setAnalytics(resAnalytics.data.analytics);
      setLogs(resLogs.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (logId) => {
    try {
      await api.post(`/reminders/retry/${logId}`);
      fetchData();
      alert('Notification retried successfully!');
    } catch (err) {
      alert('Failed to retry notification.');
    }
  };

  const handleTriggerScan = async () => {
    try {
      await api.post('/reminders/trigger-scan');
      fetchData();
      alert('Manual reminder scheduler scan executed!');
    } catch (err) {
      alert('Error triggering scan.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4 max-w-7xl mx-auto">
        <div className="h-8 bg-slate-800 rounded w-1/3 animate-pulse"></div>
        <div className="h-40 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg">⏰</span>
            Smart Appointment Reminder Engine & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated multi-channel schedule (24H, 2H, 30M) notification tracking & delivery analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerScan}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            ⚡ Run Instant Scheduler Scan
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Reminder Dispatches</span>
            <p className="text-2xl font-black text-white mt-1">{analytics.totalDispatches}</p>
          </div>

          <div className="bg-slate-900/80 border border-emerald-800/40 p-5 rounded-2xl backdrop-blur-xl">
            <span className="text-xs font-bold text-emerald-400 uppercase">Delivery Success Rate</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{analytics.deliveryRate}%</p>
          </div>

          <div className="bg-slate-900/80 border border-blue-800/40 p-5 rounded-2xl backdrop-blur-xl">
            <span className="text-xs font-bold text-blue-400 uppercase">24H / 2H / 30M Breakdown</span>
            <p className="text-sm font-bold text-slate-300 mt-2">
              24H: <strong className="text-white">{analytics.byType?.reminder24h}</strong> • 
              2H: <strong className="text-white"> {analytics.byType?.reminder2h}</strong> • 
              30M: <strong className="text-white"> {analytics.byType?.reminder30m}</strong>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-rose-800/40 p-5 rounded-2xl backdrop-blur-xl">
            <span className="text-xs font-bold text-rose-400 uppercase">Failed Dispatches</span>
            <p className="text-2xl font-black text-rose-400 mt-1">{analytics.totalFailed}</p>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Live Notification Delivery Logs</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                <th className="p-3">Patient</th>
                <th className="p-3">Doctor / Dept</th>
                <th className="p-3">Reminder Schedule</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Status</th>
                <th className="p-3">Dispatched Time</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-white">
                    {log.patientId?.fullName || 'Patient'}
                    <span className="block text-[10px] font-normal text-slate-400">{log.recipientEmail}</span>
                  </td>
                  <td className="p-3 text-slate-300">
                    Dr. {log.doctorId?.fullName || 'Physician'}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {log.reminderType} Priority
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-300">
                    {log.channel}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SENT' || log.status === 'RETRIED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(log.sentAt || log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    {log.status === 'FAILED' && (
                      <button
                        onClick={() => handleRetry(log._id)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg transition"
                      >
                        Retry Send
                      </button>
                    )}
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
