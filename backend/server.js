import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { pool } from './src/config/db.js';
import { listAccounts, loginStep1, register, resendMfa, updatePatientProfile, verifyMfa } from './src/controllers/authController.js';
import { doctors, schedules, specialties } from './src/controllers/catalogController.js';
import { createAppointment, listAppointments, updateAppointment } from './src/controllers/appointmentController.js';
import { booklet, createMedicalRecord, createPrescription, records } from './src/controllers/medicalController.js';
import { authenticate, requirePatientAccess, requireRole } from './src/middleware/auth.js';
import {
  appointmentQuerySchema,
  appointmentSchema,
  appointmentUpdateSchema,
  doctorIdParamsSchema,
  loginSchema,
  mfaSchema,
  medicalRecordSchema,
  patientIdParamsSchema,
  prescriptionSchema,
  profileSchema,
  registerSchema,
  resendMfaSchema,
  validateBody,
  validateParams,
  validateQuery,
} from './src/middleware/validation.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Nginx is the single trusted reverse proxy in the Docker deployment.
app.set('trust proxy', 1);

// ==========================================
// 1. SECURITY MIDDLEWARES
// ==========================================

// Enforce HTTP Security Headers (Mitigates XSS, Clickjacking, MIME-sniffing)
app.use(helmet());

// Strict Cross-Origin Resource Sharing (CORS) policy
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Payload size limit to prevent Denial of Service (DoS) attacks
app.use(express.json({ limit: '10kb' }));

// Brute-force protection for authentication endpoints (Max 5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// 3. APPLICATION ROUTES & ENDPOINTS
// ==========================================

// Public Routes
app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login-step1', authLimiter, validateBody(loginSchema), loginStep1);
app.post('/api/auth/login', authLimiter, validateBody(loginSchema), loginStep1);
app.post('/api/auth/verify-mfa', authLimiter, validateBody(mfaSchema), verifyMfa);
app.post('/api/auth/resend-mfa', authLimiter, validateBody(resendMfaSchema), resendMfa);
app.post('/api/auth/register', authLimiter, validateBody(registerSchema), register);
app.get('/api/admin/accounts', authenticate, requireRole('admin'), listAccounts);

app.get('/api/specialties', specialties);
app.get('/api/doctors', doctors);
app.get('/api/doctors/:doctorId/schedules', validateParams(doctorIdParamsSchema), schedules);

// Protected Patient Routes (Prevents Unauthorized Access & IDOR)
app.patch('/api/patients/:patientId/profile', authenticate, validateParams(patientIdParamsSchema), validateBody(profileSchema), requirePatientAccess((req) => req.params.patientId), updatePatientProfile);

// Appointment Management Routes
app.get('/api/appointments', authenticate, requireRole('patient', 'doctor', 'admin'), validateQuery(appointmentQuerySchema), listAppointments);
app.post('/api/appointments', authenticate, requireRole('patient'), validateBody(appointmentSchema), createAppointment);
app.patch('/api/appointments/:id', authenticate, requireRole('doctor', 'admin'), validateBody(appointmentUpdateSchema), updateAppointment);

// Medical Record Routes (Restricted to authorized users)
app.get('/api/patients/:patientId/medical-records', authenticate, validateParams(patientIdParamsSchema), requirePatientAccess((req) => req.params.patientId), records);
app.get('/api/patient/booklet/:patientId', authenticate, validateParams(patientIdParamsSchema), requirePatientAccess((req) => req.params.patientId), booklet);

// Doctor Operations (Strictly restricted to 'doctor' role)
app.post('/api/medical-records', authenticate, requireRole('doctor'), validateBody(medicalRecordSchema), createMedicalRecord);
app.post('/api/prescriptions', authenticate, requireRole('doctor'), validateBody(prescriptionSchema), createPrescription);

// ==========================================
// 4. GLOBAL ERROR HANDLING MIDDLEWARE
// ==========================================
app.use((error, req, res, next) => {
  console.error(error);

  // PostgreSQL Unique Constraint Violation Error (e.g., Duplicate Email)
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Email address is already registered' });
  }

  // Database Connection Error Catching
  if (['ECONNREFUSED', 'ENOTFOUND', '28P01', '3D000'].includes(error.code)) {
    return res.status(503).json({ error: 'Database service unavailable. Please check backend connection.' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Secure application server listening on http://localhost:${PORT}`);
});