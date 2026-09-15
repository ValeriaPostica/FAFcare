import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { pool } from './src/config/db.js';
import { login, register, updatePatientProfile } from './src/controllers/authController.js';
import { doctors, schedules, specialties } from './src/controllers/catalogController.js';
import { createAppointment, listAppointments } from './src/controllers/appointmentController.js';
import { booklet, createMedicalRecord, createPrescription, records } from './src/controllers/medicalController.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

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
// 2. AUTHENTICATION & RBAC MIDDLEWARES
// ==========================================

// JWT Verification Middleware (Authentication)
export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied: Missing authentication token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded payload { userId, role } to the request object
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

// Role-Based Access Control Middleware (Authorization / RBAC)
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

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

app.post('/api/auth/login', authLimiter, login);
app.post('/api/auth/register', authLimiter, register);

app.get('/api/specialties', specialties);
app.get('/api/doctors', doctors);
app.get('/api/doctors/:doctorId/schedules', schedules);

// Protected Patient Routes (Prevents Unauthorized Access & IDOR)
app.patch('/api/patients/:patientId/profile', authenticate, updatePatientProfile);

// Appointment Management Routes
app.get('/api/appointments', authenticate, listAppointments);
app.post('/api/appointments', authenticate, requireRole('patient'), createAppointment);

// Medical Record Routes (Restricted to authorized users)
app.get('/api/patients/:patientId/medical-records', authenticate, records);
app.get('/api/patient/booklet/:patientId', authenticate, booklet);

// Doctor Operations (Strictly restricted to 'doctor' role)
app.post('/api/medical-records', authenticate, requireRole('doctor'), createMedicalRecord);
app.post('/api/prescriptions', authenticate, requireRole('doctor'), createPrescription);

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