const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema(
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
    category: {
      type: String,
      default: 'General'
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    manufacturer: {
      type: String,
      default: ''
    },
    purchaseDate: {
      type: Date,
      default: null
    },
    warrantyYears: {
      type: Number,
      default: 1
    },
    availableQuantity: {
      type: Number,
      default: 1,
      min: 0
    },
    inUseQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    damagedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    maintenanceStatus: {
      type: String,
      enum: ['GOOD', 'UNDER_MAINTENANCE', 'REPAIR_REQUIRED'],
      default: 'GOOD'
    }
  },
  { timestamps: true }
);

EquipmentSchema.index({ hospitalId: 1, name: 1 });

module.exports = mongoose.model('Equipment', EquipmentSchema);
