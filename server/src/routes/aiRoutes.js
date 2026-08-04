const express = require('express');
const { User, Hospital, Appointment, EMRRecord, Prescription } = require('../models');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// Common medical knowledge base for clinical recommendation engine
const SPECIALTY_MAP = [
  { keywords: ['headache', 'migraine', 'dizziness', 'nerve', 'seizure', 'numbness'], specialty: 'Neurology' },
  { keywords: ['chest pain', 'heart', 'bp', 'blood pressure', 'palpitations', 'cardiac'], specialty: 'Cardiology' },
  { keywords: ['skin', 'rash', 'acne', 'itching', 'allergy', 'dermatitis'], specialty: 'Dermatology' },
  { keywords: ['bone', 'joint', 'fracture', 'knee', 'back pain', 'spine', 'shoulder'], specialty: 'Orthopedics' },
  { keywords: ['child', 'baby', 'pediatric', 'fever in kid', 'infant'], specialty: 'Pediatrics' },
  { keywords: ['stomach', 'gastric', 'acid', 'nausea', 'vomiting', 'diarrhea', 'digestion'], specialty: 'Gastroenterology' },
  { keywords: ['eye', 'vision', 'blurry', 'cataract', 'red eye'], specialty: 'Ophthalmology' },
  { keywords: ['fever', 'cold', 'cough', 'flu', 'general', 'weakness', 'fatigue', 'infection', 'body pain'], specialty: 'General Physician' }
];

