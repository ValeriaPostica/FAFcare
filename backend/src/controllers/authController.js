import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

// Helper: Formats user objects securely (excluding password hashes)
const publicUser = (row) => ({
  id: row.user_id || row.id,
  patient_id: row.patient_id || null,
  doctor_id: row.doctor_id || null,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone || null,
  role: row.role ? (row.role.charAt(0).toUpperCase() + row.role.slice(1).toLowerCase()) : 'Patient',
  specialty: row.specialty || null,
});

// Helper: Generates a signed JWT Access Token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id || user.user_id,
      patientId: user.patient_id || null,
      doctorId: user.doctor_id || null,
      role: (user.role || 'patient').toLowerCase()
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// GET /api/auth/accounts (Admin/List accounts)
export async function listAccounts(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT u.id, u.email, u.phone, u.full_name, u.role,
             p.id AS patient_id, d.id AS doctor_id, s.name AS specialty
      FROM users u
      LEFT JOIN patients p ON p.user_id = u.id
      LEFT JOIN doctors d ON d.user_id = u.id
      LEFT JOIN specialties s ON s.id = d.specialty_id
      WHERE u.is_active = TRUE 
      ORDER BY u.created_at DESC, u.full_name ASC
    `);
    
    res.json(rows.map(publicUser));
  } catch (error) { 
    next(error); 
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Parameterized Query to prevent SQL Injection
    const { rows } = await query(`
      SELECT u.id, u.email, u.phone, u.full_name, u.role, u.password_hash,
             p.id AS patient_id, d.id AS doctor_id, s.name AS specialty
      FROM users u
      LEFT JOIN patients p ON p.user_id = u.id
      LEFT JOIN doctors d ON d.user_id = u.id
      LEFT JOIN specialties s ON s.id = d.specialty_id
      WHERE LOWER(u.email) = LOWER($1) AND u.is_active = TRUE
    `, [email.trim()]);

    const user = rows[0];

    // Generic error message to prevent User Enumeration attacks
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userData = publicUser(user);
    const token = generateToken(user);

    res.json({
      message: 'Authentication successful',
      token,
      user: userData
    });
  } catch (error) { 
    next(error); 
  }
}

// POST /api/auth/register
export async function register(req, res, next) {
  const client = await pool.connect();
  try {
    const { fullName, email, phone, password } = req.body;

    // 1. Basic Input Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // 2. Hash Password (Bcrypt with cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // 3. Database Transaction
    await client.query('BEGIN');

    const userResult = await client.query(`
      INSERT INTO users (email, phone, password_hash, role, full_name)
      VALUES (LOWER($1), $2, $3, 'patient', $4) 
      RETURNING id, email, phone, full_name, role
    `, [email.trim(), phone ? phone.trim() : null, passwordHash, fullName.trim()]);

    const newUser = userResult.rows[0];

    const patientResult = await client.query(`
      INSERT INTO patients (user_id, full_name) 
      VALUES ($1, $2) 
      RETURNING id
    `, [newUser.id, newUser.full_name]);

    await client.query('COMMIT');

    const combinedUserData = {
      ...newUser,
      patient_id: patientResult.rows[0].id,
      doctor_id: null
    };

    const userData = publicUser(combinedUserData);
    const token = generateToken(combinedUserData);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally { 
    client.release(); 
  }
}

// PATCH /api/patients/:patientId/profile
export async function updatePatientProfile(req, res, next) {
  const client = await pool.connect();
  try {
    const { patientId } = req.params;
    const { fullName, birthDate, insuranceType, bloodType, allergies, chronicConditions } = req.body;

    if (!fullName || !birthDate || !insuranceType || !bloodType || !allergies || !chronicConditions) {
      return res.status(400).json({ error: 'All medical profile fields are required' });
    }

    await client.query('BEGIN');

    const patientResult = await client.query(`
      UPDATE patients
      SET full_name = $1, birth_date = $2, insurance_type = $3, blood_type = $4,
          allergies = $5, chronic_conditions = $6
      WHERE id = $7
      RETURNING id, full_name, birth_date, insurance_type, blood_type, allergies, chronic_conditions
    `, [fullName.trim(), birthDate, insuranceType, bloodType, allergies, chronicConditions, patientId]);

    if (!patientResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    await client.query(`
      UPDATE users 
      SET full_name = $1 
      WHERE id = (SELECT user_id FROM patients WHERE id = $2)
    `, [fullName.trim(), patientId]);

    await client.query('COMMIT');

    res.json({
      message: 'Patient profile updated successfully',
      profile: patientResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally { 
    client.release(); 
  }
}