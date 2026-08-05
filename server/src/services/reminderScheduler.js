/**
 * Aegis Care Hospital Management System — Automated Smart Appointment Reminder Engine
 * Automatically scans upcoming appointments and dispatches 24H, 2H, and 30M reminders.
 */

const { Appointment, NotificationLog } = require('../models');
const { sendAppointmentReminderEmail } = require('./emailService');
const { sendAppointmentReminderSMS } = require('./smsService');

let isSchedulerRunning = false;

async function checkAndDispatchReminders() {
  try {
    const now = new Date();
    // Query active/booked upcoming appointments
    const upcomingAppointments = await Appointment.find({
      status: { $in: ['BOOKED', 'CHECKED_IN'] }
    })
    .populate('patientId', 'fullName email phone')
    .populate('doctorId', 'fullName department doctorDetails')
    .populate('hospitalId', 'name location');

    for (const appt of upcomingAppointments) {
      if (!appt.patientId || !appt.doctorId) continue;

      // Construct appointment Date object from appt.date and appt.timeSlot or appt.createdAt
      let apptDateTime = new Date();
      if (appt.date && appt.timeSlot) {
        try {
          const dateStr = appt.date; // e.g. "2026-08-05" or "Aug 5, 2026"
          apptDateTime = new Date(`${dateStr} ${appt.timeSlot}`);
          if (isNaN(apptDateTime.getTime())) apptDateTime = new Date(appt.createdAt);
        } catch (e) {
          apptDateTime = new Date(appt.createdAt);
        }
      } else {
        apptDateTime = new Date(appt.createdAt);
      }

      const diffMs = apptDateTime - now;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      let reminderType = null;
      if (diffMinutes > 0 && diffMinutes <= 35) {
        reminderType = '30M';
      } else if (diffMinutes > 100 && diffMinutes <= 135) {
        reminderType = '2H';
      } else if (diffMinutes > 1380 && diffMinutes <= 1470) {
        reminderType = '24H';
      }

      if (!reminderType) continue;

      // Check if reminder was already dispatched
      const existingLog = await NotificationLog.findOne({
        appointmentId: appt._id,
        reminderType,
        channel: 'EMAIL'
      });

      if (existingLog) continue; // Prevent duplicate reminder

      const details = {
        patientEmail: appt.patientId.email,
        patientPhone: appt.patientId.phone,
        patientName: appt.patientId.fullName,
        doctorName: appt.doctorId.fullName,
        department: appt.doctorId.department || appt.doctorId.doctorDetails?.specialization || 'General OPD',
        hospitalName: appt.hospitalId?.name || 'Aegis Care Medical Center',
        appointmentDate: appt.date || new Date().toLocaleDateString(),
        appointmentTime: appt.timeSlot || '10:00 AM',
        tokenNumber: appt.queuePosition || 1,
        hospitalAddress: appt.hospitalId?.location || 'Main OPD Building',
        reminderType
      };

      // Dispatch Email & SMS
      const emailResult = await sendAppointmentReminderEmail(details);
      const smsResult = await sendAppointmentReminderSMS(details);

      // Log dispatch in DB
      await NotificationLog.create({
        appointmentId: appt._id,
        patientId: appt.patientId._id,
        doctorId: appt.doctorId._id,
        hospitalId: appt.hospitalId?._id || appt.patientId.hospitalId,
        reminderType,
        channel: 'EMAIL',
        status: emailResult.success ? 'SENT' : 'FAILED',
        scheduledTime: apptDateTime,
        sentAt: new Date(),
        recipientEmail: details.patientEmail,
        recipientPhone: details.patientPhone,
        subject: `${reminderType} Reminder: Appointment with Dr. ${details.doctorName}`,
        messageBody: emailResult.html
      });
    }
  } catch (err) {
    console.error('⚠️ [REMINDER SCHEDULER ERROR]:', err.message);
  }
}

function startReminderScheduler(intervalMs = 60000) {
  if (isSchedulerRunning) return;
  isSchedulerRunning = true;
  console.log(`⏰ Smart Appointment Reminder Engine Started (polling every ${intervalMs / 1000}s)`);
  
  // Initial check
  checkAndDispatchReminders();

  // Periodic interval
  setInterval(checkAndDispatchReminders, intervalMs);
}

module.exports = {
  startReminderScheduler,
  checkAndDispatchReminders
};