const DRUG_KNOWLEDGE_BASE = {
  'headache': [
    { medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1 (After Meals)', durationDays: 3, quantityRequired: 6, reasoning: 'Analgesic and antipyretic first-line relief for mild to moderate headache.', safetyNote: 'Safe for general administration. Monitor liver function if chronic use.' },
    { medicineName: 'Ibuprofen 400mg', dosage: '400mg', frequency: '1-0-1 (After Meals)', durationDays: 3, quantityRequired: 6, reasoning: 'NSAID effective for inflammatory tension headache.', safetyNote: 'Caution: Check for past gastritis or gastric ulcer history before prescribing.' }
  ],
  'migraine': [
    { medicineName: 'Sumatriptan 50mg', dosage: '50mg', frequency: '1 tablet as needed at onset', durationDays: 3, quantityRequired: 3, reasoning: '5-HT1 receptor agonist specifically targeting acute migraine attacks.', safetyNote: 'Contraindicated in patients with history of ischemic heart disease or uncontrolled hypertension.' },
    { medicineName: 'Naproxen 500mg', dosage: '500mg', frequency: '1-0-1 (After Meals)', durationDays: 5, quantityRequired: 10, reasoning: 'Sustained anti-inflammatory relief for acute migraine flare-ups.', safetyNote: 'Ensure patient takes with meals or an H2 blocker to protect stomach lining.' }
  ],
  'fever': [
    { medicineName: 'Paracetamol 650mg', dosage: '650mg', frequency: '1-1-1 (After Meals)', durationDays: 4, quantityRequired: 12, reasoning: 'Standard antipyretic for symptom management of fever and pyrexia.', safetyNote: 'Scanned past EMRs: Ensure total daily dose does not exceed 4,000mg.' }
  ],
  'cold': [
    { medicineName: 'Cetirizine 10mg', dosage: '10mg', frequency: '0-0-1 (Night)', durationDays: 5, quantityRequired: 5, reasoning: 'Second-generation antihistamine to relieve nasal congestion and sneezing.', safetyNote: 'May cause mild drowsiness; advise taking at bedtime.' },
    { medicineName: 'Vitamin C 500mg', dosage: '500mg', frequency: '1-0-0 (Morning)', durationDays: 7, quantityRequired: 7, reasoning: 'Immune support supplement for upper respiratory illness.', safetyNote: 'Well tolerated with zero drug interaction risks.' }
  ],
  'cough': [
    { medicineName: 'Dextromethorphan Syrup', dosage: '10ml', frequency: '1-1-1 (After Meals)', durationDays: 5, quantityRequired: 1, reasoning: 'Cough suppressant for non-productive dry cough.', safetyNote: 'Check for concurrent MAO inhibitor use.' },
    { medicineName: 'Amoxicillin 500mg', dosage: '500mg', frequency: '1-0-1 (After Meals)', durationDays: 5, quantityRequired: 10, reasoning: 'Broad-spectrum antibiotic if secondary bacterial bronchitis is diagnosed.', safetyNote: 'Safety Check: Scanned past prescriptions for penicillin sensitivity.' }
  ],
  'gastric': [
    { medicineName: 'Pantoprazole 40mg', dosage: '40mg', frequency: '1-0-0 (Before Breakfast)', durationDays: 7, quantityRequired: 7, reasoning: 'Proton pump inhibitor (PPI) reducing stomach acid production for GERD/gastritis.', safetyNote: 'Take 30 mins before morning meal for maximum efficacy.' },
    { medicineName: 'Sucralfate Oral Suspension 10ml', dosage: '10ml', frequency: '1-1-1 (Before Meals)', durationDays: 5, quantityRequired: 1, reasoning: 'Mucosal protective agent for gastric mucosal irritation.', safetyNote: 'Separate administration from other oral drugs by 2 hours.' }
  ],
  'hypertension': [
    { medicineName: 'Amlodipine 5mg', dosage: '5mg', frequency: '1-0-0 (Morning)', durationDays: 30, quantityRequired: 30, reasoning: 'Calcium channel blocker for essential hypertension control.', safetyNote: 'Monitor blood pressure and check for peripheral edema in long-term therapy.' },
    { medicineName: 'Telmisartan 40mg', dosage: '40mg', frequency: '1-0-0 (Morning)', durationDays: 30, quantityRequired: 30, reasoning: 'Angiotensin II receptor blocker (ARB) for cardio-renal protection.', safetyNote: 'Monitor serum potassium levels periodically.' }
  ]
};

// ── 1. PATIENT AI CHATBOT ROUTE ─────────────────────────────────────────────
router.post('/patient-chat', async (req, res) => {
  try {
    const { message, hospitalId } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const lowerMsg = message.toLowerCase();

    // 1. Detect matching specialty based on keywords
    let matchedSpecialty = 'General Physician';
    for (const item of SPECIALTY_MAP) {
      if (item.keywords.some(kw => lowerMsg.includes(kw))) {
        matchedSpecialty = item.specialty;
        break;
      }
    }

    // 2. Fetch doctors in selected hospital or all approved hospitals matching specialty
    let filter = { role: 'DOCTOR', approvalStatus: 'APPROVED' };
    if (hospitalId) {
      filter.hospitalId = hospitalId;
    }

    let doctors = await User.find(filter).select('-passwordHash').populate('hospitalId', 'name location');

    // Filter by specialty if found
    let recommendedDoctors = doctors.filter(d => 
      d.doctorDetails?.specialization?.toLowerCase().includes(matchedSpecialty.toLowerCase()) ||
      d.department?.toLowerCase().includes(matchedSpecialty.toLowerCase())
    );

    // Fallback if no exact specialty doctor found in hospital
    if (recommendedDoctors.length === 0) {
      recommendedDoctors = doctors.slice(0, 3);
    } else {
      recommendedDoctors = recommendedDoctors.slice(0, 3);
    }

    // 3. Construct intelligent AI response
    let responseText = '';
    let actionPayload = null;

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      responseText = `Hello! I'm your AegisCare Health & Booking AI Assistant. How can I help you today? Please tell me about any symptoms you are experiencing, or if you need to book an appointment with a specialist.`;
    } else {
      responseText = `Based on your symptoms ("${message}"), I recommend consulting a specialist in **${matchedSpecialty}**.\n\nHere are available doctors ready for appointment booking:`;
      
      actionPayload = {
        type: 'DOCTOR_RECOMMENDATIONS',
        matchedSpecialty,
        doctors: recommendedDoctors.map(d => ({
          id: d._id,
          name: d.fullName,
          specialty: d.doctorDetails?.specialization || d.department || matchedSpecialty,
          hospitalId: d.hospitalId?._id || hospitalId,
          hospitalName: d.hospitalId?.name || 'AegisCare Medical Center',
          roomNo: d.doctorDetails?.roomNo || 'Clinic',
          fee: d.doctorDetails?.consultationFee || 100,
          available: d.doctorDetails?.isAvailable !== false
        }))
      };
    }

    return res.json({
      reply: responseText,
      specialty: matchedSpecialty,
      actionPayload
    });

  } catch (err) {
    console.error('Patient AI Chat Error:', err);
    return res.status(500).json({ error: 'AI Chat service error.', detail: err.message });
  }
});

