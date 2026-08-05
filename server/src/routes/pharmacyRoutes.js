const express = require('express');
const { Prescription, PharmacyItem, Appointment, User, InventoryRoom, Invoice, Hospital } = require('../models');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { calculateInvoice } = require('../utils/billingEngine');

const router = express.Router();
router.use(verifyToken);
router.use(authorizeRoles('PHARMACY', 'HOSPITAL_ADMIN'));

// ── 1. Pending Prescriptions Auto-delivered from Doctor ────────────────────
router.get('/prescriptions/pending', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  try {
    // IMPORTANT SECURITY REQUIREMENT: Pharmacy MUST NEVER receive prescriptions before doctor approval!
    const prescriptions = await Prescription.find({ 
      hospitalId, 
      dispenseStatus: 'PENDING',
      approvalStatus: { $ne: 'DRAFT' } // Only APPROVED prescriptions visible to pharmacy
    }).sort({ createdAt: -1 });
    return res.json({ prescriptions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch prescriptions.', detail: err.message });
  }
});

// ── 2. Medicine Inventory ──────────────────────────────────────────────────
router.get('/inventory', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  try {
    const inventory = await PharmacyItem.find({ hospitalId }).sort({ name: 1 });
    return res.json({ inventory });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch inventory.', detail: err.message });
  }
});

// ── 3. Add New Medicine to Inventory ──────────────────────────────────────
router.post('/inventory/add', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  const { name, genericName, batchNumber, stockQuantity, reorderLevel, unitPrice, gstRatePercentage, expiryDate, category } = req.body;

  try {
    const item = await PharmacyItem.create({
      hospitalId,
      name,
      genericName:       genericName       || '',
      batchNumber:       batchNumber       || `BATCH-${Date.now()}`,
      stockQuantity:     Number(stockQuantity) || 0,
      reorderLevel:      Number(reorderLevel)  || 20,
      unitPrice:         Number(unitPrice)      || 0,
      gstRatePercentage: Number(gstRatePercentage) || 5,
      expiryDate:        expiryDate        || new Date('2028-12-31'),
      category:          category          || 'TABLET'
    });
    return res.status(201).json({ message: 'Medicine added to pharmacy inventory.', item });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add medicine.', detail: err.message });
  }
});

// ── 3.5 Fetch Current Pharmacy's Hospital Details ─────────────────────────
router.get('/hospital-details', async (req, res) => {
  const hospitalId = req.user.hospitalId;
  try {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital record not found.' });
    return res.json({ hospital });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch hospital details.', detail: err.message });
  }
});

