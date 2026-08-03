const express = require('express');
const { User, StaffLog, InventoryRoom, InventoryMachinery, OxygenInventory } = require('../models');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.use(authorizeRoles('HOSPITAL_ADMIN', 'SYSTEM_ADMIN'));

// ── 1. Hospital Dashboard Metrics ──────────────────────────────────────────
router.get('/dashboard-metrics', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  if (!hospitalId) {
    return res.status(400).json({ error: 'Hospital ID required for dashboard metrics.' });
  }

  try {
    const [
      doctorCount,
      nurseCount,
      receptionistCount,
      pharmacyCount,
      labCount,
      totalEmployees,
      activeStaff,
      inactiveStaff,
      totalPatientCount,
      rooms,
      oxygenCylinders,
      allMachinery
    ] = await Promise.all([
      User.countDocuments({ hospitalId, role: 'DOCTOR' }),
      User.countDocuments({ hospitalId, role: 'NURSE' }),
      User.countDocuments({ hospitalId, role: 'RECEPTIONIST' }),
      User.countDocuments({ hospitalId, role: 'PHARMACY' }),
      User.countDocuments({ hospitalId, role: 'LAB_TECH' }),
      User.countDocuments({ hospitalId, role: { $ne: 'PATIENT' } }),
      User.countDocuments({ hospitalId, role: { $ne: 'PATIENT' }, isActive: true }),
      User.countDocuments({ hospitalId, role: { $ne: 'PATIENT' }, isActive: false }),
      User.countDocuments({ role: 'PATIENT' }),
      InventoryRoom.find({ hospitalId }),
      OxygenInventory.find({ hospitalId }),
      InventoryMachinery.find({ hospitalId })
    ]);

    const occupiedRooms = rooms.filter((r) => r.isOccupied);
    const availableCylinders = oxygenCylinders.filter((m) => m.status === 'AVAILABLE');

    return res.json({
      metrics: {
        doctorCount,
        nurseCount,
        receptionistCount,
        pharmacyCount,
        labCount,
        totalEmployees,
        activeStaff,
        inactiveStaff,
        totalPatientCount,
        rooms: {
          total:    rooms.length,
          occupied: occupiedRooms.length,
          available: rooms.length - occupiedRooms.length,
          occupiedDetails: occupiedRooms.map((r) => ({
            roomId:                r._id,
            roomNumber:            r.roomNumber,
            patientId:             r.currentPatientId,
            occupiedAt:            r.occupiedAt,
            estimatedDischargeDate:r.estimatedDischargeDate
          }))
        },
        machinery: {
          totalOxygenCylinders:     oxygenCylinders.length,
          availableOxygenCylinders: availableCylinders.length,
          allMachinery
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load hospital metrics.', detail: err.message });
  }
});

// ── 2. Register Doctor (Hospital Admin verified) ───────────────────────────
router.post('/doctors', async (req, res) => {
  const { fullName, email, password, phone, specialization, licenseNumber, consultationFee, roomNo } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Name, Email, and Password required.' });
  }

  const hospitalId = req.user.hospitalId;
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const newDoctor = await User.create({
      hospitalId,
      fullName,
      email:        email.toLowerCase(),
      passwordHash: password,
      phone:        phone || '',
      role:         'DOCTOR',
      approvalStatus: 'APPROVED',
      doctorDetails: {
        specialization:  specialization || 'General Medicine',
        licenseNumber:   licenseNumber  || `MD-${Math.floor(100000 + Math.random() * 900000)}`,
        consultationFee: Number(consultationFee) || 100,
        roomNo:          roomNo || 'Clinic 101',
        isAvailable:     true
      }
    });

    return res.status(201).json({ message: 'Doctor registered successfully.', doctor: newDoctor });
  } catch (err) {
    return res.status(500).json({ error: 'Doctor registration failed.', detail: err.message });
  }
});

// ── 3. List All Doctors in Hospital ───────────────────────────────────────
router.get('/doctors', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  try {
    const doctors = await User.find({ hospitalId, role: 'DOCTOR' }).select('-passwordHash');
    return res.json({ doctors });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch doctors.', detail: err.message });
  }
});

