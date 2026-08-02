const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    universalPatientId: {
      type: String,
      unique: true,
      sparse: true   // allows null for non-patient roles
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null   // null for SYSTEM_ADMIN
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT', 'PHARMACY', 'NURSE', 'LAB_TECH', 'STAFF'],
      required: true
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING'
    },
    employeeId: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    designation: {
      type: String,
      default: ''
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    photoUrl: {
      type: String,
      default: ''
    },

    // Populated only when role === 'DOCTOR'
    doctorDetails: {
      specialization:   { type: String },
      licenseNumber:    { type: String },
      consultationFee:  { type: Number, default: 100 },
      roomNo:           { type: String },
      isAvailable:      { type: Boolean, default: true }
    },

    // Populated only when role === 'PATIENT'
    qrCodePayload: {
      type: String,
      default: null
    },
    age:    { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Unspecified', 'MALE', 'FEMALE', 'OTHER'], default: 'Unspecified' }
  },
  { timestamps: true }
);

// Compound indexes for fast role-scoped queries
UserSchema.index({ hospitalId: 1, role: 1 });

module.exports = mongoose.model('User', UserSchema);
