import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Calendar, Stethoscope, Sparkles, CheckCircle2, Clock, MapPin, Building2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const PatientChatbot = ({ hospitals = [], onBookSuccess }) => {
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: 'Hello! I am your AegisCare AI Health & Appointment Booking Assistant 🤖✨\nDescribe your symptoms or health concern (e.g. "severe headache", "chest tightness", "knee pain"), and I will analyze them, recommend the right specialist, and help you book an appointment instantly.',
      actionPayload: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingInProcess, setBookingInProcess] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingSlot, setBookingSlot] = useState('10:00 AM - 10:30 AM');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsgObj = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/ai/patient-chat', {
        message: query,
        hospitalId: selectedHospitalId || (hospitals[0] ? hospitals[0]._id : null)
      });

      const aiMsgObj = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.data.reply,
        actionPayload: res.data.actionPayload,
        specialty: res.data.specialty,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'I apologize, but I encountered an error connecting to the clinical engine. Please try again or select a doctor manually.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFromChat = async (doctor) => {
    const targetHospitalId = doctor.hospitalId || selectedHospitalId || (hospitals[0]?._id);
    if (!targetHospitalId) {
      alert('Please select a hospital facility first.');
      return;
    }

    setBookingInProcess(doctor.id);

    try {
      await api.post('/patients/appointments/book', {
        hospitalId: targetHospitalId,
        doctorId: doctor.id,
        date: bookingDate,
        timeSlot: bookingSlot,
        bookingNotes: `AI Chatbot Referral for ${doctor.specialty}`
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `book-success-${Date.now()}`,
          sender: 'ai',
          text: `🎉 **Appointment Confirmed!**\nYour appointment with **Dr. ${doctor.name}** (${doctor.specialty}) has been successfully booked for **${bookingDate}** at **${bookingSlot}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (onBookSuccess) onBookSuccess();
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed from chat.');
    } finally {
      setBookingInProcess(null);
    }
  };

  const quickSymptomChips = [
    'Migraine & Eye Strain',
    'Fever, Cold & Body Ache',
    'Chest Tightness & Palpitations',
    'Knee Joint & Back Pain',
    'Stomach Acid & Indigestion',
    'Skin Allergy & Rash'
  ];

  return (
    <div className="glass-panel p-4 md:p-6 flex flex-col h-[650px] border-teal-500/30 shadow-2xl rounded-3xl relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Chatbot Header */}
      <div className="pb-4 mb-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              AegisCare AI Booking Assistant <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">Conversational Triage & Instant Appointment Booking</p>
          </div>
        </div>

        {/* Hospital Filter Selector */}
        {hospitals.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-400" />
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-teal-500"
            >
              <option value="">All Hospitals</option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-none shadow-lg'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">
                  <Bot className="w-3.5 h-3.5" /> AI Clinical Triage
                </div>
              )}

              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Action Payload: Doctor Recommendation Cards */}
              {msg.actionPayload?.doctors && (
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>Select Date & Time for Booking:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white rounded-lg p-1.5 text-[11px]"
                    />
                    <select
                      value={bookingSlot}
                      onChange={(e) => setBookingSlot(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white rounded-lg p-1.5 text-[11px]"
                    >
                      <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                      <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                      <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                      <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                      <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</option>
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    {msg.actionPayload.doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-teal-400" /> Dr. {doc.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Specialty: <span className="text-teal-300 font-medium">{doc.specialty}</span>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {doc.hospitalName} • Room {doc.roomNo} • Fee: ${doc.fee}
                          </p>
                        </div>

                        <button
                          onClick={() => handleBookFromChat(doc)}
                          disabled={bookingInProcess === doc.id}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow whitespace-nowrap self-end sm:self-center"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {bookingInProcess === doc.id ? 'Booking...' : 'Book Appt Now'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <span className="text-[9px] text-slate-500 block text-right mt-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-teal-400 bg-slate-900 border border-slate-800 p-3 rounded-2xl w-max animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" /> AI Triage Engine is analyzing symptoms & matching specialists...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Symptom Chips */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
        <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">Quick Symptoms:</span>
        {quickSymptomChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-slate-300 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Describe your health symptoms or ask to book an appointment..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputMessage.trim()}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold p-3 rounded-xl transition-all shadow-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PatientChatbot;
