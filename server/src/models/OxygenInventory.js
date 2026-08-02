const mongoose = require('mongoose');

const OxygenInventorySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },
    cylinderId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    type: {
      type: String,
      default: 'Standard'
    },
    capacityLitres: {
      type: Number,
      default: 40
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'IN_USE', 'REFILLING', 'EMPTY'],
      default: 'AVAILABLE'
    },
    supplierName: {
      type: String,
      default: ''
    },
    lastRefillDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

OxygenInventorySchema.index({ hospitalId: 1, status: 1 });

module.exports = mongoose.model('OxygenInventory', OxygenInventorySchema);
