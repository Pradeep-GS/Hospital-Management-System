import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import RegisterHospital from './pages/RegisterHospital';
import RegisterReceptionist from './pages/RegisterReceptionist';
import RegisterPharmacy from './pages/RegisterPharmacy';
import ForceChangePassword from './pages/ForceChangePassword';
import Profile from './pages/Profile';

// Role Layouts
import DoctorLayout from './layouts/DoctorLayout';
import PatientLayout from './layouts/PatientLayout';
import HospitalAdminLayout from './layouts/HospitalAdminLayout';
import SystemAdminLayout from './layouts/SystemAdminLayout';
import ReceptionLayout from './layouts/ReceptionLayout';
import PharmacyLayout from './layouts/PharmacyLayout';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorQueue from './pages/doctor/Queue';
import DoctorEMR from './pages/doctor/EMR';
import DoctorPrescriptions from './pages/doctor/Prescriptions';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientEMR from './pages/patient/EMR';
import PatientBills from './pages/patient/Bills';

// Receptionist Pages
import ReceptionDashboard from './pages/receptionist/Dashboard';
import RegisterPatient from './pages/receptionist/RegisterPatient';
import QRScanner from './pages/receptionist/QRScanner';
import EmergencyAdmission from './pages/receptionist/EmergencyAdmission';

// Hospital Admin Pages
import HospitalDashboard from './pages/hospital/Dashboard';
import HospitalDoctors from './pages/hospital/Doctors';
import HospitalRooms from './pages/hospital/Rooms';
import HospitalEquipment from './pages/hospital/Equipment';
import HospitalAuditLogs from './pages/hospital/AuditLogs';
import StaffManagement from './pages/hospital/StaffManagement';
import Oxygen from './pages/hospital/Oxygen';

// System Admin Pages
import SystemAdminDashboard from './pages/admin/Dashboard';
import SystemAdminHospitals from './pages/admin/Hospitals';

// Pharmacy Pages
import PharmacyDashboard from './pages/pharmacy/Dashboard';
import PharmacyPrescriptions from './pages/pharmacy/Prescriptions';
import PharmacyBilling from './pages/pharmacy/Billing';
import PharmacyInventory from './pages/pharmacy/Inventory';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register-hospital" element={<RegisterHospital />} />
          <Route path="/register-receptionist" element={<RegisterReceptionist />} />
          <Route path="/register-pharmacy" element={<RegisterPharmacy />} />
          <Route path="/force-change-password" element={<ForceChangePassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* DOCTOR Route Guard & Layout */}
          <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route index element={<Navigate to="/doctor/dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="queue" element={<DoctorQueue />} />
              <Route path="emr" element={<DoctorEMR />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* PATIENT Route Guard & Layout */}
          <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
            <Route path="/patient" element={<PatientLayout />}>
              <Route index element={<Navigate to="/patient/dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="emr" element={<PatientEMR />} />
              <Route path="bills" element={<PatientBills />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* RECEPTIONIST Route Guard & Layout */}
          <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
            <Route path="/reception" element={<ReceptionLayout />}>
              <Route index element={<Navigate to="/reception/dashboard" replace />} />
              <Route path="dashboard" element={<ReceptionDashboard />} />
              <Route path="register-patient" element={<RegisterPatient />} />
              <Route path="qr-scanner" element={<QRScanner />} />
              <Route path="emergency-admission" element={<EmergencyAdmission />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* HOSPITAL ADMIN Route Guard & Layout */}
          <Route element={<ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']} />}>
            <Route path="/hospital" element={<HospitalAdminLayout />}>
              <Route index element={<Navigate to="/hospital/dashboard" replace />} />
              <Route path="dashboard" element={<HospitalDashboard />} />
              <Route path="doctors" element={<HospitalDoctors />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="rooms" element={<HospitalRooms />} />
              <Route path="equipment" element={<HospitalEquipment />} />
              <Route path="oxygen" element={<Oxygen />} />
              <Route path="audit-logs" element={<HospitalAuditLogs />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* SYSTEM ADMIN Route Guard & Layout */}
          <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
            <Route path="/admin" element={<SystemAdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<SystemAdminDashboard />} />
              <Route path="hospitals" element={<SystemAdminHospitals />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* PHARMACY Route Guard & Layout */}
          <Route element={<ProtectedRoute allowedRoles={['PHARMACY']} />}>
            <Route path="/pharmacy" element={<PharmacyLayout />}>
              <Route index element={<Navigate to="/pharmacy/dashboard" replace />} />
              <Route path="dashboard" element={<PharmacyDashboard />} />
              <Route path="prescriptions" element={<PharmacyPrescriptions />} />
              <Route path="billing" element={<PharmacyBilling />} />
              <Route path="inventory" element={<PharmacyInventory />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Default Wildcard Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
