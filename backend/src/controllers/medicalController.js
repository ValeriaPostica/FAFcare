import { query } from '../config/db.js';

export async function records(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT id, patient_id, diagnosis, notes, recommendations, created_at
      FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC
    `, [req.params.patientId]);
    res.json(rows);
  } catch (error) { next(error); }
}
