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
             d.experience_years, d.price_per_consultation,
             d.rating_average, d.rating_count
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

export async function createDoctorReview(req, res, next) {
  try {
    const { appointment_id, rating, comment } = req.body;
    const { rows: appointmentRows } = await query(`
      SELECT id, doctor_id, patient_id, status
      FROM appointments
      WHERE id = $1 AND doctor_id = $2 AND patient_id = $3
    `, [appointment_id, req.params.doctorId, req.user.patientId]);

    const appointment = appointmentRows[0];
    if (!appointment) return res.status(404).json({ error: 'Completed appointment not found for this doctor' });
    const { rows: recordRows } = await query(`
      SELECT 1 FROM medical_records
      WHERE patient_id = $1 AND verified_by_doctor_id = $2 AND created_at >= (
        SELECT scheduled_at FROM appointments WHERE id = $3
      )
      LIMIT 1
    `, [appointment.patient_id, appointment.doctor_id, appointment.id]);
    if (appointment.status !== 'completed' && !recordRows[0]) {
      return res.status(409).json({ error: 'A review can be added only after a completed consultation' });
    }

    const { rows } = await query(`
      INSERT INTO doctor_reviews (doctor_id, patient_id, appointment_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, doctor_id, patient_id, appointment_id, rating, comment, created_at
    `, [appointment.doctor_id, appointment.patient_id, appointment.id, rating, comment || null]);

    await query(`
      UPDATE doctors d
      SET rating_average = stats.average_rating, rating_count = stats.review_count
      FROM (
        SELECT doctor_id, ROUND(AVG(rating)::numeric, 2) AS average_rating, COUNT(*)::int AS review_count
        FROM doctor_reviews WHERE doctor_id = $1 GROUP BY doctor_id
      ) stats
      WHERE d.id = stats.doctor_id
    `, [appointment.doctor_id]);

    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
}

export async function doctorReviews(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT dr.id, dr.rating, dr.comment, dr.created_at,
             pu.full_name AS patient_name,
             d.rating_average, d.rating_count
      FROM doctor_reviews dr
      JOIN patients p ON p.id = dr.patient_id
      JOIN users pu ON pu.id = p.user_id
      JOIN doctors d ON d.id = dr.doctor_id
      WHERE dr.doctor_id = $1
      ORDER BY dr.created_at DESC
    `, [req.user.doctorId]);
    res.json({
      rating_average: rows[0]?.rating_average || 0,
      rating_count: rows[0]?.rating_count || 0,
      reviews: rows,
    });
  } catch (error) { next(error); }
}
