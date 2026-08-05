/**
 * Aegis Care Hospital Management System — SMS Notification Microservice
 */

async function sendAppointmentReminderSMS(details) {
  const {
    patientPhone,
    patientName,
    doctorName,
    appointmentDate,
    appointmentTime,
    tokenNumber,
    reminderType
  } = details;

  console.log(`📱 [SMS SERVICE] Sending ${reminderType} SMS reminder to ${patientPhone || patientName}...`);

  const smsText = `AEGIS CARE ALERT: Hi ${patientName}, your appointment with Dr. ${doctorName} is in ${reminderType === '30M' ? '30 mins' : reminderType === '2H' ? '2 hours' : '24 hours'} (${appointmentDate} ${appointmentTime}). Token #${tokenNumber}. Please arrive 15m early.`;

  return {
    success: true,
    smsId: `sms-${Date.now()}`,
    text: smsText
  };
}

module.exports = {
  sendAppointmentReminderSMS
};
