const mongoose = require('mongoose');

const GSTBreakdownSchema = new mongoose.Schema(
  {
    gst5PercentAmount:  { type: Number, default: 0 },
    gst12PercentAmount: { type: Number, default: 0 },
    gst18PercentAmount: { type: Number, default: 0 },
    totalGst:           { type: Number, default: 0 }
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true   // one invoice per appointment
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: { type: String },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },

    breakdown: {
      consultantFee:       { type: Number, default: 0 },
      roomChargeTotal:     { type: Number, default: 0 },
      machineryChargeTotal:{ type: Number, default: 0 },
      medicineSubtotal:    { type: Number, default: 0 },
      gstBreakdown:        { type: GSTBreakdownSchema },
      subtotalBeforeTax:   { type: Number, default: 0 },
      totalAmount:         { type: Number, default: 0 }
    },

    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID'],
      default: 'UNPAID'
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'INSURANCE', 'OTHER'],
      default: 'CASH'
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

InvoiceSchema.index({ hospitalId: 1, createdAt: -1 });
InvoiceSchema.index({ patientId: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