// ── 4. Staff Sign-in / Logout Audit Trail ─────────────────────────────────
router.get('/staff-logs', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  try {
    const logs = await StaffLog.find({ hospitalId })
      .sort({ timestamp: -1 })
      .limit(100);
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch staff logs.', detail: err.message });
  }
});

// ── 5. Add Room to Inventory ───────────────────────────────────────────────
router.post('/inventory/rooms', async (req, res) => {
  const { roomNumber, roomType, dailyRate } = req.body;
  const hospitalId = req.user.hospitalId;
  try {
    const newRoom = await InventoryRoom.create({
      hospitalId,
      roomNumber,
      roomType:  roomType  || 'GENERAL_WARD',
      dailyRate: Number(dailyRate) || 100
    });
    return res.status(201).json({ message: 'Room added to hospital inventory.', room: newRoom });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add room.', detail: err.message });
  }
});

// ── 7. Staff Management (Get, Edit, Approve, Status Toggle, Reset Password) ──
router.get('/staff', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  try {
    const staff = await User.find({ hospitalId, role: { $ne: 'PATIENT' } }).select('-passwordHash');
    return res.json({ staff });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch staff directory.', detail: err.message });
  }
});

router.post('/staff/add', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  const { fullName, email, phone, role, department, designation, gender, joiningDate } = req.body;

  if (!fullName || !email || !role) {
    return res.status(400).json({ error: 'Name, Email, and Role are required.' });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const rolePrefix = role.substring(0, 3).toUpperCase();
    const autoEmpId = `EMP-${rolePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const isDoctor = role.toUpperCase() === 'DOCTOR';

    const newStaff = await User.create({
      hospitalId,
      employeeId: autoEmpId,
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      role: role.toUpperCase(),
      department: department || '',
      designation: designation || '',
      gender: gender || 'Other',
      joiningDate: joiningDate || new Date(),
      passwordHash: '12345',
      mustChangePassword: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      doctorDetails: isDoctor ? {
        specialization: department || 'General Medicine',
        licenseNumber: `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
        consultationFee: 100,
        roomNo: designation || 'Clinic 101',
        isAvailable: true
      } : undefined
    });

    return res.status(201).json({
      message: 'Employee registered successfully with default password (12345).',
      employee: newStaff
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create employee.', detail: err.message });
  }
});

// Toggle Staff Active / Deactivated Status (PATCH & POST & PUT handlers)
const toggleStaffStatus = async (req, res) => {
  const staffId = req.params.id || req.params.staffId;
  try {
    const user = await User.findOne({ _id: staffId, hospitalId: req.user.hospitalId });
    if (!user) {
      return res.status(404).json({ error: 'Hospital staff member not found.' });
    }

    const newStatus = typeof req.body.isActive === 'boolean' ? req.body.isActive : !user.isActive;
    user.isActive = newStatus;
    await user.save();

    return res.json({
      message: `Staff account ${user.fullName} is now ${user.isActive ? 'Active' : 'Deactivated'}.`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to toggle staff status.', detail: err.message });
  }
};

router.patch('/staff/:id/status', toggleStaffStatus);
router.patch('/staff/:staffId/status', toggleStaffStatus);
router.post('/staff/:id/status', toggleStaffStatus);
router.post('/staff/:staffId/status', toggleStaffStatus);
router.put('/staff/:id/status', toggleStaffStatus);
router.put('/staff/:staffId/status', toggleStaffStatus);

router.delete('/staff/:id', async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    return res.json({ message: 'Employee record deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete employee.', detail: err.message });
  }
});

router.put('/staff/:id', async (req, res) => {
  const { fullName, phone, department, designation, isActive } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: { fullName, phone, department, designation, isActive } },
      { new: true }
    );
    return res.json({ message: 'Staff profile updated.', user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update staff.', detail: err.message });
  }
});

router.post('/staff/:id/approve', async (req, res) => {
  const { action } = req.body; // APPROVED, REJECTED, SUSPENDED
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: { approvalStatus: action } },
      { new: true }
    );
    return res.json({ message: `Staff status updated to ${action}.`, user });
  } catch (err) {
    return res.status(500).json({ error: 'Status update failed.', detail: err.message });
  }
});

