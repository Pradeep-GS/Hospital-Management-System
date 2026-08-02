const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null   // null means platform-wide alert
    },
    message: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['STAFF_REGISTRATION', 'LOW_STOCK', 'ROOM_ALERT', 'GENERAL'],
      default: 'GENERAL'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

NotificationSchema.index({ hospitalId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
