const mongoose = require('mongoose');

const PharmacyItemSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    genericName: {
      type: String,
      default: '',
      trim: true
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    reorderLevel: {
      type: Number,
      default: 20   // triggers low-stock warning when stockQuantity <= reorderLevel
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    gstRatePercentage: {
      type: Number,
      enum: [0, 5, 12, 18],
      default: 5
    },
    expiryDate: {
      type: Date,
      required: true
    },
    manufacturer: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'TOPICAL', 'DROPS', 'OTHER'],
      default: 'TABLET'
    }
  },
  { timestamps: true }
);

PharmacyItemSchema.index({ hospitalId: 1, name: 1 });
PharmacyItemSchema.index({ hospitalId: 1, stockQuantity: 1 });

module.exports = mongoose.model('PharmacyItem', PharmacyItemSchema);
