const express = require('express');
const jwt = require('jsonwebtoken');
const { User, StaffLog, Hospital } = require('../models');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── 1. Login ───────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    // Fallback: If user not found, attempt auto-seeding demo database if empty
    if (!user) {
      const { autoSeedDemoData } = require('../config/db');
      await autoSeedDemoData();
      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user || user.passwordHash !== password.trim()) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (user.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ error: `Account access restricted. Status: ${user.approvalStatus}.` });
    }
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account has been deactivated. Please contact your Hospital Administrator.' });
    }

    // Save Login History
    const { LoginLog } = require('../models');
    await LoginLog.create({
      userId:       user._id,
      employeeId:   user.employeeId || '',
      employeeName: user.fullName,
      role:         user.role,
      hospitalId:   user.hospitalId,
      ipAddress:    req.ip || '127.0.0.1',
      browser:      req.headers['user-agent'] || 'Browser'
    });

    // Audit trail for staff roles
    if (['DOCTOR', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'PHARMACY'].includes(user.role)) {
      await StaffLog.create({
        hospitalId: user.hospitalId,
        userId:     user._id,
        userName:   user.fullName,
        userRole:   user.role,
        action:     'SIGN_IN',
        ipAddress:  req.ip || '127.0.0.1',
        userAgent:  req.headers['user-agent'] || 'System Client',
        timestamp:  new Date()
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), fullName: user.fullName, role: user.role, hospitalId: user.hospitalId?.toString() },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    const hospitalObj = user.hospitalId ? await Hospital.findById(user.hospitalId) : null;

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id:                user._id,
        fullName:          user.fullName,
        email:             user.email,
        role:              user.role,
        hospitalId:        user.hospitalId,
        hospitalName:      hospitalObj ? hospitalObj.name : 'Platform Hospital',
        hospitalCode:      hospitalObj ? hospitalObj.hospitalCode : 'HOSP-01',
        universalPatientId:user.universalPatientId,
        qrCodePayload:     user.qrCodePayload,
        doctorDetails:     user.doctorDetails,
        mustChangePassword:user.mustChangePassword
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed.', detail: err.message });
  }
});

// ── 2. Register ────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { fullName, email, password, phone, role, hospitalId, specialization, licenseNumber, age, gender } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password required.' });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const newRole  = role || 'PATIENT';
    const isPatient = newRole === 'PATIENT';
    const upid = isPatient
      ? `UPID-${Math.floor(1000 + Math.random() * 9000)}-2026`
      : undefined;

    const newUser = await User.create({
      universalPatientId: upid,
      hospitalId:         hospitalId || null,
      fullName,
      email:              email.toLowerCase(),
      passwordHash:       password,
      phone:              phone || '',
      role:               newRole,
      approvalStatus:     isPatient ? 'APPROVED' : 'PENDING',
      age:                age || undefined,
      gender:             gender || 'Unspecified',
      qrCodePayload: upid
        ? `${upid}|${fullName.toUpperCase().replace(/\s+/g, '_')}|UNIVERSAL_HOSPITAL_KEY`
        : undefined,
      doctorDetails: newRole === 'DOCTOR' ? {
        specialization: specialization || 'General Medicine',
        licenseNumber:  licenseNumber || `MD-${Math.floor(100000 + Math.random() * 900000)}`,
        consultationFee: 100,
        isAvailable: true
      } : undefined
    });

    return res.status(201).json({
      message: isPatient
        ? 'Patient registered successfully.'
        : 'Staff registration submitted. Requires dual approval.',
      user: { id: newUser._id, email: newUser.email, role: newUser.role, approvalStatus: newUser.approvalStatus }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed.', detail: err.message });
  }
});

