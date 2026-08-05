const mongoose = require('mongoose');

const PrescriptionItemSchema = new mongoose.Schema(
  {
    medicineId:       { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyItem' },
    medicineName:     { type: String, required: true },
    dosage:           { type: String, default: '' },       // e.g. "500mg"
    frequency:        { type: String, default: '' },       // e.g. "1-0-1 (After Meals)"
    durationDays:     { type: Number, default: 5 },
    quantityRequired: { type: Number, required: true },
    unitPrice:        { type: Number, default: 0 },
    gstRatePercentage:{ type: Number, enum: [0, 5, 12, 18], default: 5 }
  },
  { _id: false }   // embedded sub-document, no separate _id needed
);

const PrescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true   // one prescription per appointment
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: { type: String },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorName: { type: String },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },

    items: [PrescriptionItemSchema],

    approvalStatus: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'REJECTED'],
      default: 'APPROVED' // legacy or explicit doctor creation defaults to APPROVED
    },

    approvedAt: { type: Date },

    digitalSignature: {
      isSigned: { type: Boolean, default: false },
      signatureHash: { type: String, default: '' },
      signedAt: { type: Date },
      doctorLicenseNumber: { type: String, default: '' }
    },

    aiSafetyChecks: {
      drugInteractions: [{ type: String }],
      duplicateMedicines: [{ type: String }],
      allergyConflicts: [{ type: String }],
      pregnancySafety: { type: String, default: 'SAFE' },
      pediatricDosage: { type: String, default: 'SAFE' },
      geriatricDosage: { type: String, default: 'SAFE' },
      kidneyAdjustment: { type: String, default: 'NORMAL' },
      liverAdjustment: { type: String, default: 'NORMAL' },
      genericAlternatives: [{ type: String }]
    },

    instructions: { type: String, default: '' },
    dietAdvice: { type: String, default: '' },
    lifestyleAdvice: { type: String, default: '' },
    hydrationAdvice: { type: String, default: '' },
    exerciseAdvice: { type: String, default: '' },

    dispenseStatus: {
      type: String,
      enum: ['PENDING', 'DISPENSED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

PrescriptionSchema.index({ hospitalId: 1, dispenseStatus: 1, approvalStatus: 1, createdAt: -1 });
PrescriptionSchema.index({ patientId: 1 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
