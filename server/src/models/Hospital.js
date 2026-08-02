const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema(
  {
    hospitalCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    registrationNumber: {
      type: String,
      default: ''
    },
    licenseNumber: {
      type: String,
      default: ''
    },
    hospitalType: {
      type: String,
      default: 'General'
    },
    address: {
      street: { type: String, default: '' },
      city:   { type: String, default: '' },
      state:  { type: String, default: '' },
      zipCode:{ type: String, default: '' }
    },
    contactEmail: {
      type: String,
      required: false,
      lowercase: true,
      trim: true
    },
    contactPhone: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING_HOSPITAL', 'PENDING_ADMIN', 'APPROVED', 'REJECTED'],
      default: 'PENDING_ADMIN'
    },
    dualVerification: {
      hospitalVerifiedAt: { type: Date },
      adminVerifiedAt:    { type: Date },
      adminVerifiedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    consultantFeeStructure: {
      generalPhysician:  { type: Number, default: 50 },
      specialist:        { type: Number, default: 100 },
      superSpecialist:   { type: Number, default: 180 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', HospitalSchema);
