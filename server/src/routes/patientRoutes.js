const express = require('express');
const { User, Appointment } = require('../models');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.use(authorizeRoles('PATIENT'));

// ── 1. Get Universal QR Code ───────────────────────────────────────────────
router.get('/qr-code', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'Patient account not found.' });

    return res.json({
      universalPatientId: user.universalPatientId,
      fullName:           user.fullName,
      qrCodePayload:      user.qrCodePayload,
      issuedAt:           user.createdAt
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch QR code.', detail: err.message });
  }
});

// ── 2. Book Appointment (Queue-ordered) ───────────────────────────────────
router.post('/appointments/book', async (req, res) => {
  const { doctorId, hospitalId, bookingNotes, date, timeSlot } = req.body;
  const patientId = req.user.id;

  try {
    const [doctor, queueCount] = await Promise.all([
      User.findById(doctorId).select('fullName'),
      Appointment.countDocuments({ doctorId, hospitalId })
    ]);

    const newAppointment = await Appointment.create({
      appointmentNumber: `APT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalId,
      patientId,
      patientName:    req.user.fullName,
      doctorId,
      doctorName:     doctor ? doctor.fullName : 'Unknown Doctor',
      queuePosition:  queueCount + 1,
      status:         'BOOKED',
      bookingChannel: 'PATIENT_APP',
      date:           date || '',
      timeSlot:       timeSlot || '',
      notes:          bookingNotes || ''
    });

    return res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment: newAppointment
    });
  } catch (err) {
    return res.status(500).json({ error: 'Booking failed.', detail: err.message });
  }
});

// Get List of Approved Hospitals for Booking
router.get('/hospitals', async (req, res) => {
  try {
    const { Hospital } = require('../models');
    const hospitals = await Hospital.find({ verificationStatus: 'APPROVED' }).sort({ name: 1 });
    return res.json({ hospitals });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch hospitals.', detail: err.message });
  }
});

// Get List of Doctors in a Specific Hospital
router.get('/hospitals/:id/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ hospitalId: req.params.id, role: 'DOCTOR', approvalStatus: 'APPROVED' }).select('-passwordHash');
    return res.json({ doctors });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch doctors.', detail: err.message });
  }
});

// ── 3. Get Patient's Appointment History with Status Colours ──────────────
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = appointments.map((apt) => ({
      ...apt,
      isCurrentActive: apt.status === 'ACTIVE',
      isGreyedOut:     ['COMPLETED', 'PAID', 'CANCELLED'].includes(apt.status)
    }));

    return res.json({ appointments: formatted });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch appointments.', detail: err.message });
  }
});

// ── 4. Cancel Appointment ─────────────────────────────────────────────────
router.post('/appointments/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user.id, status: { $in: ['BOOKED'] } },
      { $set: { status: 'CANCELLED' } },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or cannot be cancelled.' });
    }
    return res.json({ message: 'Appointment cancelled.', appointment });
  } catch (err) {
    return res.status(500).json({ error: 'Cancellation failed.', detail: err.message });
  }
});

// ── 5. Data Access Approval Workflow ──────────────────────────────────────
router.post('/data-access/grant', async (req, res) => {
  const { doctorId, grantDurationHours } = req.body;
  return res.json({
    message: `Data access granted to Doctor for ${grantDurationHours || 24} hours.`,
    status: 'GRANTED'
  });
});

module.exports = router;
