const express = require('express');
const { Hospital, User } = require('../models');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.use(authorizeRoles('SYSTEM_ADMIN'));

// ── 1. Platform-wide Metrics ────────────────────────────────────────────────
router.get('/metrics', async (req, res) => {
  try {
    const [totalHospitals, pendingApprovals, totalDoctors, totalPatients] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ verificationStatus: { $ne: 'APPROVED' } }),
      User.countDocuments({ role: 'DOCTOR' }),
      User.countDocuments({ role: 'PATIENT' })
    ]);

    return res.json({ metrics: { totalHospitals, pendingApprovals, totalDoctors, totalPatients } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load metrics.', detail: err.message });
  }
});

// ── 2. List All Hospitals ───────────────────────────────────────────────────
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    return res.json({ hospitals });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch hospitals.', detail: err.message });
  }
});

// ── 3. Dual-Verification Hospital Approval / Rejection ─────────────────────
router.post('/hospitals/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  try {
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital record not found.' });
    }

    if (action === 'APPROVE') {
      hospital.verificationStatus = 'APPROVED';
      hospital.dualVerification.adminVerifiedAt = new Date();
      hospital.dualVerification.adminVerifiedBy = req.user.id;
      await hospital.save();

      await User.updateMany(
        { hospitalId: hospital._id },
        { $set: { approvalStatus: 'APPROVED' } }
      );
      return res.json({ message: 'Hospital approved successfully.', hospital });
    } else if (action === 'SUSPEND') {
      hospital.verificationStatus = 'PENDING_ADMIN';
      await hospital.save();
      await User.updateMany(
        { hospitalId: hospital._id },
        { $set: { approvalStatus: 'SUSPENDED' } }
      );
      return res.json({ message: 'Hospital suspended successfully.', hospital });
    } else {
      hospital.verificationStatus = 'REJECTED';
      await hospital.save();
      await User.updateMany(
        { hospitalId: hospital._id },
        { $set: { approvalStatus: 'PENDING' } }
      );
      return res.json({ message: 'Hospital application rejected.', hospital });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Approval action failed.', detail: err.message });
  }
});

// ── 4. Register New Hospital (System Admin Portal) ──────────────────────────────
router.post('/hospitals', async (req, res) => {
  const { name, hospitalCode, address, contactEmail, contactPhone, adminName, password, consultantFees } = req.body;
  if (!name || !hospitalCode) {
    return res.status(400).json({ error: 'Hospital Name and Code are required.' });
  }

  try {
    const code = hospitalCode.toUpperCase();
    const adminEmail = (contactEmail || `admin@${code.toLowerCase()}.org`).toLowerCase();

    const existingHosp = await Hospital.findOne({ hospitalCode: code });
    if (existingHosp) {
      return res.status(400).json({ error: 'A hospital with this facility code already exists.' });
    }

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this administrator email already exists.' });
    }

    const newHospital = await Hospital.create({
      hospitalCode: code,
      name,
      address: address || {},
      contactEmail: adminEmail,
      contactPhone: contactPhone || '',
      verificationStatus: 'APPROVED',
      dualVerification: { hospitalVerifiedAt: new Date(), adminVerifiedAt: new Date(), adminVerifiedBy: req.user.id },
      consultantFeeStructure: consultantFees || { generalPhysician: 50, specialist: 100, superSpecialist: 180 }
    });

    // Create the Hospital Admin user account for login
    const adminPass = password || 'admin123';
    const adminUser = await User.create({
      hospitalId: newHospital._id,
      fullName: adminName || `${name} Admin`,
      email: adminEmail,
      passwordHash: adminPass,
      phone: contactPhone || '',
      role: 'HOSPITAL_ADMIN',
      approvalStatus: 'APPROVED',
      isActive: true
    });

    return res.status(201).json({
      message: `Hospital registered and Admin account created successfully. Login ID: ${adminEmail}`,
      hospital: newHospital,
      adminEmail,
      adminPassword: adminPass
    });
  } catch (err) {
    return res.status(500).json({ error: 'Hospital registration failed.', detail: err.message });
  }
});

// ── 5. Delete Hospital ──────────────────────────────────────────────────────
router.delete('/hospitals/:id', async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Hospital deleted from platform.' });
  } catch (err) {
    return res.status(500).json({ error: 'Delete failed.', detail: err.message });
  }
});

module.exports = router;
