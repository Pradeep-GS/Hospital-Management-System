const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      required: true,
      unique: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
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

    queuePosition: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['BOOKED', 'CHECKED_IN', 'ACTIVE', 'COMPLETED', 'PAID', 'CANCELLED'],
      default: 'BOOKED'
    },

    // EMR Access Window timestamps
    activeWindowStartedAt: { type: Date },
    activeWindowEndedAt:   { type: Date },

    bookingChannel: {
      type: String,
      enum: ['PATIENT_APP', 'RECEPTION_DESK'],
      default: 'PATIENT_APP'
    },

    date: {
      type: String,
      default: ''
    },

    timeSlot: {
      type: String,
      default: ''
    },

    roomAllocated: {
      roomId:     { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryRoom' },
      roomNumber: { type: String },
      allocatedAt:{ type: Date }
    },

    notes: { type: String, default: '' },

    aiPrediction: {
      attendanceProbability: { type: Number, default: 85 }, // Percentage
      noShowProbability: { type: Number, default: 15 },    // Percentage
      recommendedAction: { type: String, default: 'Reminder' }, // Reminder, Teleconsultation, Reschedule, Backup Patient
      riskFactors: [{ type: String }],
      predictedAt: { type: Date }
    }
  },
  { timestamps: true }
);

// Indexes for queue lookups and hospital-scoped daily reports
AppointmentSchema.index({ doctorId: 1, status: 1, queuePosition: 1 });
AppointmentSchema.index({ hospitalId: 1, createdAt: -1 });
AppointmentSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