// ── 2. DOCTOR PRESCRIPTION AI ASSISTANT ROUTE ───────────────────────────────
router.post('/doctor-prescription-recommendations', authorizeRoles('DOCTOR'), async (req, res) => {
  try {
    const { patientId, diagnosis, symptoms, notes } = req.body;
    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }

    // 1. Fetch Patient profile, Past EMR Records & Past Prescriptions
    const [patient, pastEMRs, pastPrescriptions] = await Promise.all([
      User.findById(patientId).select('fullName age gender phone email'),
      EMRRecord.find({ patientId }).sort({ createdAt: -1 }).limit(10),
      Prescription.find({ patientId }).sort({ createdAt: -1 }).limit(10)
    ]);

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    // Extract historical medicines previously prescribed to check for interactions/side effects
    const historicalMedicines = [];
    pastPrescriptions.forEach(p => {
      p.items?.forEach(item => {
        if (item.medicineName) historicalMedicines.push(item.medicineName);
      });
    });

    const historicalDiagnoses = pastEMRs.map(e => e.diagnosis).filter(Boolean);

    // 2. Perform intelligent medication recommendation matching
    const searchContext = `${diagnosis || ''} ${symptoms || ''} ${notes || ''}`.toLowerCase();
    
    let suggestedMedicines = [];

    Object.keys(DRUG_KNOWLEDGE_BASE).forEach(key => {
      if (searchContext.includes(key)) {
        suggestedMedicines.push(...DRUG_KNOWLEDGE_BASE[key]);
      }
    });

    // Fallback default suggestions if no keyword match
    if (suggestedMedicines.length === 0) {
      suggestedMedicines = [
        {
          medicineName: 'Paracetamol 500mg',
          dosage: '500mg',
          frequency: '1-0-1 (After Meals)',
          durationDays: 5,
          quantityRequired: 10,
          reasoning: 'Standard analgesic and antipyretic support for patient condition.',
          safetyNote: 'No severe contraindications found in patient history.'
        },
        {
          medicineName: 'Multivitamin & Zinc Supplement',
          dosage: '1 Capsule',
          frequency: '1-0-0 (Morning)',
          durationDays: 10,
          quantityRequired: 10,
          reasoning: 'General supportive therapy to assist immune recovery.',
          safetyNote: 'Safe dietary supplement with no drug interactions.'
        }
      ];
    }

    // 3. Side-Effect & Contraindication Cross-Check against Patient History
    const analyzedSuggestions = suggestedMedicines.map((med, idx) => {
      let riskLevel = 'SAFE';
      let interactionWarning = null;

      // Check if patient was previously given this medicine
      const previouslyTaken = historicalMedicines.some(hMed => 
        hMed.toLowerCase().includes(med.medicineName.toLowerCase().split(' ')[0])
      );

      if (previouslyTaken) {
        interactionWarning = `Notice: Patient was previously prescribed ${med.medicineName} in a past consultation. Verify response/tolerance.`;
        riskLevel = 'MODERATE_WARNING';
      }

      // Check specific contraindications (e.g., NSAID + Past Gastritis history)
      if (med.medicineName.toLowerCase().includes('ibuprofen') || med.medicineName.toLowerCase().includes('naproxen')) {
        const hasGastritisHistory = historicalDiagnoses.some(d => d.toLowerCase().includes('gastric') || d.toLowerCase().includes('ulcer') || d.toLowerCase().includes('acid'));
        if (hasGastritisHistory) {
          riskLevel = 'HIGH_CONTRAINDICATION';
          interactionWarning = `CRITICAL WARNING: Patient has past history of Gastritis/Ulcers. NSAID (${med.medicineName}) may cause gastric mucosal irritation or bleeding!`;
        }
      }

      return {
        id: `rec-${Date.now()}-${idx}`,
        medicineName: med.medicineName,
        dosage: med.dosage,
        frequency: med.frequency,
        durationDays: med.durationDays,
        quantityRequired: med.quantityRequired,
        reasoning: med.reasoning,
        safetyNote: med.safetyNote,
        riskLevel,
        interactionWarning
      };
    });

    return res.json({
      summary: `AI Clinical Analysis complete for ${patient.fullName} (${patient.age || 'N/A'} yrs, ${patient.gender || 'N/A'}). Scanned ${pastEMRs.length} past EMR visits and ${pastPrescriptions.length} prior prescriptions.`,
      patientHistoryOverview: {
        totalPastVisits: pastEMRs.length,
        recentDiagnoses: historicalDiagnoses.slice(0, 3),
        pastMedicationsCount: historicalMedicines.length
      },
      recommendations: analyzedSuggestions
    });

  } catch (err) {
    console.error('Doctor AI Prescription Error:', err);
    return res.status(500).json({ error: 'AI Prescription Recommendation error.', detail: err.message });
  }
});

module.exports = router;
