import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertTriangle, Camera, Check } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export const QRScanner = () => {
  const [qrInput, setQrInput] = useState('UPID-8849-2026|JOHNATHAN_DOE|UNIVERSAL_HOSPITAL_KEY');
  const [scannedData, setScannedData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [msg, setMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);

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
      toast.success('Patient UPID scanned & health passport retrieved!');
    } catch (err) {
      alert(err.response?.data?.error || 'Scan failed.');
      toast.error(err.response?.data?.error || 'Scan failed.');
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await api.post('/reception/check-in', { appointmentId });
      setMsg(`✅ Checked in appointment. Status set to CHECKED_IN.`);
      toast.success('Patient checked in for appointment!');
      handleScan();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed.');
      toast.error(err.response?.data?.error || 'Check-in failed.');
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
      toast.success('Walk-in appointment created & checked in!');
      handleScan();
    } catch (err) {
      alert(err.response?.data?.error || 'Walk-in check-in failed.');
      toast.error(err.response?.data?.error || 'Walk-in check-in failed.');
    }
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
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
            toast.success('Camera scan successful!');
          } catch (err) {
            alert('Decoded QR but patient look-up failed: ' + (err.response?.data?.error || err.message));
          }
        },
        () => {}
      );
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto font-['Inter',sans-serif]">
      <Helmet>
        <title>Universal QR Scanner | AegisCare ERP</title>
      </Helmet>

      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <QrCode className="w-5 h-5 text-blue-600" /> Universal QR Health Passport Scanner
          </h3>
          <p className="text-xs text-slate-500">Scan patient QR codes for instant appointment check-in & EMR lookup</p>
        </div>

        {/* Live Camera Scanner Container */}
        {isScanning ? (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300 space-y-3">
            <div id="reader" className="w-full"></div>
            <button
              onClick={() => setIsScanning(false)}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 rounded-xl text-xs"
            >
              Cancel Camera Scan
            </button>
          </div>
        ) : (
          <button
            onClick={startScanner}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md mb-2 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" /> Start Live Camera QR Scan
          </button>
        )}

        <form onSubmit={handleScan} className="space-y-3 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Manual Payload (Fallback)</label>
            <textarea
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              rows="2"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-blue-700 focus:outline-none focus:border-blue-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition-colors"
          >
            Process Payload Manually
          </button>
        </form>

        {msg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {msg}
          </div>
        )}

        {scannedData && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{scannedData.patient.fullName}</h4>
                <span className="text-xs font-mono font-bold text-blue-600">UPID: {scannedData.patient.universalPatientId}</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold">
                {scannedData.emrRecordCount} EMR Records
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-700 font-bold block">Scheduled Appointments:</span>
              {scannedData.activeAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block font-mono">{apt.appointmentNumber}</span>
                    <span className="text-slate-500">Doctor: {apt.doctorName} ({apt.status})</span>
                  </div>
                  {apt.status === 'BOOKED' && (
                    <button
                      onClick={() => handleCheckIn(apt._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs"
                    >
                      Check-In Patient
                    </button>
                  )}
                </div>
              ))}
              {scannedData.activeAppointments.length === 0 && (
                <p className="text-xs text-slate-400">No scheduled appointments found for today.</p>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
              <span className="text-xs text-slate-800 font-bold block">Instant Walk-In Check-In:</span>
              <div className="flex gap-2">
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 flex-1"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.fullName} — {d.doctorDetails?.specialization || 'General Physician'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCreateWalkin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs"
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
