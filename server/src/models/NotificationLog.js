const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    reminderType: {
      type: String,
      enum: ['24H', '2H', '30M', 'CUSTOM'],
      required: true
    },
    channel: {
      type: String,
      enum: ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'],
      default: 'EMAIL'
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED', 'RETRIED'],
      default: 'PENDING'
    },
    scheduledTime: { type: Date, required: true },
    sentAt: { type: Date },
    retryCount: { type: Number, default: 0 },
    recipientEmail: { type: String, default: '' },
    recipientPhone: { type: String, default: '' },
    subject: { type: String, default: '' },
    messageBody: { type: String, default: '' },
    errorDetails: { type: String, default: '' }
  },
  { timestamps: true }
);

NotificationLogSchema.index({ appointmentId: 1, reminderType: 1, channel: 1 }, { unique: true });
NotificationLogSchema.index({ hospitalId: 1, status: 1, scheduledTime: 1 });

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
