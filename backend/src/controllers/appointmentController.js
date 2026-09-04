import { query } from '../config/db.js';

const appointmentSelect = `
  SELECT a.id, a.patient_id, a.doctor_id, a.schedule_slot_id, a.appointment_type,
         a.status, a.scheduled_at, a.price, pu.full_name AS patient_name,
         du.full_name AS doctor, s.name AS spec
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  JOIN users pu ON pu.id = p.user_id
  JOIN doctors d ON d.id = a.doctor_id
  JOIN users du ON du.id = d.user_id
  LEFT JOIN specialties s ON s.id = d.specialty_id
`;

export async function listAppointments(req, res, next) {
  try {
    const filter = req.query.patient_id ? ' WHERE a.patient_id = $1' : req.query.doctor_id ? ' WHERE a.doctor_id = $1' : '';
    const { rows } = await query(`${appointmentSelect}${filter} ORDER BY a.scheduled_at`, filter ? [req.query.patient_id || req.query.doctor_id] : []);
    res.json(rows);
  } catch (error) { next(error); }
}

export async function createAppointment(req, res, next) {
  try {
    const { patient_id, doctor_id, schedule_slot_id, appointment_type = 'offline', scheduled_at, price } = req.body;
    const { rows } = await query(`
      INSERT INTO appointments (patient_id, doctor_id, schedule_slot_id, appointment_type, scheduled_at, price)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, [patient_id, doctor_id, schedule_slot_id || null, appointment_type, scheduled_at, price || null]);
    const result = await query(`${appointmentSelect} WHERE a.id = $1`, [rows[0].id]);
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
}