// ── 4. Restock Medicine ────────────────────────────────────────────────────
router.post('/inventory/update-stock', async (req, res) => {
  const { medicineId, addQuantity } = req.body;
  const hospitalId = req.user.hospitalId;
  try {
    const item = await PharmacyItem.findOneAndUpdate(
      { _id: medicineId, hospitalId },
      { $inc: { stockQuantity: Number(addQuantity) || 0 } },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Medicine not found.' });
    return res.json({ message: 'Stock quantity updated.', item });
  } catch (err) {
    return res.status(500).json({ error: 'Stock update failed.', detail: err.message });
  }
});

// ── 5. Bill Preview ────────────────────────────────────────────────────────
router.post('/calculate-bill-preview', async (req, res) => {
  const { appointmentId, roomDays = 1, machineryHours = 0 } = req.body;
  const hospitalId = req.user.hospitalId;

  try {
    const [appointment, prescription] = await Promise.all([
      Appointment.findOne({ _id: appointmentId, hospitalId }),
      Prescription.findOne({ appointmentId, hospitalId })
    ]);

    if (!appointment) return res.status(404).json({ error: 'Appointment not found for this facility.' });

    const [doctor, room] = await Promise.all([
      User.findOne({ _id: appointment.doctorId, hospitalId }).select('doctorDetails'),
      InventoryRoom.findOne({ currentPatientId: appointment.patientId, hospitalId })
    ]);

    const consultantFee    = doctor?.doctorDetails?.consultationFee || 100;
    const roomDailyRate    = room?.dailyRate || 0;
    const prescriptionItems = prescription?.items || [];

    const preview = calculateInvoice({
      consultantFee,
      roomDays:        Number(roomDays),
      roomDailyRate,
      machineryHours:  Number(machineryHours),
      machineryHourlyRate: 15,
      prescriptionItems
    });

    return res.json({ preview, appointment, prescription });
  } catch (err) {
    return res.status(500).json({ error: 'Bill calculation failed.', detail: err.message });
  }
});

// ── 6. Checkout: Collect Payment → Deplete Stock → Lock EMR ───────────────
const checkoutHandler = async (req, res) => {
  const { appointmentId, paymentMethod = 'CARD', roomDays = 1, machineryHours = 0 } = req.body;
  const hospitalId = req.user.hospitalId;

  try {
    const [appointment, prescription] = await Promise.all([
      Appointment.findOne({ _id: appointmentId, hospitalId }),
      Prescription.findOne({ appointmentId, hospitalId })
    ]);

    if (!appointment) return res.status(404).json({ error: 'Appointment not found for this facility.' });

    const [doctor, room] = await Promise.all([
      User.findOne({ _id: appointment.doctorId, hospitalId }).select('doctorDetails'),
      InventoryRoom.findOne({ currentPatientId: appointment.patientId, hospitalId })
    ]);

    const consultantFee    = doctor?.doctorDetails?.consultationFee || 100;
    const roomDailyRate    = room?.dailyRate || 0;
    const prescriptionItems = prescription?.items || [];

    const invoiceCalc = calculateInvoice({
      consultantFee,
      roomDays:        Number(roomDays),
      roomDailyRate,
      machineryHours:  Number(machineryHours),
      machineryHourlyRate: 15,
      prescriptionItems
    });

    // Deplete medicine stock for each item
    const stockOps = prescriptionItems.map(async (item) => {
      const query = item.medicineId
        ? { _id: item.medicineId, hospitalId }
        : { name: new RegExp('^' + item.medicineName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i'), hospitalId };
      
      const dbMed = await PharmacyItem.findOne(query);
      if (dbMed) {
        const newQty = Math.max(0, dbMed.stockQuantity - item.quantityRequired);
        dbMed.stockQuantity = newQty;
        await dbMed.save();
      }
    });
    await Promise.all(stockOps);

    // Mark prescription DISPENSED
    if (prescription) {
      prescription.dispenseStatus = 'DISPENSED';
      await prescription.save();
    }

    // Transition appointment → PAID (locks EMR access)
    appointment.status = 'PAID';
    appointment.activeWindowEndedAt = new Date();
    await appointment.save();

    // Free the room
    if (room) {
      room.isOccupied = false;
      room.currentPatientId = null;
      await room.save();
    }

    // Create final invoice
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice = await Invoice.create({
      invoiceNumber,
      appointmentId,
      patientId:   appointment.patientId,
      patientName: appointment.patientName,
      hospitalId,
      breakdown: {
        consultantFee:        Number(invoiceCalc.consultantFee),
        roomChargeTotal:      Number(invoiceCalc.roomChargeTotal),
        machineryChargeTotal: Number(invoiceCalc.machineryChargeTotal),
        medicineSubtotal:     Number(invoiceCalc.medicineSubtotal),
        gstBreakdown: {
          gst5PercentAmount:  Number(invoiceCalc.gstBreakdown.gst5PercentAmount),
          gst12PercentAmount: Number(invoiceCalc.gstBreakdown.gst12PercentAmount),
          gst18PercentAmount: Number(invoiceCalc.gstBreakdown.gst18PercentAmount),
          totalGst:           Number(invoiceCalc.gstBreakdown.totalGst)
        },
        subtotalBeforeTax: Number(invoiceCalc.subtotalBeforeTax),
        totalAmount:       Number(invoiceCalc.totalAmount)
      },
      paymentStatus: 'PAID',
      paymentMethod,
      paidAt: new Date()
    });

    return res.json({
      message: '✅ Payment collected. Stock depleted. EMR Access is now LOCKED.',
      invoice:              newInvoice,
      appointmentDeactivated: true
    });
  } catch (err) {
    return res.status(500).json({ error: 'Checkout failed.', detail: err.message });
  }
};

router.post('/checkout', checkoutHandler);
router.post('/checkout-invoice', checkoutHandler);

module.exports = router;
