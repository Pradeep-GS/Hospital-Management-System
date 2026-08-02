import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export const QRScanner = () => {
  const [qrInput, setQrInput] = useState('UPID-8849-2026|JOHNATHAN_DOE|UNIVERSAL_HOSPITAL_KEY');
  const [scannedData, setScannedData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [msg, setMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Load active approved doctors for logged-in hospital facility
  React.useEffect(() => {
    api.get('/reception/doctors')
      .then((res) => {
        setDoctors(res.data.doctors || []);
        if (res.data.doctors && res.data.doctors.length > 0) {
          setSelectedDoctor(res.data.doctors[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await api.post('/reception/scan-qr', { qrPayload: qrInput });
      setScannedData(res.data);
      setMsg('');
    } catch (err) {
      alert(err.response?.data?.error || 'Scan failed.');
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await api.post('/reception/check-in', { appointmentId });
      setMsg(`✅ Checked in appointment. Status set to CHECKED_IN.`);
      handleScan();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed.');
    }
  };

  const handleCreateWalkin = async () => {
    if (!scannedData || !selectedDoctor) return;
    try {
      await api.post('/reception/appointments/create-walkin', {
        patientId: scannedData.patient.id,
        doctorId: selectedDoctor
      });
      setMsg('✅ Walk-in appointment created and checked in successfully!');
      handleScan();
    } catch (err) {
      alert(err.response?.data?.error || 'Walk-in check-in failed.');
    }
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Use standard window.Html5Qrcode or require fallback
      const Html5 = window.Html5Qrcode || require('html5-qrcode');
      const { Html5QrcodeScanner } = Html5;
      const scanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      });

      scanner.render(
        async (decodedText) => {
          setQrInput(decodedText);
          scanner.clear();
          setIsScanning(false);
          try {
            const res = await api.post('/reception/scan-qr', { qrPayload: decodedText });
            setScannedData(res.data);
            setMsg('✅ QR Code Decoded Successfully!');
          } catch (err) {
            alert('Decoded QR but patient look-up failed: ' + (err.response?.data?.error || err.message));
          }
        },
        (error) => {
          // Silent scan error
        }
      );
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto text-xs">
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-amber-400" /> Universal QR Passport Scanner
        </h3>

        {/* Live Camera Scanner Container */}
        {isScanning ? (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-700">
            <div id="reader" className="w-full"></div>
            <button
              onClick={() => setIsScanning(false)}
              className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs"
            >
              Cancel Camera Scan
            </button>
          </div>
        ) : (
          <button
            onClick={startScanner}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold py-3 rounded-xl text-xs shadow mb-4 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" /> Start Live Camera QR Scan
          </button>
        )}

        <form onSubmit={handleScan} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Manual Input Payload (Fallback)</label>
            <textarea
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              rows="2"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-amber-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs shadow"
          >
            Process Payload Manual
          </button>
        </form>

        {msg && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {msg}
          </div>
        )}

        {scannedData && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{scannedData.patient.fullName}</h4>
                <span className="text-xs font-mono text-amber-400">UPID: {scannedData.patient.universalPatientId}</span>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                {scannedData.emrRecordCount} EMR Records
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Appointments:</span>
              {scannedData.activeAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="font-bold text-white block">{apt.appointmentNumber}</span>
                    <span className="text-slate-400">Doctor: {apt.doctorName} (Status: {apt.status})</span>
                  </div>
                  {apt.status === 'BOOKED' && (
                    <button
                      onClick={() => handleCheckIn(apt._id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-bold"
                    >
                      Check-In
                    </button>
                  )}
                </div>
              ))}
              {scannedData.activeAppointments.length === 0 && (
                <p className="text-[11px] text-slate-500">No scheduled appointments found for today.</p>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800">
              <span className="text-xs text-amber-400 font-semibold block">Create Walk-In Check-In (New Queue Position):</span>
              <div className="flex gap-2">
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white flex-1"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.fullName} — {d.doctorDetails?.specialization || d.department || 'General Physician'} ({d.doctorDetails?.roomNo || 'Clinic Desk'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCreateWalkin}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-lg text-xs font-bold"
                >
                  Create & Check-In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
