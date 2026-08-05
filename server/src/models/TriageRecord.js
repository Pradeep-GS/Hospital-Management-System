const mongoose = require('mongoose');

const TriageRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    patientName: { type: String, required: true },
    patientAge: { type: Number, required: true },
    receptionistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },
    symptoms: { type: String, required: true },
    vitals: {
      pulse: { type: Number, required: true },
      temperatureCelsius: { type: Number, required: true },
      bloodPressure: { type: String, required: true },
      spO2Percentage: { type: Number, required: true },
      bloodSugar: { type: Number, default: null }
    },
    priorityColor: {
      type: String,
      enum: ['RED', 'ORANGE', 'YELLOW', 'GREEN'],
      required: true
    },
    priorityLevel: { type: String, required: true }, // Emergency, Very Urgent, Urgent, Non-Urgent
    recommendedDept: { type: String, required: true },
    recommendedSpecialty: { type: String, required: true },
    expectedWaitTimeMinutes: { type: Number, required: true },
    queuePosition: { type: Number, default: 1 },
    emergencyRecommendation: { type: String, required: true },
    alertDispatched: { type: Boolean, default: false },
    triageCardCode: { type: String, unique: true }
  },
  { timestamps: true }
);

TriageRecordSchema.index({ hospitalId: 1, priorityColor: 1, createdAt: -1 });

module.exports = mongoose.model('TriageRecord', TriageRecordSchema);
