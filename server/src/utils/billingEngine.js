/**
 * Pharmacy & Comprehensive Billing Calculation Engine
 * Computes Consultant fees, Room day charges, Machinery usage, Medicine itemization, and tiered GST breakdown.
 */
function calculateInvoice({
  consultantFee = 0,
  roomDays = 0,
  roomDailyRate = 0,
  machineryHours = 0,
  machineryHourlyRate = 0,
  prescriptionItems = []
}) {
  const totalConsultantFee = Number(consultantFee) || 0;
  const totalRoomCharge = (Number(roomDays) || 0) * (Number(roomDailyRate) || 0);
  const totalMachineryCharge = (Number(machineryHours) || 0) * (Number(machineryHourlyRate) || 0);

  let medicineSubtotal = 0;
  let gst5PercentAmount = 0;
  let gst12PercentAmount = 0;
  let gst18PercentAmount = 0;

  const itemizedMedicines = prescriptionItems.map((item) => {
    const qty = Number(item.quantityRequired) || 1;
    const price = Number(item.unitPrice) || 0;
    const gstRate = Number(item.gstRatePercentage) || 5;
    const itemSubtotal = qty * price;
    const itemGst = itemSubtotal * (gstRate / 100);

    medicineSubtotal += itemSubtotal;

    if (gstRate === 5) {
      gst5PercentAmount += itemGst;
    } else if (gstRate === 12) {
      gst12PercentAmount += itemGst;
    } else if (gstRate === 18) {
      gst18PercentAmount += itemGst;
    }

    return {
      medicineName: item.medicineName,
      dosage: item.dosage,
      quantity: qty,
      unitPrice: price,
      subtotal: itemSubtotal.toFixed(2),
      gstRate: `${gstRate}%`,
      gstAmount: itemGst.toFixed(2)
    };
  });

  const totalGst = gst5PercentAmount + gst12PercentAmount + gst18PercentAmount;
  const subtotalBeforeTax = totalConsultantFee + totalRoomCharge + totalMachineryCharge + medicineSubtotal;
  const totalAmount = subtotalBeforeTax + totalGst;

  return {
    consultantFee: totalConsultantFee.toFixed(2),
    roomChargeTotal: totalRoomCharge.toFixed(2),
    machineryChargeTotal: totalMachineryCharge.toFixed(2),
    medicineSubtotal: medicineSubtotal.toFixed(2),
    itemizedMedicines,
    gstBreakdown: {
      gst5PercentAmount: gst5PercentAmount.toFixed(2),
      gst12PercentAmount: gst12PercentAmount.toFixed(2),
      gst18PercentAmount: gst18PercentAmount.toFixed(2),
      totalGst: totalGst.toFixed(2)
    },
    subtotalBeforeTax: subtotalBeforeTax.toFixed(2),
    totalAmount: totalAmount.toFixed(2)
  };
}

module.exports = { calculateInvoice };
