import { z } from 'zod';

const uuid = z.string().uuid();
const nonEmptyText = (max) => z.string().trim().min(1).max(max);
const isoDateTime = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date and time');

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
}).strict();

export const registerSchema = z.object({
  fullName: nonEmptyText(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(1).max(128).optional(),
}).strict().refine((body) => !body.confirmPassword || body.password === body.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const patientIdParamsSchema = z.object({ patientId: uuid }).strict();
export const doctorIdParamsSchema = z.object({ doctorId: uuid }).strict();

export const profileSchema = z.object({
  fullName: nonEmptyText(100),
  birthDate: z.string().date(),
  insuranceType: nonEmptyText(50),
  bloodType: nonEmptyText(10),
  allergies: nonEmptyText(5000),
  chronicConditions: nonEmptyText(5000),
}).strict();

export const appointmentQuerySchema = z.object({
  patient_id: uuid.optional(),
  doctor_id: uuid.optional(),
}).strict();

export const appointmentSchema = z.object({
  patient_id: uuid.optional(),
  doctor_id: uuid,
  schedule_slot_id: uuid,
  appointment_type: z.enum(['offline', 'online']).default('offline'),
  scheduled_at: isoDateTime,
}).strict();

export const medicalRecordSchema = z.object({
  patient_id: uuid,
  doctor_id: uuid.optional(),
  diagnosis: nonEmptyText(10000),
  diagnosis_type: z.enum(['chronic', 'acute', 'other']).default('other'),
  notes: z.string().trim().max(10000).optional().or(z.literal('')),
  recommendations: z.string().trim().max(10000).optional().or(z.literal('')),
}).strict();

export const prescriptionSchema = z.object({
  patient_id: uuid,
  doctor_id: uuid.optional(),
  medication_name: nonEmptyText(255),
  dosage_instructions: nonEmptyText(10000),
  duration_days: z.coerce.number().int().positive().max(3650).optional(),
}).strict();

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid request body', details: result.error.issues });
  }
  req.body = result.data;
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid route parameters', details: result.error.issues });
  }
  req.params = result.data;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid query parameters', details: result.error.issues });
  }
  req.validatedQuery = result.data;
  next();
};
