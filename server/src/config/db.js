const mongoose = require('mongoose');
require('dotenv').config();

// In-Memory Data Store Fallback for immediate turnkey execution
const mockStore = {
  hospitals: [
    {
      _id: 'hosp-001',
      hospitalCode: 'HOSP-METRO-01',
      name: 'City Central Hospital',
      address: { street: '100 Medical Plaza', city: 'Metropolis', state: 'NY', zipCode: '10001' },
      contactEmail: 'admin@metrohospital.org',
      contactPhone: '+1-555-0199',
      verificationStatus: 'APPROVED',
      dualVerification: { hospitalVerifiedAt: new Date(), adminVerifiedAt: new Date() },
      consultantFeeStructure: { generalPhysician: 50, specialist: 100, superSpecialist: 180 },
      createdAt: new Date()
    },
    {
      _id: 'hosp-002',
      hospitalCode: 'HOSP-STJUDE-02',
      name: 'St. Jude General Care',
      address: { street: '45 Health Ave', city: 'Gotham', state: 'NJ', zipCode: '07001' },
      contactEmail: 'contact@stjude.org',
      contactPhone: '+1-555-0244',
      verificationStatus: 'PENDING_ADMIN',
      dualVerification: { hospitalVerifiedAt: new Date() },
      consultantFeeStructure: { generalPhysician: 40, specialist: 85, superSpecialist: 150 },
      createdAt: new Date()
    }
  ],
  users: [
    {
      _id: 'user-sysadmin',
      fullName: 'Global System Admin',
      email: 'admin@platform.com',
      passwordHash: 'admin123', // Demo plain/hashed
      phone: '+1-800-555-0000',
      role: 'SYSTEM_ADMIN',
      approvalStatus: 'APPROVED'
    },
    {
      _id: 'user-hospadmin',
      hospitalId: 'hosp-001',
      fullName: 'Dr. Sarah Connor (Hosp Admin)',
      email: 'hospadmin@metrohospital.org',
      passwordHash: 'admin123',
      phone: '+1-555-0199',
      role: 'HOSPITAL_ADMIN',
      approvalStatus: 'APPROVED'
    },
    {
      _id: 'user-doc-01',
      hospitalId: 'hosp-001',
      fullName: 'Dr. Gregory House',
      email: 'house@metrohospital.org',
      passwordHash: 'doc123',
      phone: '+1-555-0101',
      role: 'DOCTOR',
      approvalStatus: 'APPROVED',
      doctorDetails: {
        specialization: 'Internal Medicine & Diagnostics',
        licenseNumber: 'MD-884920',
        consultationFee: 120,
        roomNo: 'Clinic 302',
        isAvailable: true
      }
    },
    {
      _id: 'user-doc-02',
      hospitalId: 'hosp-001',
      fullName: 'Dr. Meredith Grey',
      email: 'grey@metrohospital.org',
      passwordHash: 'doc123',
      phone: '+1-555-0102',
      role: 'DOCTOR',
      approvalStatus: 'APPROVED',
      doctorDetails: {
        specialization: 'General Surgery',
        licenseNumber: 'MD-991204',
        consultationFee: 150,
        roomNo: 'Clinic 405',
        isAvailable: true
      }
    },
    {
      _id: 'user-rec-01',
      hospitalId: 'hosp-001',
      fullName: 'Pam Beesly (Reception)',
      email: 'reception@metrohospital.org',
      passwordHash: 'rec123',
      phone: '+1-555-0103',
      role: 'RECEPTIONIST',
      approvalStatus: 'APPROVED'
    },
    {
      _id: 'user-pat-01',
      universalPatientId: 'UPID-8849-2026',
      fullName: 'Johnathan Doe',
      email: 'john.doe@gmail.com',
      passwordHash: 'patient123',
      phone: '+1-555-9088',
      role: 'PATIENT',
      approvalStatus: 'APPROVED',
      qrCodePayload: 'UPID-8849-2026|JOHNATHAN_DOE|METRO-AUTH-KEY-8849'
    },
    {
      _id: 'user-pharm-01',
      hospitalId: 'hosp-001',
      fullName: 'Walter White (Pharmacist)',
      email: 'pharmacy@metrohospital.org',
      passwordHash: 'pharm123',
      phone: '+1-555-0105',
      role: 'PHARMACY',
      approvalStatus: 'APPROVED'
    }
  ],
  staffLogs: [
    {
      _id: 'log-001',
      hospitalId: 'hosp-001',
      userId: 'user-doc-01',
      userName: 'Dr. Gregory House',
      userRole: 'DOCTOR',
      action: 'SIGN_IN',
      ipAddress: '192.168.1.42',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: new Date(Date.now() - 3600000)
    }
  ],
  appointments: [
    {
      _id: 'apt-101',
      appointmentNumber: 'APT-20260802-0001',
      hospitalId: 'hosp-001',
      patientId: 'user-pat-01',
      patientName: 'Johnathan Doe',
      doctorId: 'user-doc-01',
      doctorName: 'Dr. Gregory House',
      queuePosition: 1,
      status: 'ACTIVE', // ACTIVE, CHECKED_IN, BOOKED, COMPLETED, PAID, CANCELLED
      activeWindowStartedAt: new Date(),
      bookingChannel: 'PATIENT_APP',
      roomAllocated: { roomId: 'room-302', roomNumber: 'Ward 302', allocatedAt: new Date() },
      createdAt: new Date()
    },
    {
      _id: 'apt-102',
      appointmentNumber: 'APT-20260802-0002',
      hospitalId: 'hosp-001',
      patientId: 'user-pat-01',
      patientName: 'Jane Smith',
      doctorId: 'user-doc-01',
      doctorName: 'Dr. Gregory House',
      queuePosition: 2,
      status: 'CHECKED_IN',
      bookingChannel: 'RECEPTION_DESK',
      createdAt: new Date()
    }
  ],
  emrRecords: [
    {
      _id: 'emr-001',
      patientId: 'user-pat-01',
      hospitalId: 'hosp-001',
      appointmentId: 'apt-101',
      doctorId: 'user-doc-01',
      vitals: { bloodPressure: '120/80', heartRate: 72, temperatureCelsius: 36.8, spO2Percentage: 98 },
      symptoms: ['Acute Migraine', 'Light Sensitivity'],
      diagnosis: 'Tension Headache with Aura',
      doctorNotes: 'Patient advised rest, hydration, and prescribed Sumatriptan.',
      createdAt: new Date()
    }
  ],
  prescriptions: [
    {
      _id: 'presc-001',
      appointmentId: 'apt-101',
      patientId: 'user-pat-01',
      patientName: 'Johnathan Doe',
      doctorId: 'user-doc-01',
      doctorName: 'Dr. Gregory House',
      hospitalId: 'hosp-001',
      items: [
        { medicineId: 'med-01', medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1', durationDays: 5, quantityRequired: 10, unitPrice: 2.5, gstRatePercentage: 5 },
        { medicineId: 'med-02', medicineName: 'Sumatriptan 50mg', dosage: '50mg', frequency: 'As needed', durationDays: 3, quantityRequired: 6, unitPrice: 15.0, gstRatePercentage: 12 }
      ],
      dispenseStatus: 'PENDING',
      createdAt: new Date()
    }
  ],
  inventoryRooms: [
    { _id: 'room-301', hospitalId: 'hosp-001', roomNumber: 'General Ward 301', roomType: 'GENERAL_WARD', dailyRate: 100, isOccupied: false },
    { _id: 'room-302', hospitalId: 'hosp-001', roomNumber: 'Private Room 302', roomType: 'SEMI_PRIVATE', dailyRate: 250, isOccupied: true, currentPatientId: 'user-pat-01', occupiedAt: new Date(), estimatedDischargeDate: new Date(Date.now() + 86400000 * 2) },
    { _id: 'room-401', hospitalId: 'hosp-001', roomNumber: 'ICU Suite 401', roomType: 'DELUXE_ICU', dailyRate: 800, isOccupied: false }
  ],
  inventoryMachinery: [
    { _id: 'mac-01', hospitalId: 'hosp-001', equipmentType: 'OXYGEN_CYLINDER', serialNumber: 'O2-CYL-881', status: 'IN_USE', assignedRoomId: 'room-302', hourlyRate: 15 },
    { _id: 'mac-02', hospitalId: 'hosp-001', equipmentType: 'OXYGEN_CYLINDER', serialNumber: 'O2-CYL-882', status: 'AVAILABLE', hourlyRate: 15 },
    { _id: 'mac-03', hospitalId: 'hosp-001', equipmentType: 'VENTILATOR', serialNumber: 'VENT-2026-X', status: 'AVAILABLE', hourlyRate: 50 }
  ],
  pharmacyInventory: [
    { _id: 'med-01', hospitalId: 'hosp-001', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', batchNumber: 'BATCH-2026A', stockQuantity: 450, reorderLevel: 50, unitPrice: 2.5, gstRatePercentage: 5, expiryDate: '2028-12-31' },
    { _id: 'med-02', hospitalId: 'hosp-001', name: 'Sumatriptan 50mg', genericName: 'Sumatriptan Succinate', batchNumber: 'BATCH-2026B', stockQuantity: 120, reorderLevel: 20, unitPrice: 15.0, gstRatePercentage: 12, expiryDate: '2027-06-30' },
    { _id: 'med-03', hospitalId: 'hosp-001', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', batchNumber: 'BATCH-2026C', stockQuantity: 300, reorderLevel: 40, unitPrice: 8.0, gstRatePercentage: 12, expiryDate: '2027-11-15' }
  ],
  invoices: []
};

const connectDB = async () => {
  const connString = process.env.MONGODB_URI;
  if (!connString) {
    console.log('ℹ️ No MONGODB_URI provided. Running backend with turnkey In-Memory Data Store.');
    return false;
  }
  try {
    await mongoose.connect(connString);
    console.log('✅ MongoDB connected successfully.');
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed. Falling back to turnkey In-Memory Data Store:', err.message);
    return false;
  }
};

module.exports = { connectDB, mockStore };
