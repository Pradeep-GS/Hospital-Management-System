const mongoose = require('mongoose');

const EMRRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    vitals: {
      bloodPressure:      { type: String, default: '' },
      heartRate:          { type: Number },
      temperatureCelsius: { type: Number },
      spO2Percentage:     { type: Number }
    },

    symptoms:    [{ type: String }],
    diagnosis:   { type: String, default: '' },
    doctorNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

// Access is checked at middleware level against Appointment status === 'ACTIVE'
EMRRecordSchema.index({ patientId: 1, createdAt: -1 });
EMRRecordSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('EMRRecord', EMRRecordSchema);
