const mongoose = require('mongoose');

const InventoryMachinerySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },
    equipmentType: {
      type: String,
      enum: ['OXYGEN_CYLINDER', 'VENTILATOR', 'ECG_MONITOR', 'DEFIBRILLATOR', 'INFUSION_PUMP', 'OTHER'],
      required: true
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE'],
      default: 'AVAILABLE'
    },
    assignedRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryRoom',
      default: null
    },
    hourlyRate: {
      type: Number,
      default: 15
    },
    lastMaintenanceDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

InventoryMachinerySchema.index({ hospitalId: 1, equipmentType: 1, status: 1 });

module.exports = mongoose.model('InventoryMachinery', InventoryMachinerySchema);
