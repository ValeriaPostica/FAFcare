import { pool, query } from '../config/db.js';

const appointmentSelect = `
  SELECT a.id, a.patient_id, a.doctor_id, a.schedule_slot_id, a.appointment_type,
         CASE WHEN a.status = 'completed' OR EXISTS (
           SELECT 1 FROM medical_records mr
           WHERE mr.patient_id = a.patient_id
             AND mr.verified_by_doctor_id = a.doctor_id
             AND mr.created_at >= a.scheduled_at
         ) THEN 'completed' ELSE a.status END AS status,
         a.scheduled_at, a.price, pu.full_name AS patient_name,
         du.full_name AS doctor, s.name AS spec,
         dr.id AS review_id, dr.rating AS review_rating, dr.comment AS review_comment
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  JOIN users pu ON pu.id = p.user_id
  JOIN doctors d ON d.id = a.doctor_id
  JOIN users du ON du.id = d.user_id
  LEFT JOIN specialties s ON s.id = d.specialty_id
  LEFT JOIN doctor_reviews dr ON dr.appointment_id = a.id
`;

export async function listAppointments(req, res, next) {
  try {
    const role = req.user.role.toLowerCase();
    let filter = '';
    let params = [];

    if (role === 'patient') {
      filter = ' WHERE a.patient_id = $1';
      params = [req.user.patientId];
    } else if (role === 'doctor') {
      filter = ' WHERE a.doctor_id = $1';
      params = [req.user.doctorId];
    } else if (role === 'admin') {
      const filters = req.validatedQuery || {};
      filter = filters.patient_id ? ' WHERE a.patient_id = $1' : filters.doctor_id ? ' WHERE a.doctor_id = $1' : '';
      params = filter ? [filters.patient_id || filters.doctor_id] : [];
    }

    const { rows } = await query(`${appointmentSelect}${filter} ORDER BY a.scheduled_at`, params);
    res.json(rows);
  } catch (error) { next(error); }
}

export async function createAppointment(req, res, next) {
  const client = await pool.connect();
  try {
    const { patient_id, doctor_id, schedule_slot_id, appointment_type = 'offline', scheduled_at, price } = req.body;

    if (!doctor_id || !schedule_slot_id || !scheduled_at) {
      return res.status(400).json({ error: 'doctor_id, schedule_slot_id and scheduled_at are required' });
    }

    if (patient_id && patient_id !== req.user.patientId) {
      return res.status(403).json({ error: 'You can create appointments only for yourself' });
    }

    await client.query('BEGIN');

    const patientResult = await client.query(
      'SELECT id FROM patients WHERE id = $1 AND user_id = $2 FOR SHARE',
      [req.user.patientId, req.user.userId]
    );
    if (!patientResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Patient profile does not belong to the authenticated user' });
    }

    const slotResult = await client.query(`
      SELECT ds.id, ds.doctor_id, ds.date, ds.start_time, ds.is_available,
             d.price_per_consultation
      FROM doctor_schedules ds
      JOIN doctors d ON d.id = ds.doctor_id
      WHERE ds.id = $1 AND ds.doctor_id = $2
      FOR UPDATE
    `, [schedule_slot_id, doctor_id]);

    const slot = slotResult.rows[0];
    if (!slot) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Schedule slot not found for this doctor' });
    }
    if (!slot.is_available) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Schedule slot is already booked' });
    }
/*
    const matchingTime = await client.query(
      'SELECT ($1::timestamp = ($2::date + $3::time)) AS matches',
      [scheduled_at, slot.date, slot.start_time]
    );
    if (!matchingTime.rows[0].matches) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'scheduled_at must match the selected schedule slot' });
    }
*/
    const updatedSlot = await client.query(
      'UPDATE doctor_schedules SET is_available = FALSE WHERE id = $1 AND is_available = TRUE RETURNING id',
      [schedule_slot_id]
    );
    if (!updatedSlot.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Schedule slot is already booked' });
    }
    const calculatedScheduledAt = `${slot.date.toISOString().slice(0, 10)}T${slot.start_time}`;
    const appointmentResult = await client.query(`
      INSERT INTO appointments (patient_id, doctor_id, schedule_slot_id, appointment_type, scheduled_at, price)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, [req.user.patientId, doctor_id, schedule_slot_id, appointment_type, scheduled_at, slot.price_per_consultation]);

    await client.query('COMMIT');

    const result = await query(`${appointmentSelect} WHERE a.id = $1`, [appointmentResult.rows[0].id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

export async function updateAppointment(req, res, next) {
  try {
    const { status } = req.body;
    const role = req.user.role.toLowerCase();
    const params = [status, req.params.id];
    let ownership = '';

    if (role === 'doctor') {
      params.push(req.user.doctorId);
      ownership = ' AND a.doctor_id = $3';
    }

    const result = await query(`
      UPDATE appointments a
      SET status = $1
      WHERE a.id = $2${ownership}
      RETURNING a.id
    `, params);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updated = await query(`${appointmentSelect} WHERE a.id = $1`, [req.params.id]);
    res.json(updated.rows[0]);
  } catch (error) { next(error); }
}
