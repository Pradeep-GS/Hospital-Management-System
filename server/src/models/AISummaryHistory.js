const mongoose = require('mongoose');

const AISummaryHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    patientOverview: { type: String, default: '' },
    chronicDiseases: [{ type: String }],
    previousDiagnoses: [{ type: String }],
    previousAdmissions: [{ type: String }],
    previousSurgeries: [{ type: String }],
    allergies: [{ type: String }],
    currentMedications: [{ type: String }],
    pastMedications: [{ type: String }],
    recentComplaints: [{ type: String }],
    laboratoryReportSummary: { type: String, default: '' },
    radiologyReportSummary: { type: String, default: '' },
    familyHistory: { type: String, default: '' },
    lifestyleHabits: {
      smoking: { type: String, default: 'None' },
      alcohol: { type: String, default: 'None' },
      exercise: { type: String, default: 'Moderate' },
      diet: { type: String, default: 'Balanced' }
    },
    vaccinationHistory: [{ type: String }],
    pregnancyHistory: { type: String, default: 'N/A' },

    riskLevel: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    },
    highRiskConditions: [{ type: String }],
    importantAlerts: [{ type: String }],
    followupRecommendation: { type: String, default: '' },
    lastConsultationSummary: { type: String, default: '' },
    
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

AISummaryHistorySchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('AISummaryHistory', AISummaryHistorySchema);
