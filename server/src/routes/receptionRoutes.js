const express = require('express');
const { User, Appointment, EMRRecord, InventoryRoom, InventoryMachinery } = require('../models');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.use(authorizeRoles('RECEPTIONIST', 'HOSPITAL_ADMIN'));

// ── 0. Get Active Approved Doctors for Logged-in Hospital ──────────────────
router.get('/doctors', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  try {
    const doctors = await User.find({
      hospitalId,
      role: 'DOCTOR',
      approvalStatus: 'APPROVED',
      isActive: true
    }).select('-passwordHash');

    return res.json({ doctors });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch active doctors.', detail: err.message });
  }
});

// ── 1. Register New Patient by Receptionist ──────────────────────────────
router.post('/patients/register', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  const { fullName, email, username, phone, age, gender, bloodGroup, address, emergencyContact } = req.body;
  
  const patientEmail = (username || email || '').toLowerCase();
  if (!fullName || !patientEmail) {
    return res.status(400).json({ error: 'Patient Full Name and Email/Username are required.' });
  }

  try {
    const upid = `PAT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await User.findOne({ email: patientEmail });
    if (existing) {
      return res.status(400).json({ error: 'A patient account with this email/username already exists.' });
    }

    const newPatient = await User.create({
      universalPatientId: upid,
      employeeId: upid,
      hospitalId,
      fullName,
      email: patientEmail,
      passwordHash: '12345',
      mustChangePassword: true,
      phone: phone || '',
      role: 'PATIENT',
      approvalStatus: 'APPROVED',
      isActive: true,
      age: age || undefined,
      gender: gender || 'Unspecified',
      qrCodePayload: `${upid}|${fullName.toUpperCase().replace(/\s+/g, '_')}|${hospitalId}`
    });

    return res.status(201).json({
      message: 'New patient registered. Default password set to 12345. QR Code generated.',
      patient: newPatient
    });
  } catch (err) {
    return res.status(500).json({ error: 'Patient registration failed.', detail: err.message });
  }
});

// ── 2. Scan Universal QR Code ──────────────────────────────────────────────
router.post('/scan-qr', async (req, res) => {
  const { qrPayload } = req.body;
  if (!qrPayload) {
    return res.status(400).json({ error: 'QR Code payload is required.' });
  }

  try {
    const upid = qrPayload.split('|')[0];
    const patient = await User.findOne({
      $or: [{ universalPatientId: upid }, { qrCodePayload: qrPayload }]
    }).select('-passwordHash');

    if (!patient) {
      return res.status(404).json({ error: 'Universal QR Code not recognised in the system.' });
    }

    const [appointments, emrCount] = await Promise.all([
      Appointment.find({ patientId: patient._id }).sort({ createdAt: -1 }),
      EMRRecord.countDocuments({ patientId: patient._id })
    ]);

    return res.json({
      patient: {
        id:                patient._id,
        universalPatientId:patient.universalPatientId,
        fullName:          patient.fullName,
        email:             patient.email,
        phone:             patient.phone,
        qrCodePayload:     patient.qrCodePayload
      },
      activeAppointments: appointments,
      emrRecordCount:     emrCount
    });
  } catch (err) {
    return res.status(500).json({ error: 'QR scan failed.', detail: err.message });
  }
});

// ── 3. Patient Check-In → CHECKED_IN ──────────────────────────────────────
router.post('/check-in', async (req, res) => {
  const { appointmentId } = req.body;
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { status: 'CHECKED_IN' } },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }
    return res.json({ message: 'Patient checked in. Status → CHECKED_IN.', appointment });
  } catch (err) {
    return res.status(500).json({ error: 'Check-in failed.', detail: err.message });
  }
});

// Create Walk-in Appointment and Check-In immediately
router.post('/appointments/create-walkin', async (req, res) => {
  const { patientId, doctorId } = req.body;
  const hospitalId = req.user.hospitalId;

  if (!patientId || !doctorId) {
    return res.status(400).json({ error: 'Patient ID and Doctor ID are required.' });
  }

  try {
    const [patient, doctor, queueCount] = await Promise.all([
      User.findById(patientId),
      User.findById(doctorId),
      Appointment.countDocuments({ doctorId, hospitalId })
    ]);

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or Doctor record not found.' });
    }

    const newAppointment = await Appointment.create({
      appointmentNumber: `APT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalId,
      patientId,
      patientName:    patient.fullName,
      doctorId,
      doctorName:     doctor.fullName,
      queuePosition:  queueCount + 1,
      status:         'CHECKED_IN',
      bookingChannel: 'RECEPTION_DESK',
      notes:          'Walk-in check-in'
    });

    return res.status(201).json({
      message: 'Walk-in appointment created and checked in successfully.',
      appointment: newAppointment
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create walk-in appointment.', detail: err.message });
  }
});

// ── 4. Emergency Room Allocation + Equipment Provisioning ─────────────────
router.post('/emergency/allocate-room', async (req, res) => {
  const { patientId, roomId, equipmentId, estimatedDischargeDays } = req.body;

  try {
    const room = await InventoryRoom.findByIdAndUpdate(
      roomId,
      {
        $set: {
          isOccupied:            true,
          currentPatientId:      patientId,
          occupiedAt:            new Date(),
          estimatedDischargeDate:new Date(Date.now() + 86400000 * (Number(estimatedDischargeDays) || 3))
        }
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    if (equipmentId) {
      await InventoryMachinery.findByIdAndUpdate(
        equipmentId,
        { $set: { status: 'IN_USE', assignedRoomId: roomId } }
      );
    }

    return res.json({ message: '🚨 Emergency room and resources allocated.', room });
  } catch (err) {
    return res.status(500).json({ error: 'Room allocation failed.', detail: err.message });
  }
});

module.exports = router;
