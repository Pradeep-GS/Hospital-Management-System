import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export default function HospitalCopilotDrawer({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.fullName || 'Doctor'}! I am your Aegis Care Hospital Copilot. Ask me anything relative to your operational role.`
    }
  ]);
  const chatEndRef = useRef(null);

  const role = user?.role || 'DOCTOR';

  // Helper to render bold text from AI markdown response
  const renderFormattedMessage = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-cyan-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Role-specific suggestion pills
  const getSuggestions = () => {
    switch (role) {
      case 'DOCTOR':
        return [
          "Show today's appointments",
          "Check drug interactions",
          "Generate clinical notes",
          "Summarize patient history",
          "Explain blood report",
          "Show diabetic patients"
        ];
      case 'RECEPTIONIST':
        return [
          "Show today's queue",
          "Find available cardiologist",
          "Register patient guide",
          "Print token list"
        ];
      case 'PHARMACY':
        return [
          "Show pending prescriptions",
          "Medicine availability",
          "Suggest generic alternatives",
          "Check medicine expiry"
        ];
      case 'HOSPITAL_ADMIN':
      case 'SYSTEM_ADMIN':
        return [
          "Revenue this month",
          "Highest revenue department",
          "Doctor performance",
          "Patient growth & occupancy"
        ];
      case 'PATIENT':
        return [
          "Show my appointments",
          "Explain my prescription",
          "Download reports"
        ];
      default:
        return ["Show today's appointments", "Hospital status overview"];
    }
  };

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const q = textToSend || query;
    if (!q || !q.trim() || loading) return;

    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/ai/copilot/chat', { query: q });
      const replyText = res.data.reply;
      const actionPayload = res.data.actionPayload;

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: replyText,
          payload: actionPayload
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Copilot encountered an issue processing your query. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-blue-400/30"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg animate-pulse">
          🤖
        </div>
        <span>AI Copilot</span>
      </button>

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-sm transition-opacity">
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col justify-between">
              
              {/* Header */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xl font-bold shadow-md">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Aegis AI Copilot</h3>
                    <p className="text-xs text-cyan-400 font-medium">Role: {role.replace('_', ' ')} Mode</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold transition"
                >
                  ✕
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-lg'
                          : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-none shadow-md backdrop-blur-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{renderFormattedMessage(msg.text)}</div>

                      {/* Render Payload Cards if available */}
                      {msg.payload && (
                        <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-blue-500/30 text-xs">
                          <p className="font-semibold text-blue-400 mb-1">📊 Structured Data View:</p>
                          <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-32 p-2 bg-black/40 rounded">
                            {JSON.stringify(msg.payload.data || msg.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {msg.sender === 'user' ? 'You' : 'Copilot'}
                    </span>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-800/50 p-3 rounded-xl w-fit border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                    AI Copilot thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestion Pills */}
              <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
                {getSuggestions().map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="px-3 py-1.5 bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500/50 rounded-full text-xs text-slate-300 hover:text-white transition flex-shrink-0"
                  >
                    💡 {sug}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Copilot (e.g. show appointments, report details)..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !query.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-lg flex items-center justify-center"
                >
                  Send
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
