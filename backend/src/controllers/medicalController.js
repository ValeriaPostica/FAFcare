import { query } from '../config/db.js';
import { logPatientAccess } from '../helpers/accessLog.js';

export async function patientProfile(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT p.id, p.full_name, p.birth_date, p.gender, p.address,
             p.insurance_type, p.blood_type, p.allergies, p.chronic_conditions,
             p.emergency_contact_name, p.emergency_contact_phone,
             u.email, u.phone
      FROM patients p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = $1
    `, [req.params.patientId]);

    if (!rows[0]) return res.status(404).json({ error: 'Patient not found' });

    await logPatientAccess({
      user: req.user,
      patientId: req.params.patientId,
      actionType: 'VIEW_PATIENT_PROFILE',
      reason: 'Viewed patient profile',
    });
    res.json(rows[0]);
  } catch (error) { next(error); }
}

export async function records(req, res, next) {
  try {
    const { rows } = await query(`
            SELECT mr.id, mr.patient_id, mr.diagnosis, mr.diagnosis_type, mr.notes, mr.recommendations, mr.created_at,
              mr.is_verified, mr.verified_by_doctor_id, mr.digital_signature_hash,
              u.full_name AS verified_by_doctor, s.name AS doctor_specialty
            FROM medical_records mr
            LEFT JOIN doctors d ON d.id = mr.verified_by_doctor_id
            LEFT JOIN users u ON u.id = d.user_id
            LEFT JOIN specialties s ON s.id = d.specialty_id
            WHERE mr.patient_id = $1 ORDER BY mr.created_at DESC
    `, [req.params.patientId]);
    await logPatientAccess({
      user: req.user,
      patientId: req.params.patientId,
      actionType: 'VIEW_MEDICAL_RECORDS',
      reason: 'Viewed patient medical records',
    });
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
         SELECT mr.id, mr.diagnosis, mr.diagnosis_type, mr.notes, mr.recommendations, mr.created_at,
               mr.is_verified, mr.digital_signature_hash,
               u.full_name AS verified_by_doctor,
           s.name AS doctor_specialty
        FROM medical_records mr
        LEFT JOIN doctors d ON d.id = mr.verified_by_doctor_id
        LEFT JOIN users u ON u.id = d.user_id
         LEFT JOIN specialties s ON s.id = d.specialty_id
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
    await logPatientAccess({
      user: req.user,
      patientId,
      actionType: 'VIEW_MEDICAL_BOOKLET',
      reason: 'Viewed patient medical booklet',
    });
    res.json({
      patient: patientResult.rows[0],
      verified_records: recordsResult.rows,
      active_prescriptions: prescriptionsResult.rows,
    });
  } catch (error) { next(error); }
}

export async function auditLogs(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT pal.id, pal.patient_id, pal.doctor_id, pal.accessed_at,
             pal.action_type, pal.reason,
             u.full_name AS doctor_name,
             s.name AS specialty
      FROM patient_access_logs pal
      JOIN doctors d ON d.id = pal.doctor_id
      JOIN users u ON u.id = d.user_id
      LEFT JOIN specialties s ON s.id = d.specialty_id
      WHERE pal.patient_id = $1
      ORDER BY pal.accessed_at DESC
    `, [req.user.patientId]);
    res.json(rows);
  } catch (error) { next(error); }
}

export async function createPrescription(req, res, next) {
  try {
    const { patient_id, doctor_id, medication_name, dosage_instructions, duration_days } = req.body;
    if (!patient_id || !medication_name || !dosage_instructions) {
      return res.status(400).json({ error: 'patient_id, medication_name and dosage_instructions are required' });
    }
    if (doctor_id && doctor_id !== req.user.doctorId) {
      return res.status(403).json({ error: 'Doctors can create prescriptions only as themselves' });
    }

    const { rows } = await query(`
      INSERT INTO prescriptions
        (patient_id, doctor_id, medication_name, dosage_instructions, duration_days)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, patient_id, doctor_id, medication_name, dosage_instructions,
                duration_days, status, issued_at
    `, [patient_id, req.user.doctorId, medication_name, dosage_instructions, duration_days || null]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
}

export async function createMedicalRecord(req, res, next) {
  try {
    const { patient_id, doctor_id, diagnosis, diagnosis_type, notes, recommendations } = req.body;
    if (!patient_id || !diagnosis) {
      return res.status(400).json({ error: 'patient_id and diagnosis are required' });
    }
    if (doctor_id && doctor_id !== req.user.doctorId) {
      return res.status(403).json({ error: 'Doctors can create records only as themselves' });
    }

    const { rows } = await query(`
      INSERT INTO medical_records
        (patient_id, diagnosis, diagnosis_type, notes, recommendations, is_verified, verified_by_doctor_id)
      VALUES ($1, $2, COALESCE($3, 'other'), $4, $5, TRUE, $6)
      RETURNING id, patient_id, diagnosis, diagnosis_type, notes, recommendations, created_at,
                is_verified, verified_by_doctor_id
    `, [patient_id, diagnosis, diagnosis_type || 'other', notes || null, recommendations || null, req.user.doctorId]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
}

export async function updateMedicalRecordRecommendations(req, res, next) {
  try {
    const { recommendations = '' } = req.body;
    const { rows } = await query(`
      UPDATE medical_records
      SET recommendations = $1
      WHERE id = $2 AND verified_by_doctor_id = $3
      RETURNING id, patient_id, diagnosis, diagnosis_type, notes, recommendations,
                created_at, is_verified, verified_by_doctor_id
    `, [recommendations || null, req.params.recordId, req.user.doctorId]);

    if (!rows[0]) return res.status(404).json({ error: 'Medical record not found for this doctor' });
    res.json(rows[0]);
  } catch (error) { next(error); }
}
