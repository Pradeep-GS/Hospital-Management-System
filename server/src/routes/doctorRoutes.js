const express = require('express');
const { Appointment, EMRRecord, Prescription, StaffLog } = require('../models');
const { verifyToken, authorizeRoles, validateActiveEMRAccess } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.use(authorizeRoles('DOCTOR'));

// ── 1. Doctor Dashboard ────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  const doctorId   = req.user.id;
  const hospitalId = req.user.hospitalId;

  try {
    const [lastLoginLog, queue] = await Promise.all([
      StaffLog.findOne({ userId: doctorId, action: 'SIGN_IN' }).sort({ timestamp: -1 }),
      Appointment.find({ doctorId, hospitalId })
        .sort({ queuePosition: 1 })
        .lean()
    ]);

    return res.json({
      doctor: {
        id:        doctorId,
        name:      req.user.fullName,
        lastLogin: lastLoginLog ? lastLoginLog.timestamp : new Date()
      },
      queue
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load doctor dashboard.', detail: err.message });
  }
});

// ── 2. Activate Appointment → Opens EMR Access Window ─────────────────────
router.post('/appointments/:id/activate', async (req, res) => {
  const { id } = req.params;
  const doctorId = req.user.id;

  try {
    // Deactivate any currently ACTIVE appointment for this doctor
    await Appointment.updateMany(
      { doctorId, status: 'ACTIVE' },
      { $set: { status: 'COMPLETED', activeWindowEndedAt: new Date() } }
    );

    // Activate the selected appointment
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status: 'ACTIVE', activeWindowStartedAt: new Date() } },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    return res.json({
      message: '⚡ Appointment set to ACTIVE. EMR Access Window is now UNLOCKED.',
      appointment
    });
  } catch (err) {
    return res.status(500).json({ error: 'Appointment activation failed.', detail: err.message });
  }
});

// ── 3. Get Patient EMR History (ACTIVE appointment required) ───────────────
router.get('/emr', validateActiveEMRAccess, async (req, res) => {
  const { patientId } = req.query;

  try {
    const { Prescription, Invoice, User } = require('../models');

    const [history, prescriptions, invoices, patient] = await Promise.all([
      EMRRecord.find({ patientId })
        .sort({ createdAt: -1 })
        .populate('doctorId', 'fullName')
        .populate('hospitalId', 'name'),
      Prescription.find({ patientId }).sort({ createdAt: -1 }),
      Invoice.find({ patientId }).sort({ createdAt: -1 }),
      User.findById(patientId).select('fullName age gender phone email')
    ]);

    return res.json({
      patient,
      emrRecord: history[0] || null,
      history,
      prescriptions,
      invoices,
      activeAppointmentId: req.activeAppointment._id,
      accessGrantedAt:   new Date()
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch EMR.', detail: err.message });
  }
});

// ── 4. Create Prescription + EMR → Auto-deliver to Pharmacy ───────────────
router.post('/emr/prescription', validateActiveEMRAccess, async (req, res) => {
  const { patientId, diagnosis, doctorNotes, vitals, symptoms, items } = req.body;
  const doctorId     = req.user.id;
  const hospitalId   = req.user.hospitalId;
  const appointmentId = req.activeAppointment._id;

  try {
    // Create EMR record
    const newEMR = await EMRRecord.create({
      patientId,
      hospitalId,
      appointmentId,
      doctorId,
      vitals: vitals || { bloodPressure: '120/80', heartRate: 75, temperatureCelsius: 37, spO2Percentage: 99 },
      symptoms: symptoms || ['General Consultation'],
      diagnosis:   diagnosis   || 'Under Observation',
      doctorNotes: doctorNotes || 'Routine checkup.'
    });

    // Auto-deliver prescription to Pharmacy module
    const rawItems = items && items.length > 0 ? items : [
      { medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1', durationDays: 5, quantityRequired: 10, unitPrice: 2.5, gstRatePercentage: 5 }
    ];

    const mongoose = require('mongoose');
    const prescriptionItems = rawItems.map((item) => {
      const sanitized = { ...item };
      if (sanitized.medicineId && !mongoose.Types.ObjectId.isValid(sanitized.medicineId)) {
        delete sanitized.medicineId;
      }
      return sanitized;
    });

    const newPrescription = await Prescription.create({
      appointmentId,
      patientId,
      patientName:  req.activeAppointment.patientName,
      doctorId,
      doctorName:   req.user.fullName,
      hospitalId,
      items:        prescriptionItems,
      dispenseStatus: 'PENDING'
    });

    // Mark appointment as COMPLETED after consultation
    await Appointment.findByIdAndUpdate(appointmentId, {
      $set: { status: 'COMPLETED', activeWindowEndedAt: new Date() }
    });

    return res.status(201).json({
      message: 'Prescription recorded in EMR and automatically routed to Pharmacy.',
      emrRecord:    newEMR,
      prescription: newPrescription
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create prescription.', detail: err.message });
  }
});

module.exports = router;
