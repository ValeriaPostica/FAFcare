import { query } from '../config/db.js';

export async function specialties(req, res, next) {
  try {
    const { rows } = await query('SELECT id, name, description AS desc FROM specialties ORDER BY name');
    res.json(rows);
  } catch (error) { next(error); }
}

export async function doctors(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT d.id, u.full_name AS name, s.name AS spec, s.id AS spec_id,
             d.experience_years, d.price_per_consultation
      FROM doctors d JOIN users u ON u.id = d.user_id
      LEFT JOIN specialties s ON s.id = d.specialty_id
      WHERE u.is_active = TRUE AND ($1::int IS NULL OR d.specialty_id = $1)
      ORDER BY u.full_name
    `, [req.query.specialty_id || null]);
    res.json(rows.map((row) => ({ ...row, experience: `${row.experience_years} years`, location: 'FAFCare clinic' })));
  } catch (error) { next(error); }
}

export async function schedules(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT id, doctor_id, date, start_time, end_time
      FROM doctor_schedules WHERE doctor_id = $1 AND is_available = TRUE ORDER BY date, start_time
    `, [req.params.doctorId]);
    res.json(rows);
  } catch (error) { next(error); }
}
