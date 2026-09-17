import { query } from '../config/db.js';

export async function logPatientAccess({ user, patientId, actionType, reason }) {
  if (user?.role?.toLowerCase() !== 'doctor') return;

  await query(`
    INSERT INTO patient_access_logs (doctor_id, patient_id, action_type, reason)
    SELECT $1, $2, $3, $4
    WHERE EXISTS (SELECT 1 FROM patients WHERE id = $2)
  `, [user.doctorId, patientId, actionType, reason]);
}