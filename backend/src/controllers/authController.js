import bcrypt from 'bcrypt';
import { query } from '../config/db.js';

const publicUser = (row) => ({
  id: row.user_id || row.id,
  patient_id: row.patient_id || null,
  doctor_id: row.doctor_id || null,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  role: row.role.charAt(0).toUpperCase() + row.role.slice(1),
  specialty: row.specialty || null,
});

export async function listAccounts(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT u.id, u.email, u.phone, u.full_name, u.role,
             p.id AS patient_id, d.id AS doctor_id, s.name AS specialty
      FROM users u
      LEFT JOIN patients p ON p.user_id = u.id
      LEFT JOIN doctors d ON d.user_id = u.id
      LEFT JOIN specialties s ON s.id = d.specialty_id
      WHERE u.is_active = TRUE ORDER BY u.created_at, u.full_name
    `);
    res.json(rows.map(publicUser));
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { rows } = await query(`
      SELECT u.*, p.id AS patient_id, d.id AS doctor_id, s.name AS specialty
      FROM users u
      LEFT JOIN patients p ON p.user_id = u.id
      LEFT JOIN doctors d ON d.user_id = u.id
      LEFT JOIN specialties s ON s.id = d.specialty_id
      WHERE LOWER(u.email) = LOWER($1) AND u.is_active = TRUE
    `, [email]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json(publicUser(rows[0]));
  } catch (error) { next(error); }
}

export async function register(req, res, next) {
  const client = await (await import('../config/db.js')).pool.connect();
  try {
    const { fullName, email, phone, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    await client.query('BEGIN');
    const user = await client.query(`
      INSERT INTO users (email, phone, password_hash, role, full_name)
      VALUES ($1, $2, $3, 'patient', $4) RETURNING id, email, phone, full_name, role
    `, [email, phone || null, passwordHash, fullName]);
    const patient = await client.query('INSERT INTO patients (user_id) VALUES ($1) RETURNING id', [user.rows[0].id]);
    await client.query('COMMIT');
    res.status(201).json({ ...publicUser({ ...user.rows[0], patient_id: patient.rows[0].id }), doctor_id: null });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally { client.release(); }
}
