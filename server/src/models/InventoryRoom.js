const mongoose = require('mongoose');

const InventoryRoomSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },
    roomType: {
      type: String,
      enum: ['GENERAL_WARD', 'PRIVATE', 'SEMI_PRIVATE', 'ICU', 'NICU', 'EMERGENCY', 'OPERATION_THEATRE'],
      default: 'GENERAL_WARD'
    },
    dailyRate: {
      type: Number,
      default: 100
    },
    isOccupied: {
      type: Boolean,
      default: false
    },
    currentPatientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    occupiedAt: {
      type: Date,
      default: null
    },
    estimatedDischargeDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

InventoryRoomSchema.index({ hospitalId: 1, isOccupied: 1 });

module.exports = mongoose.model('InventoryRoom', InventoryRoomSchema);
