/**
 * Central model export — import all Mongoose models from here.
 * Usage: const { User, Hospital, Appointment } = require('../models');
 */
module.exports = {
  Hospital:           require('./Hospital'),
  User:               require('./User'),
  StaffLog:           require('./StaffLog'),
  Appointment:        require('./Appointment'),
  EMRRecord:          require('./EMRRecord'),
  Prescription:       require('./Prescription'),
  InventoryRoom:      require('./InventoryRoom'),
  InventoryMachinery: require('./InventoryMachinery'),
  PharmacyItem:       require('./PharmacyItem'),
  Invoice:            require('./Invoice'),
  Equipment:          require('./Equipment'),
  OxygenInventory:    require('./OxygenInventory'),
  LoginLog:           require('./LoginLog'),
  Notification:       require('./Notification')
};
