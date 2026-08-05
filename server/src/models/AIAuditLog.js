const mongoose = require('mongoose');

const AIAuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userRole: {
      type: String,
      required: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    featureType: {
      type: String,
      enum: ['COPILOT', 'TRIAGE', 'CLINICAL_ASSISTANT', 'PRESCRIPTION_GEN', 'PREDICTION', 'SUMMARY'],
      required: true
    },
    inputPrompt: { type: String, default: '' },
    outputResponse: { type: mongoose.Schema.Types.Mixed },
    actionTaken: {
      type: String,
      enum: ['APPROVED', 'REJECTED', 'MODIFIED', 'VIEWED', 'DISPATCHED', 'GENERATED'],
      default: 'VIEWED'
    },
    confidenceScore: { type: Number, default: 0.95 },
    executionTimeMs: { type: Number, default: 0 },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' }
  },
  { timestamps: true }
);

AIAuditLogSchema.index({ hospitalId: 1, featureType: 1, createdAt: -1 });
AIAuditLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIAuditLog', AIAuditLogSchema);
