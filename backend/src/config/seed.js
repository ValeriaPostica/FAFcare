import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../');
const dataDir = path.join(root, 'data');
const defaultPassword = process.env.SEED_PASSWORD || 'Password123!';

function uuidFor(type, value) {
  const hex = crypto.createHash('sha1').update(`${type}:${value}`).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20).join('')}`;
}

async function csvRows(name) {
  const text = await fs.readFile(path.join(dataDir, name), 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headerLine = lines.shift();
  const headers = headerLine.split(headerLine.includes(';') ? ';' : ',').map((value) => value.trim());
  return lines.map((line) => {
    let normalized = line.trim().replace(/;+$/, '');
    if (normalized.startsWith('"') && normalized.endsWith('"')) normalized = normalized.slice(1, -1).replaceAll('""', '"');
    const values = parse(normalized, { delimiter: ',', relax_column_count: true, relax_quotes: true, skip_empty_lines: true })[0] || [];
    const rowHeaders = name === 'appointments' && values.length > headers.length && !/^\d+(\.\d+)?$/.test(values[8] || '')
      ? [...headers.slice(0, 8), 'appointment_category', ...headers.slice(8)]
      : headers;
    return Object.fromEntries(rowHeaders.map((header, index) => [header, (values[index] ?? '').trim() || null]));
  });
}

const valueOr = (value, fallback) => value === null || value === undefined || value === '' ? fallback : value;
const integerOr = (value, fallback = 0) => Number.isInteger(Number(value)) ? Number(value) : fallback;
const numericOr = (value, fallback = null) => Number.isFinite(Number(value)) ? Number(value) : fallback;

async function seed() {
  const client = await pool.connect();
  const passwordHash = await bcrypt.hash(defaultPassword, 12);
  try {
    await client.query('BEGIN');
    const specialties = await csvRows('specialties.csv');
    for (const row of specialties) {
      await client.query(`INSERT INTO specialties (id, name, description) VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [integerOr(row.id), row.name, row.description]);
    }

    const patientRows = await csvRows('patients.csv');
    for (const row of patientRows) {
      const userId = uuidFor('user', valueOr(row.user_id, `patient-${row.id}`));
      const patientId = uuidFor('patient', row.id);
      await client.query(`INSERT INTO users (id, email, phone, password_hash, role, full_name, created_at)
        VALUES ($1, $2, $3, $4, 'patient', $5, COALESCE($6, CURRENT_TIMESTAMP))
        ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, phone = EXCLUDED.phone, full_name = EXCLUDED.full_name`,
        [userId, row.email, row.phone, passwordHash, row.full_name, row.created_at]);
      await client.query(`INSERT INTO patients (id, user_id, birth_date, gender, address, insurance_type)
        VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id,
        birth_date = EXCLUDED.birth_date, gender = EXCLUDED.gender, address = EXCLUDED.address, insurance_type = EXCLUDED.insurance_type`,
        [patientId, userId, row.birth_date, row.gender, row.address, row.insurance_type]);
    }

    const doctorRows = await csvRows('doctors.csv');
    for (const row of doctorRows) {
      const userId = uuidFor('user', valueOr(row.user_id, `doctor-${row.id}`));
      const doctorId = uuidFor('doctor', row.id);
      const price = row.price_per_consultation_mdl || row.price_per_consultation;
      await client.query(`INSERT INTO users (id, email, phone, password_hash, role, full_name)
        VALUES ($1, $2, $3, $4, 'doctor', $5)
        ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name`,
        [userId, `doctor.${row.id}@fafcare.local`, row.phone, passwordHash, row.full_name]);
      await client.query(`INSERT INTO doctors (id, user_id, specialty_id, experience_years, price_per_consultation)
        VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET specialty_id = EXCLUDED.specialty_id,
        experience_years = EXCLUDED.experience_years, price_per_consultation = EXCLUDED.price_per_consultation`,
        [doctorId, userId, integerOr(row.specialty_id, null), integerOr(row.experience_years), price]);
    }

    await client.query(`INSERT INTO users (id, email, phone, password_hash, role, full_name)
      VALUES ($1, 'admin@fafcare.com', NULL, $2, 'admin', 'FAFCare Administrator')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash,
      full_name = EXCLUDED.full_name, role = EXCLUDED.role`,
      [uuidFor('user', 'admin'), passwordHash]);

    for (const row of await csvRows('doctor_schedules.csv')) {
      await client.query(`INSERT INTO doctor_schedules (id, doctor_id, date, start_time, end_time, is_available)
        VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET date = EXCLUDED.date,
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_available = EXCLUDED.is_available`,
        [uuidFor('schedule', row.id), uuidFor('doctor', row.doctor_id), row.date, row.start_time, row.end_time, row.is_available !== '0']);
    }

    for (const row of await csvRows('appointments.csv')) {
      const price = numericOr(row.price_mdl, numericOr(row.appointment_category));
      await client.query(`INSERT INTO appointments (id, patient_id, doctor_id, schedule_slot_id, appointment_type, status, scheduled_at, created_at, price)
        VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_TIMESTAMP), $9)
        ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, scheduled_at = EXCLUDED.scheduled_at, price = EXCLUDED.price`,
        [uuidFor('appointment', row.id), uuidFor('patient', row.patient_id), uuidFor('doctor', row.doctor_id), row.schedule_slot_id ? uuidFor('schedule', row.schedule_slot_id) : null,
          valueOr(row.appointment_type, 'offline'), valueOr(row.status, 'pending'), row.scheduled_at, row.created_at, price]);
    }

    for (const row of await csvRows('medical_data_general.csv')) {
      await client.query(`INSERT INTO medical_records (id, patient_id, diagnosis, notes, recommendations, created_at)
        VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP)) ON CONFLICT (id) DO NOTHING`,
        [uuidFor('medical', row.id), uuidFor('patient', row.patient_id), row.diagnosis, row.notes, row.recommendations, row.created_at]);
    }
    await client.query('COMMIT');
    console.log(`Seed completed. Test password: ${defaultPassword}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); await pool.end(); }
}

seed().catch((error) => { console.error('Seed failed:', error.message); process.exitCode = 1; });