router.post('/staff/:id/reset-password', async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'New password is required.' });
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: { passwordHash: newPassword, mustChangePassword: true } },
      { new: true }
    );
    return res.json({ message: 'Password reset successfully. User must change password on next login.' });
  } catch (err) {
    return res.status(500).json({ error: 'Password reset failed.', detail: err.message });
  }
});

// ── 8. Equipment Management (CRUD) ──────────────────────────────────────────
router.get('/equipment', async (req, res) => {
  try {
    const { Equipment } = require('../models');
    const list = await Equipment.find({ hospitalId: req.user.hospitalId });
    return res.json({ equipment: list });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch equipment.', detail: err.message });
  }
});

router.post('/equipment', async (req, res) => {
  const { name, category, serialNumber, manufacturer, purchaseDate, warrantyYears, availableQuantity, inUseQuantity, damagedQuantity, maintenanceStatus } = req.body;
  try {
    const { Equipment } = require('../models');
    const item = await Equipment.create({
      hospitalId: req.user.hospitalId,
      name, category, serialNumber, manufacturer, purchaseDate, warrantyYears, availableQuantity, inUseQuantity, damagedQuantity, maintenanceStatus
    });
    return res.status(201).json({ message: 'Equipment added successfully.', equipment: item });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add equipment.', detail: err.message });
  }
});

router.put('/equipment/:id', async (req, res) => {
  try {
    const { Equipment } = require('../models');
    const item = await Equipment.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: req.body },
      { new: true }
    );
    return res.json({ message: 'Equipment updated successfully.', equipment: item });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update equipment.', detail: err.message });
  }
});

router.delete('/equipment/:id', async (req, res) => {
  try {
    const { Equipment } = require('../models');
    await Equipment.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    return res.json({ message: 'Equipment deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete equipment.', detail: err.message });
  }
});

// ── 9. Oxygen Cylinder Inventory (CRUD) ──────────────────────────────────────
router.get('/oxygen', async (req, res) => {
  try {
    const { OxygenInventory } = require('../models');
    const list = await OxygenInventory.find({ hospitalId: req.user.hospitalId });
    return res.json({ oxygen: list });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch oxygen cylinders.', detail: err.message });
  }
});

router.post('/oxygen', async (req, res) => {
  const { cylinderId, type, capacityLitres, status, supplierName, lastRefillDate } = req.body;
  try {
    const { OxygenInventory } = require('../models');
    const item = await OxygenInventory.create({
      hospitalId: req.user.hospitalId,
      cylinderId, type, capacityLitres, status, supplierName, lastRefillDate
    });
    return res.status(201).json({ message: 'Oxygen cylinder registered.', oxygen: item });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register cylinder.', detail: err.message });
  }
});

router.put('/oxygen/:id', async (req, res) => {
  try {
    const { OxygenInventory } = require('../models');
    const item = await OxygenInventory.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: req.body },
      { new: true }
    );
    return res.json({ message: 'Cylinder updated successfully.', oxygen: item });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update cylinder.', detail: err.message });
  }
});

router.delete('/oxygen/:id', async (req, res) => {
  try {
    const { OxygenInventory } = require('../models');
    await OxygenInventory.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    return res.json({ message: 'Cylinder deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete cylinder.', detail: err.message });
  }
});

// ── 10. Room Management CRUD ───────────────────────────────────────────────
router.get('/rooms', async (req, res) => {
  try {
    const list = await InventoryRoom.find({ hospitalId: req.user.hospitalId });
    return res.json({ rooms: list });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch rooms.', detail: err.message });
  }
});

router.post('/rooms', async (req, res) => {
  const { roomNumber, roomType, dailyRate, floor } = req.body;
  try {
    const item = await InventoryRoom.create({
      hospitalId: req.user.hospitalId,
      roomNumber, roomType, dailyRate, floor
    });
    return res.status(201).json({ message: 'Room added successfully.', room: item });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add room.', detail: err.message });
  }
});

router.put('/rooms/:id', async (req, res) => {
  try {
    const item = await InventoryRoom.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { $set: req.body },
      { new: true }
    );
    return res.json({ message: 'Room updated successfully.', room: item });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update room.', detail: err.message });
  }
});

router.delete('/rooms/:id', async (req, res) => {
  try {
    await InventoryRoom.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    return res.json({ message: 'Room deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete room.', detail: err.message });
  }
});

module.exports = router;
