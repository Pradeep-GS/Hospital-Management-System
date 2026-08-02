const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employeeId: {
      type: String,
      default: ''
    },
    employeeName: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      required: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null
    },
    loginTime: {
      type: Date,
      default: Date.now
    },
    logoutTime: {
      type: Date,
      default: null
    },
    ipAddress: {
      type: String,
      default: ''
    },
    browser: {
      type: String,
      default: ''
    }
  },
  { timestamps: false }
);

LoginLogSchema.index({ userId: 1, loginTime: -1 });

module.exports = mongoose.model('LoginLog', LoginLogSchema);
