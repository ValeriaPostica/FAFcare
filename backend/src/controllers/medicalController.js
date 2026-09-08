import { query } from '../config/db.js';

export async function records(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT id, patient_id, diagnosis, notes, recommendations, created_at,
             is_verified, verified_by_doctor_id, digital_signature_hash
      FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC
    `, [req.params.patientId]);
    res.json(rows);
  } catch (error) { next(error); }
}

export async function booklet(req, res, next) {
  try {
    const patientId = req.params.patientId;
    const [patientResult, recordsResult, prescriptionsResult] = await Promise.all([
      query(`
         SELECT p.id, u.full_name AS full_name,
           p.birth_date, p.gender, p.address, p.insurance_type,
               p.blood_type, p.allergies, p.chronic_conditions,
               p.emergency_contact_name, p.emergency_contact_phone,
               u.email, u.phone
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
      `, [patientId]),
      query(`
        SELECT mr.id, mr.diagnosis, mr.notes, mr.recommendations, mr.created_at,
               mr.is_verified, mr.digital_signature_hash,
               u.full_name AS verified_by_doctor
        FROM medical_records mr
        LEFT JOIN doctors d ON d.id = mr.verified_by_doctor_id
        LEFT JOIN users u ON u.id = d.user_id
        WHERE mr.patient_id = $1 AND mr.is_verified = TRUE
        ORDER BY mr.created_at DESC
      `, [patientId]),
      query(`
        SELECT pr.id, pr.medication_name, pr.dosage_instructions,
               pr.duration_days, pr.status, pr.issued_at,
               u.full_name AS doctor_name
        FROM prescriptions pr
        JOIN doctors d ON d.id = pr.doctor_id
        JOIN users u ON u.id = d.user_id
        WHERE pr.patient_id = $1 AND pr.status = 'active'
        ORDER BY pr.issued_at DESC
      `, [patientId]),
    ]);

    if (!patientResult.rows[0]) return res.status(404).json({ error: 'Patient not found' });
    res.json({
      patient: patientResult.rows[0],
      verified_records: recordsResult.rows,
      active_prescriptions: prescriptionsResult.rows,
    });
  } catch (error) { next(error); }
}

export async function createPrescription(req, res, next) {
  try {
    const { patient_id, doctor_id, medication_name, dosage_instructions, duration_days } = req.body;
    if (!patient_id || !doctor_id || !medication_name || !dosage_instructions) {
      return res.status(400).json({ error: 'patient_id, doctor_id, medication_name and dosage_instructions are required' });
    }

    const { rows } = await query(`
      INSERT INTO prescriptions
        (patient_id, doctor_id, medication_name, dosage_instructions, duration_days)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, patient_id, doctor_id, medication_name, dosage_instructions,
                duration_days, status, issued_at
    `, [patient_id, doctor_id, medication_name, dosage_instructions, duration_days || null]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
}

export async function createMedicalRecord(req, res, next) {
  try {
    const { patient_id, doctor_id, diagnosis, notes, recommendations } = req.body;
    if (!patient_id || !diagnosis) {
      return res.status(400).json({ error: 'patient_id and diagnosis are required' });
    }

    const { rows } = await query(`
      INSERT INTO medical_records
        (patient_id, diagnosis, notes, recommendations, is_verified, verified_by_doctor_id)
      VALUES ($1, $2, $3, $4, TRUE, $5)
      RETURNING id, patient_id, diagnosis, notes, recommendations, created_at,
                is_verified, verified_by_doctor_id
    `, [patient_id, diagnosis, notes || null, recommendations || null, doctor_id || null]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
}
