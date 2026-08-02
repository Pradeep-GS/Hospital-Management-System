/**
 * Database Seeder — Seeds initial demo data into MongoDB Atlas.
 * Run once: node src/scripts/seedDatabase.js
 *
 * WARNING: This will CLEAR all existing collections before seeding.
 * Use only for initial setup / development reset.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const {
  Hospital, User, StaffLog, Appointment,
  EMRRecord, Prescription, InventoryRoom,
  InventoryMachinery, PharmacyItem, Invoice
} = require('../models');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env file. Exiting.');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  // ── 1. Clear existing collections ──────────────────────────────────────────
  console.log('\n🗑️  Clearing existing collections...');
  const { Equipment, OxygenInventory } = require('../models');
  await Promise.all([
    Hospital.deleteMany({}),
    User.deleteMany({}),
    StaffLog.deleteMany({}),
    Appointment.deleteMany({}),
    EMRRecord.deleteMany({}),
    Prescription.deleteMany({}),
    InventoryRoom.deleteMany({}),
    InventoryMachinery.deleteMany({}),
    PharmacyItem.deleteMany({}),
    Invoice.deleteMany({}),
    Equipment.deleteMany({}),
    OxygenInventory.deleteMany({})
  ]);
  console.log('✅ All collections cleared.');

  // ── 2. Seed Hospitals ───────────────────────────────────────────────────────
  console.log('\n🏥 Seeding Hospitals...');
  const [hospitalA, hospitalB] = await Hospital.insertMany([
    {
      hospitalCode: 'HOSP-METRO-01',
      name: 'City Central Hospital',
      address: { street: '100 Medical Plaza', city: 'Metropolis', state: 'NY', zipCode: '10001' },
      contactEmail: 'admin@metrohospital.org',
      contactPhone: '+1-555-0199',
      verificationStatus: 'APPROVED',
      dualVerification: { hospitalVerifiedAt: new Date(), adminVerifiedAt: new Date() },
      consultantFeeStructure: { generalPhysician: 50, specialist: 120, superSpecialist: 200 }
    },
    {
      hospitalCode: 'HOSP-STJUDE-02',
      name: 'St. Jude General Care',
      address: { street: '45 Health Ave', city: 'Gotham', state: 'NJ', zipCode: '07001' },
      contactEmail: 'contact@stjude.org',
      contactPhone: '+1-555-0244',
      verificationStatus: 'PENDING_ADMIN',
      dualVerification: { hospitalVerifiedAt: new Date() },
      consultantFeeStructure: { generalPhysician: 40, specialist: 85, superSpecialist: 150 }
    }
  ]);
  console.log(`✅ Seeded 2 Hospitals. [City Central: ${hospitalA._id}]`);

  // ── 3. Seed Users ───────────────────────────────────────────────────────────
  console.log('\n👤 Seeding Users...');
  const users = await User.insertMany([
    // System Admin
    {
      fullName: 'Global System Admin',
      email: 'admin@platform.com',
      passwordHash: 'admin123',
      phone: '+1-800-555-0000',
      role: 'SYSTEM_ADMIN',
      approvalStatus: 'APPROVED'
    },
    // Hospital Admin
    {
      hospitalId: hospitalA._id,
      fullName: 'Dr. Sarah Connor',
      email: 'hospadmin@metrohospital.org',
      passwordHash: 'admin123',
      phone: '+1-555-0199',
      role: 'HOSPITAL_ADMIN',
      approvalStatus: 'APPROVED'
    },
    // Doctor 1
    {
      hospitalId: hospitalA._id,
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
    // Doctor 2
    {
      hospitalId: hospitalA._id,
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
    // Receptionist
    {
      hospitalId: hospitalA._id,
      fullName: 'Pam Beesly',
      email: 'reception@metrohospital.org',
      passwordHash: 'rec123',
      phone: '+1-555-0103',
      role: 'RECEPTIONIST',
      approvalStatus: 'APPROVED'
    },
    // Patient
    {
      universalPatientId: 'UPID-8849-2026',
      fullName: 'Johnathan Doe',
      email: 'john.doe@gmail.com',
      passwordHash: 'patient123',
      phone: '+1-555-9088',
      role: 'PATIENT',
      approvalStatus: 'APPROVED',
      qrCodePayload: 'UPID-8849-2026|JOHNATHAN_DOE|UNIVERSAL_HOSPITAL_KEY',
      age: 34,
      gender: 'Male'
    },
    // Pharmacy
    {
      hospitalId: hospitalA._id,
      fullName: 'Walter White',
      email: 'pharmacy@metrohospital.org',
      passwordHash: 'pharm123',
      phone: '+1-555-0105',
      role: 'PHARMACY',
      approvalStatus: 'APPROVED'
    }
  ]);

  const [sysAdmin, hospAdmin, doctor1, doctor2, receptionist, patient, pharmacist] = users;
  console.log(`✅ Seeded ${users.length} Users.`);

  // ── 4. Seed Rooms ───────────────────────────────────────────────────────────
  console.log('\n🛏️  Seeding Inventory Rooms...');
  const [room301, room302, room401] = await InventoryRoom.insertMany([
    {
      hospitalId: hospitalA._id,
      roomNumber: 'General Ward 301',
      roomType: 'GENERAL_WARD',
      dailyRate: 100,
      isOccupied: false
    },
    {
      hospitalId: hospitalA._id,
      roomNumber: 'Private Room 302',
      roomType: 'SEMI_PRIVATE',
      dailyRate: 250,
      isOccupied: true,
      currentPatientId: patient._id,
      occupiedAt: new Date(),
      estimatedDischargeDate: new Date(Date.now() + 86400000 * 2)
    },
    {
      hospitalId: hospitalA._id,
      roomNumber: 'ICU Suite 401',
      roomType: 'ICU',
      dailyRate: 800,
      isOccupied: false
    }
  ]);
  console.log(`✅ Seeded 3 Rooms.`);

  // ── 5. Seed Machinery ───────────────────────────────────────────────────────
  console.log('\n🔧 Seeding Inventory Machinery...');
  await InventoryMachinery.insertMany([
    {
      hospitalId: hospitalA._id,
      equipmentType: 'OXYGEN_CYLINDER',
      serialNumber: 'O2-CYL-881',
      status: 'IN_USE',
      assignedRoomId: room302._id,
      hourlyRate: 15
    },
    {
      hospitalId: hospitalA._id,
      equipmentType: 'OXYGEN_CYLINDER',
      serialNumber: 'O2-CYL-882',
      status: 'AVAILABLE',
      hourlyRate: 15
    },
    {
      hospitalId: hospitalA._id,
      equipmentType: 'VENTILATOR',
      serialNumber: 'VENT-2026-X',
      status: 'AVAILABLE',
      hourlyRate: 50
    },
    {
      hospitalId: hospitalA._id,
      equipmentType: 'ECG_MONITOR',
      serialNumber: 'ECG-2026-A',
      status: 'AVAILABLE',
      hourlyRate: 20
    }
  ]);
  console.log(`✅ Seeded 4 Machinery units.`);

  // Seed Equipment CRUD records
  console.log('\n🔧 Seeding Equipment CRUD records...');
  await Equipment.insertMany([
    {
      hospitalId: hospitalA._id,
      name: 'Ventilator Suite X',
      category: 'ICU Care',
      serialNumber: 'VENT-SER-9901',
      manufacturer: 'Phillips Healthcare',
      availableQuantity: 4,
      inUseQuantity: 1,
      damagedQuantity: 0,
      maintenanceStatus: 'GOOD'
    },
    {
      hospitalId: hospitalA._id,
      name: 'ECG Patient Monitor',
      category: 'Diagnostics',
      serialNumber: 'ECG-SER-8812',
      manufacturer: 'GE Medical Systems',
      availableQuantity: 10,
      inUseQuantity: 2,
      damagedQuantity: 1,
      maintenanceStatus: 'GOOD'
    }
  ]);

  // Seed Oxygen Cylinders CRUD records
  console.log('\n💨 Seeding Oxygen Cylinders CRUD records...');
  await OxygenInventory.insertMany([
    {
      hospitalId: hospitalA._id,
      cylinderId: 'O2-CYL-ALPHA',
      type: 'Liquid Gas',
      capacityLitres: 40,
      status: 'AVAILABLE',
      supplierName: 'Praxair Oxygen Corp'
    },
    {
      hospitalId: hospitalA._id,
      cylinderId: 'O2-CYL-BETA',
      type: 'Compressed Gas',
      capacityLitres: 50,
      status: 'IN_USE',
      supplierName: 'Air Liquide Systems'
    },
    {
      hospitalId: hospitalA._id,
      cylinderId: 'O2-CYL-GAMMA',
      type: 'Compressed Gas',
      capacityLitres: 50,
      status: 'EMPTY',
      supplierName: 'Air Liquide Systems'
    }
  ]);

  // ── 6. Seed Pharmacy Inventory ──────────────────────────────────────────────
  console.log('\n💊 Seeding Pharmacy Items...');
  const [med1, med2, med3] = await PharmacyItem.insertMany([
    {
      hospitalId: hospitalA._id,
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      batchNumber: 'BATCH-2026A',
      stockQuantity: 450,
      reorderLevel: 50,
      unitPrice: 2.5,
      gstRatePercentage: 5,
      expiryDate: new Date('2028-12-31'),
      category: 'TABLET'
    },
    {
      hospitalId: hospitalA._id,
      name: 'Sumatriptan 50mg',
      genericName: 'Sumatriptan Succinate',
      batchNumber: 'BATCH-2026B',
      stockQuantity: 120,
      reorderLevel: 20,
      unitPrice: 15.0,
      gstRatePercentage: 12,
      expiryDate: new Date('2027-06-30'),
      category: 'TABLET'
    },
    {
      hospitalId: hospitalA._id,
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin Trihydrate',
      batchNumber: 'BATCH-2026C',
      stockQuantity: 300,
      reorderLevel: 40,
      unitPrice: 8.0,
      gstRatePercentage: 12,
      expiryDate: new Date('2027-11-15'),
      category: 'CAPSULE'
    }
  ]);
  console.log(`✅ Seeded 3 Pharmacy items.`);

  // ── 7. Seed Appointments ────────────────────────────────────────────────────
  console.log('\n📅 Seeding Appointments...');
  const [apt1, apt2] = await Appointment.insertMany([
    {
      appointmentNumber: 'APT-20260802-0001',
      hospitalId: hospitalA._id,
      patientId: patient._id,
      patientName: patient.fullName,
      doctorId: doctor1._id,
      doctorName: doctor1.fullName,
      queuePosition: 1,
      status: 'CHECKED_IN',
      bookingChannel: 'PATIENT_APP',
      roomAllocated: {
        roomId: room302._id,
        roomNumber: 'Private Room 302',
        allocatedAt: new Date()
      }
    },
    {
      appointmentNumber: 'APT-20260802-0002',
      hospitalId: hospitalA._id,
      patientId: patient._id,
      patientName: 'Jane Smith',
      doctorId: doctor1._id,
      doctorName: doctor1.fullName,
      queuePosition: 2,
      status: 'BOOKED',
      bookingChannel: 'RECEPTION_DESK'
    }
  ]);
  console.log(`✅ Seeded 2 Appointments.`);

  // ── 8. Seed EMR Record ──────────────────────────────────────────────────────
  console.log('\n🗒️  Seeding EMR Record...');
  await EMRRecord.create({
    patientId: patient._id,
    hospitalId: hospitalA._id,
    appointmentId: apt1._id,
    doctorId: doctor1._id,
    vitals: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperatureCelsius: 36.8,
      spO2Percentage: 98
    },
    symptoms: ['Acute Migraine', 'Light Sensitivity'],
    diagnosis: 'Tension Headache with Aura',
    doctorNotes: 'Patient advised rest, hydration, and prescribed Sumatriptan.'
  });
  console.log(`✅ Seeded 1 EMR Record.`);

  // ── 9. Seed Staff Login Log ─────────────────────────────────────────────────
  console.log('\n📋 Seeding Staff Audit Log...');
  await StaffLog.create({
    hospitalId: hospitalA._id,
    userId: doctor1._id,
    userName: doctor1.fullName,
    userRole: 'DOCTOR',
    action: 'SIGN_IN',
    ipAddress: '192.168.1.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126',
    timestamp: new Date()
  });
  console.log(`✅ Seeded 1 Staff Log entry.`);

  // ── Done ────────────────────────────────────────────────────────────────────
  console.log('\n🎉 Database seeding complete!');
  console.log('\nDemo Login Credentials:');
  console.log('  System Admin  → admin@platform.com          / admin123');
  console.log('  Hospital Admin→ hospadmin@metrohospital.org / admin123');
  console.log('  Doctor        → house@metrohospital.org     / doc123');
  console.log('  Receptionist  → reception@metrohospital.org / rec123');
  console.log('  Patient       → john.doe@gmail.com          / patient123');
  console.log('  Pharmacy      → pharmacy@metrohospital.org  / pharm123');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