// Register Hospital Endpoint
router.post('/register-hospital', async (req, res) => {
  const {
    name,
    registrationNumber,
    licenseNumber,
    hospitalType,
    address,
    contactPhone,
    contactEmail,
    adminName,
    adminPassword
  } = req.body;

  if (!name || !contactEmail || !adminName || !adminPassword) {
    return res.status(400).json({ error: 'Hospital Name, Email, Admin Name, and Admin Password are required.' });
  }

  try {
    const existingHosp = await Hospital.findOne({ name });
    if (existingHosp) {
      return res.status(400).json({ error: 'Hospital with this name is already registered.' });
    }

    const existingUser = await User.findOne({ email: contactEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'An administrator account with this email already exists.' });
    }

    const hospitalCode = 'HOSP-' + name.toUpperCase().replace(/\s+/g, '-').slice(0, 8) + '-' + Math.floor(10 + Math.random() * 90);

    const hospital = await Hospital.create({
      hospitalCode,
      name,
      registrationNumber: registrationNumber || '',
      licenseNumber: licenseNumber || '',
      hospitalType: hospitalType || 'General',
      address: address || {},
      contactEmail: contactEmail.toLowerCase(),
      contactPhone: contactPhone || '',
      verificationStatus: 'PENDING_ADMIN',
      dualVerification: { hospitalVerifiedAt: new Date() }
    });

    const adminUser = await User.create({
      hospitalId: hospital._id,
      fullName: adminName,
      email: contactEmail.toLowerCase(),
      passwordHash: adminPassword,
      phone: contactPhone || '',
      role: 'HOSPITAL_ADMIN',
      approvalStatus: 'PENDING'
    });

    return res.status(201).json({
      message: 'Hospital and Admin account registered. Pending System Admin approval.',
      hospital,
      admin: { id: adminUser._id, email: adminUser.email }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Hospital registration failed.', detail: err.message });
  }
});

// ── 3. Emergency 2-Step Auth ───────────────────────────────────────────────
router.post('/emergency-login', async (req, res) => {
  const { staffId, hospitalCode, emergencyPasscode } = req.body;
  if (!staffId || !hospitalCode || !emergencyPasscode) {
    return res.status(400).json({ error: 'Staff ID, Hospital Code, and Emergency Passcode required.' });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: staffId }, { _id: staffId.match(/^[0-9a-fA-F]{24}$/) ? staffId : null }]
    });

    if (!user) {
      return res.status(404).json({ error: 'Staff account not found.' });
    }
    if (emergencyPasscode !== 'EMERGENCY-911') {
      return res.status(401).json({ error: 'Invalid 2-Step Emergency Verification Passcode.' });
    }

    await StaffLog.create({
      hospitalId: user.hospitalId,
      userId:     user._id,
      userName:   user.fullName,
      userRole:   user.role,
      action:     'EMERGENCY_ACCESS',
      ipAddress:  req.ip || '127.0.0.1',
      userAgent:  'EMERGENCY_OVERRIDE_TERMINAL',
      timestamp:  new Date()
    });

    const token = jwt.sign(
      { id: user._id.toString(), fullName: user.fullName, role: user.role, hospitalId: user.hospitalId?.toString(), isEmergency: true },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: '🚨 Emergency 2-Step Verification Succeeded.',
      token,
      user: { id: user._id, fullName: user.fullName, role: user.role, hospitalId: user.hospitalId }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Emergency login failed.', detail: err.message });
  }
});

// ── 4. Logout ─────────────────────────────────────────────────────────────
router.post('/logout', verifyToken, async (req, res) => {
  try {
    await StaffLog.create({
      hospitalId: req.user.hospitalId,
      userId:     req.user.id,
      userName:   req.user.fullName,
      userRole:   req.user.role,
      action:     'SIGN_OUT',
      ipAddress:  req.ip || '127.0.0.1',
      userAgent:  req.headers['user-agent'] || 'System Client',
      timestamp:  new Date()
    });
    return res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Logout failed.', detail: err.message });
  }
});

// ── 5. Get Current User Profile ────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const hospitalObj = user.hospitalId ? await Hospital.findById(user.hospitalId) : null;
    user.hospitalName = hospitalObj ? hospitalObj.name : 'Platform Hospital';
    user.hospitalCode = hospitalObj ? hospitalObj.hospitalCode : 'HOSP-01';

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile.', detail: err.message });
  }
});
// ── 6. Change Password ──────────────────────────────────────────────────────
router.post('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All password fields are required.' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New password and confirm password do not match.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User account not found.' });

    if (user.passwordHash !== currentPassword) {
      return res.status(400).json({ error: 'Current password entered is incorrect.' });
    }

    user.passwordHash = newPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to change password.', detail: err.message });
  }
});

// ── 7. Get Login History ────────────────────────────────────────────────────
router.get('/login-history', verifyToken, async (req, res) => {
  try {
    const { LoginLog } = require('../models');
    const logs = await LoginLog.find({ userId: req.user.id }).sort({ loginTime: -1 }).limit(20);
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch login history.', detail: err.message });
  }
});

module.exports = router;
