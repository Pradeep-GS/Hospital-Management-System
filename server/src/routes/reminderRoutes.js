const express = require('express');
const { NotificationLog, Appointment } = require('../models');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { checkAndDispatchReminders } = require('../services/reminderScheduler');
const { sendAppointmentReminderEmail } = require('../services/emailService');

const router = express.Router();
router.use(verifyToken);

// 1. Fetch Notification Logs (Admin / Receptionist)
router.get('/logs', authorizeRoles('HOSPITAL_ADMIN', 'SYSTEM_ADMIN', 'RECEPTIONIST'), async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const filter = hospitalId ? { hospitalId } : {};
    
    const logs = await NotificationLog.find(filter)
      .populate('patientId', 'fullName email phone')
      .populate('doctorId', 'fullName department')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reminder logs.', detail: err.message });
  }
});

// 2. Trigger Manual Retry for Failed Reminder
router.post('/retry/:id', authorizeRoles('HOSPITAL_ADMIN', 'SYSTEM_ADMIN'), async (req, res) => {
  try {
    const log = await NotificationLog.findById(req.params.id)
      .populate('appointmentId')
      .populate('patientId', 'fullName email phone')
      .populate('doctorId', 'fullName department')
      .populate('hospitalId', 'name location');

    if (!log) {
      return res.status(404).json({ error: 'Notification log not found.' });
    }

    const details = {
      patientEmail: log.patientId?.email || log.recipientEmail,
      patientPhone: log.patientId?.phone || log.recipientPhone,
      patientName: log.patientId?.fullName || 'Patient',
      doctorName: log.doctorId?.fullName || 'Physician',
      department: log.doctorId?.department || 'OPD',
      hospitalName: log.hospitalId?.name || 'Aegis Care Medical Center',
      appointmentDate: log.appointmentId?.date || new Date().toLocaleDateString(),
      appointmentTime: log.appointmentId?.timeSlot || '10:00 AM',
      tokenNumber: log.appointmentId?.queuePosition || 1,
      hospitalAddress: log.hospitalId?.location || 'Main Building',
      reminderType: log.reminderType
    };

    const result = await sendAppointmentReminderEmail(details);
    log.status = result.success ? 'RETRIED' : 'FAILED';
    log.sentAt = new Date();
    log.retryCount += 1;
    await log.save();

    return res.json({ message: 'Reminder retried successfully.', log });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retry notification.', detail: err.message });
  }
});

// 3. Reminder Analytics
router.get('/analytics', authorizeRoles('HOSPITAL_ADMIN', 'SYSTEM_ADMIN'), async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const filter = hospitalId ? { hospitalId } : {};

    const [totalSent, totalFailed, total24h, total2h, total30m] = await Promise.all([
      NotificationLog.countDocuments({ ...filter, status: { $in: ['SENT', 'RETRIED'] } }),
      NotificationLog.countDocuments({ ...filter, status: 'FAILED' }),
      NotificationLog.countDocuments({ ...filter, reminderType: '24H' }),
      NotificationLog.countDocuments({ ...filter, reminderType: '2H' }),
      NotificationLog.countDocuments({ ...filter, reminderType: '30M' })
    ]);

    const totalDispatches = totalSent + totalFailed;
    const deliveryRate = totalDispatches > 0 ? ((totalSent / totalDispatches) * 100).toFixed(1) : 100;

    return res.json({
      analytics: {
        totalDispatches,
        totalSent,
        totalFailed,
        deliveryRate: Number(deliveryRate),
        byType: {
          reminder24h: total24h,
          reminder2h: total2h,
          reminder30m: total30m
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch analytics.', detail: err.message });
  }
});

// 4. Trigger Instant Manual Scheduler Scan
router.post('/trigger-scan', authorizeRoles('HOSPITAL_ADMIN', 'SYSTEM_ADMIN'), async (req, res) => {
  try {
    await checkAndDispatchReminders();
    return res.json({ message: 'Reminder scheduler scan executed successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to trigger scan.', detail: err.message });
  }
});

module.exports = router;
