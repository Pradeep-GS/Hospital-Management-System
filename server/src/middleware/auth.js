const jwt = require('jsonwebtoken');
const { Appointment, StaffLog } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'hospital-platform-secret-key-2026';

/**
 * Middleware 1: Verify JWT Authentication Token
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Authorization token required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authorization token.' });
  }
};

/**
 * Middleware 2: Role-Based Access Control (RBAC)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Role '${req.user ? req.user.role : 'UNAUTHENTICATED'}' is unauthorized to perform this action.`
      });
    }
    next();
  };
};

/**
 * Middleware 3: Dynamic EMR Access Window Enforcement
 * Enforces rule: Doctor can ONLY access EMR when appointment status === 'ACTIVE'
 */
const validateActiveEMRAccess = async (req, res, next) => {
  const appointmentId = req.query.appointmentId || req.body.appointmentId;

  if (!appointmentId) {
    return res.status(400).json({ error: 'EMR Access Error: Active appointmentId is required.' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: 'EMR Access Error: Appointment record not found.' });
    }

    // Guard: appointment must be ACTIVE
    if (appointment.status !== 'ACTIVE') {
      // Log the denied access attempt as an audit event
      await StaffLog.create({
        hospitalId: req.user.hospitalId || appointment.hospitalId,
        userId:     req.user.id,
        userName:   req.user.fullName,
        userRole:   req.user.role,
        action:     'EMR_ACCESS_DENIED',
        ipAddress:  req.ip || '127.0.0.1',
        userAgent:  req.headers['user-agent'] || 'System',
        timestamp:  new Date()
      });

      return res.status(403).json({
        error: 'EMR Access Denied: Records are only accessible while the appointment is ACTIVE.',
        appointmentStatus: appointment.status
      });
    }

    // Guard: only the assigned doctor may access
    if (req.user.role === 'DOCTOR' && appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'EMR Access Denied: You are not the assigned doctor for this appointment.' });
    }

    req.activeAppointment = appointment;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'EMR access validation failed.', detail: err.message });
  }
};

module.exports = { verifyToken, authorizeRoles, validateActiveEMRAccess, JWT_SECRET };
