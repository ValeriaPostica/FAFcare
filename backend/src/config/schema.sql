CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('patient', 'doctor', 'admin')) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(10),
    address TEXT,
    insurance_type VARCHAR(50),
    blood_type VARCHAR(10),
    allergies TEXT,
    chronic_conditions TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20)
);

ALTER TABLE patients ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS chronic_conditions TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);

CREATE TABLE IF NOT EXISTS specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    specialty_id INT REFERENCES specialties(id),
    experience_years INT DEFAULT 0,
    price_per_consultation DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES doctors(id),
    schedule_slot_id UUID REFERENCES doctor_schedules(id),
    appointment_type VARCHAR(20) CHECK (appointment_type IN ('offline', 'online')),
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'pending',
    scheduled_at TIMESTAMP NOT NULL,
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES doctors(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    text TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    diagnosis TEXT NOT NULL,
    diagnosis_type VARCHAR(20) DEFAULT 'other' CHECK (diagnosis_type IN ('chronic', 'acute', 'other')),
    notes TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT TRUE,
    verified_by_doctor_id UUID REFERENCES doctors(id),
    digital_signature_hash VARCHAR(255)
);

ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS verified_by_doctor_id UUID REFERENCES doctors(id);
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS digital_signature_hash VARCHAR(255);
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS diagnosis_type VARCHAR(20) DEFAULT 'other';
UPDATE medical_records SET diagnosis_type = 'other' WHERE diagnosis_type IS NULL;
ALTER TABLE medical_records ALTER COLUMN diagnosis_type SET DEFAULT 'other';

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    medication_name VARCHAR(255) NOT NULL,
    dosage_instructions TEXT NOT NULL,
    duration_days INT,
    status VARCHAR(20) DEFAULT 'active',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);