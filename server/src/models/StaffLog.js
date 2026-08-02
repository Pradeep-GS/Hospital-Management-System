const mongoose = require('mongoose');

const StaffLogSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName:  { type: String, required: true },
    userRole:  { type: String, required: true },
    action: {
      type: String,
      enum: ['SIGN_IN', 'SIGN_OUT', 'EMERGENCY_ACCESS', 'EMR_ACCESS_DENIED'],
      required: true
    },
    ipAddress:  { type: String, default: '' },
    userAgent:  { type: String, default: '' },
    timestamp:  { type: Date, default: Date.now }
  },
  { timestamps: false }   // manual timestamp for audit accuracy
);

// Indexes for fast log retrieval per hospital and per user
StaffLogSchema.index({ hospitalId: 1, timestamp: -1 });
StaffLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('StaffLog', StaffLogSchema);
