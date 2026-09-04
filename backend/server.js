import express from 'express';
import cors from 'cors';
import { pool } from './src/config/db.js';
import { login, register } from './src/controllers/authController.js';
import { doctors, schedules, specialties } from './src/controllers/catalogController.js';
import { createAppointment, listAppointments } from './src/controllers/appointmentController.js';
import { records } from './src/controllers/medicalController.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Тестовый эндпоинт
app.get('/api/health', async (req, res, next) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); } catch (error) { next(error); }
});
app.post('/api/auth/login', login);
app.post('/api/auth/register', register);
app.get('/api/specialties', specialties);
app.get('/api/doctors', doctors);
app.get('/api/doctors/:doctorId/schedules', schedules);
app.get('/api/appointments', listAppointments);
app.post('/api/appointments', createAppointment);
app.get('/api/patients/:patientId/medical-records', records);

app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === '23505') return res.status(409).json({ error: 'Email already exists' });
  if (['ECONNREFUSED', 'ENOTFOUND', '28P01', '3D000'].includes(error.code)) {
    return res.status(503).json({ error: 'Database unavailable. Start PostgreSQL and run the schema.' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});