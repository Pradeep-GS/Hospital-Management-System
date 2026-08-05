/**
 * Aegis Care Hospital Management System — Email Notification Microservice
 */

async function sendAppointmentReminderEmail(details) {
  const {
    patientEmail,
    patientName,
    doctorName,
    department,
    hospitalName,
    appointmentDate,
    appointmentTime,
    tokenNumber,
    hospitalAddress,
    reminderType
  } = details;

  console.log(`📧 [EMAIL SERVICE] Sending ${reminderType} appointment reminder to ${patientEmail || patientName}...`);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 700;">${hospitalName || 'Aegis Care Hospital'}</h2>
        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Smart Healthcare Appointment Notification</p>
      </div>
      
      <div style="padding: 24px; color: #334155;">
        <p style="font-size: 16px;">Dear <strong>${patientName}</strong>,</p>
        <p>This is a reminder for your upcoming medical appointment scheduled in <strong>${reminderType === '30M' ? '30 Minutes' : reminderType === '2H' ? '2 Hours' : '24 Hours'}</strong>.</p>
        
        <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 4px 0; color: #64748b;">Doctor:</td><td style="font-weight: 600;">Dr. ${doctorName} (${department})</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Date & Time:</td><td style="font-weight: 600;">${appointmentDate} at ${appointmentTime}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Token Number:</td><td style="font-weight: 700; color: #2563eb; font-size: 18px;">#${tokenNumber}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Location:</td><td style="font-weight: 600;">${hospitalAddress || 'Main OPD Building, Floor 2'}</td></tr>
          </table>
        </div>

        <p style="background: #eff6ff; color: #1e40af; padding: 12px; border-radius: 6px; font-size: 13px; font-weight: 500;">
          📌 <strong>Important:</strong> Please arrive 15 minutes early for vital checks and queue verification.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="#" style="background: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 8px; display: inline-block;">View Appointment</a>
          <a href="#" style="background: #e2e8f0; color: #334155; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reschedule / Cancel</a>
        </div>
      </div>

      <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        Need help? Contact Hospital Reception Desk at +1 (800) 555-AEGIS.
      </div>
    </div>
  `;

  return {
    success: true,
    messageId: `msg-${Date.now()}`,
    html: htmlContent
  };
}

module.exports = {
  sendAppointmentReminderEmail
};
