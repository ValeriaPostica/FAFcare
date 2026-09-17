import React, { useEffect, useState } from 'react';
import { 
  Activity, Calendar, FileText, Pill, User, LogOut, PlusCircle, ArrowLeft, 
  Mail, Lock, Phone, Eye, EyeOff, ShieldCheck, CheckCircle2, Clock, 
  ChevronRight, Download, Heart, Droplets, Thermometer, Plus, X, Stethoscope, 
  Building, Check, Users, History, FileCheck, Printer, Search
} from 'lucide-react';

export default function App() {
  // --- DOCTOR SPECIALTIES AND LIST ---
  const [specialties, setSpecialties] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);

  // --- APPOINTMENTS LIST ---
  const [appointments, setAppointments] = useState([]);
  const [booklet, setBooklet] = useState(null);
  const [bookletLoading, setBookletLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pdfPreviewHtml, setPdfPreviewHtml] = useState(null);

  // --- AUTH AND NAVIGATION STATE ---
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [authStep, setAuthStep] = useState('credentials'); // 'credentials' | 'mfa'
  const [mfaToken, setMfaToken] = useState('');
  const [pendingAuthUser, setPendingAuthUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('currentUser');
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'appointments' | 'history' | 'booklet'
  const [bookletSection, setBookletSection] = useState('profile');
  const [illnessSearch, setIllnessSearch] = useState('');
  const [illnessCategory, setIllnessCategory] = useState('all');
  const [illnessDoctor, setIllnessDoctor] = useState('all');
  const [illnessYear, setIllnessYear] = useState('all');
  const [profileSurveyOpen, setProfileSurveyOpen] = useState(false);
  const [profileSurveyData, setProfileSurveyData] = useState({
    fullName: '',
    birthDate: '',
    insuranceType: '',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
  });

  // --- SYMPTOM CHECKER MODAL STATE ---
  const [isSymptomCheckerOpen, setIsSymptomCheckerOpen] = useState(false);
  const [symptomStep, setSymptomStep] = useState(1); // 1: zone/symptom, 2: duration & intensity, 3: recommendation
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [symptomDuration, setSymptomDuration] = useState('1-3 days');
  const [symptomIntensity, setSymptomIntensity] = useState(5);

  const symptomCategories = [
    { id: 'fever', label: 'Fever & Feverish States', zone: 'General', keyword: 'general', desc: 'High temperature, chills, sweating' },
    { id: 'cardio', label: 'Chest Pain / Palpitations', zone: 'Chest', keyword: 'cardio', desc: 'Chest tightness, rapid or irregular heartbeat' },
    { id: 'derma', label: 'Skin Rashes / Itching', zone: 'Skin', keyword: 'derma', desc: 'Redness, skin allergies, lesions or spots' },
    { id: 'neuro', label: 'Headaches / Dizziness', zone: 'Head', keyword: 'neuro', desc: 'Migraines, temporary loss of balance' },
    { id: 'ortho', label: 'Joint & Muscle Pain', zone: 'Limbs & Back', keyword: 'ortho', desc: 'Movement difficulty, joint inflammation' },
  ];

  // --- BOOKING MODAL STATE ---
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: specialty selection, 2: doctor selection, 3: date and time
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-09-15');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  const handleProceedToBookingFromSymptom = () => {
    if (!selectedSymptom) return;
    
    const matchedSpec = specialties.find(spec => 
      spec.name.toLowerCase().includes(selectedSymptom.keyword)
    ) || specialties[0]; 

    setSelectedSpec(matchedSpec);
    setIsSymptomCheckerOpen(false);
    setBookingStep(2); 
    setIsBookingOpen(true);
    
    setSymptomStep(1);
    setSelectedSymptom(null);
  };

  // --- DOCTOR COMPLETION MODAL STATE ---
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedAppointmentToComplete, setSelectedAppointmentToComplete] = useState(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);
  const [selectedPatientBooklet, setSelectedPatientBooklet] = useState(null);
  const [recommendationDrafts, setRecommendationDrafts] = useState({});
  const [completionFormData, setCompletionFormData] = useState({
    diagnosis: '',
    diagnosisType: 'other',
    prescription: '',
    notes: '',
  });

  // Login form
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otpCode, setOtpCode] = useState('');

  const availableTimeSlots = ['09:00 AM', '10:30 AM', '01:15 PM', '03:00 PM', '04:30 PM'];

  const to24Hour = (time) => {
    const [clock, meridiem] = time.split(' ');
    let [hours, minutes] = clock.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };

  const api = async (path, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      }, ...options,
    });
    const responseText = await response.text();
    let body;
    try {
      body = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error(`API returned ${response.status} ${response.statusText} instead of JSON`);
    }
    if (!response.ok) {
      const serverMessage = body.error || 'Request failed';
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (response.status === 403) {
        throw new Error(`Access denied: ${serverMessage}`);
      }
      if (response.status === 409) {
        throw new Error(`Conflict: ${serverMessage}`);
      }
      throw new Error(serverMessage);
    }
    return body;
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const loadAppointments = async (user = currentUser) => {
    if (!user) return;
    const query = user.role === 'Doctor' ? `doctor_id=${user.doctor_id}` : user.role === 'Patient' ? `patient_id=${user.patient_id}` : '';
    const rows = await api(`/appointments?${query}`);
    setAppointments(rows.map((row) => ({ 
      ...row, 
      patientName: row.patient_name, 
      date: row.scheduled_at.slice(0, 10), 
      time: row.scheduled_at.slice(11, 16), 
      location: 'FAFCare clinic',
      status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase() : 'Scheduled'
    })));
  };

  useEffect(() => {
    Promise.all([api('/specialties'), api('/doctors')])
      .then(([remoteSpecialties, remoteDoctors]) => {
        setSpecialties(remoteSpecialties.map((spec) => ({ ...spec, icon: spec.name.toLowerCase().includes('heart') ? Heart : Stethoscope })));
        setDoctorsList(remoteDoctors.map((doctor) => ({ ...doctor, specId: doctor.spec_id })));
      })
      .catch((error) => setNotification(`API unavailable: ${error.message}`));
  }, []);

  useEffect(() => { loadAppointments().catch(() => {}); }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.patient_id) {
      setBooklet(null);
      setAuditLogs([]);
      return;
    }

    setBookletLoading(true);
    Promise.all([
      api(`/patient/booklet/${currentUser.patient_id}`),
      api('/patient/audit-logs'),
    ])
      .then(([bookletData, logs]) => {
        setBooklet(bookletData);
        setAuditLogs(logs);
      })
      .catch((error) => setNotification(`Medical booklet unavailable: ${error.message}`))
      .finally(() => setBookletLoading(false));
  }, [currentUser]);

  // --- HANDLERS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfileSurveyChange = (e) => setProfileSurveyData({ ...profileSurveyData, [e.target.name]: e.target.value });

  const handleProfileSurveySubmit = async (e) => {
    e.preventDefault();
    try {
      const dateParts = profileSurveyData.birthDate.split('.');
      const birthDate = dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        : profileSurveyData.birthDate;
      await api(`/patients/${currentUser.patient_id}/profile`, {
        method: 'PATCH',
        body: JSON.stringify({ ...profileSurveyData, birthDate }),
      });
      const updatedBooklet = await api(`/patient/booklet/${currentUser.patient_id}`);
      setBooklet(updatedBooklet);
      setCurrentUser({ ...currentUser, fullName: profileSurveyData.fullName });
      setProfileSurveyOpen(false);
      setNotification('Your medical profile was saved successfully.');
      setTimeout(() => setNotification(null), 4000);
    } catch (error) { setNotification(error.message); }
  };

  const handleSubmitAuth = async (e) => {
    e.preventDefault();
    try {
      if (authView === 'register') {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
        const authResponse = await api('/auth/register', { method: 'POST', body: JSON.stringify(formData) });
        setMfaToken(authResponse.mfaToken);
        setPendingAuthUser(authResponse.user);
        setAuthStep('mfa');
        setOtpCode('');
        setNotification(authResponse.otpCode
          ? `Development OTP: ${authResponse.otpCode}`
          : 'Enter the 6-digit verification code to finish signing in.');
        setFormData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
      } else {
        const authResponse = await api('/auth/login-step1', { method: 'POST', body: JSON.stringify({ email: formData.email, password: formData.password }) });
        setMfaToken(authResponse.mfaToken);
        setPendingAuthUser(authResponse.user);
        setAuthStep('mfa');
        setOtpCode('');
        setNotification(authResponse.otpCode
          ? `Development OTP: ${authResponse.otpCode}`
          : 'Enter the 6-digit verification code to finish signing in.');
      }
    } catch (error) { setNotification(error.message); }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    try {
      const authResponse = await api('/auth/verify-mfa', {
        method: 'POST',
        body: JSON.stringify({ mfaToken, otpCode }),
      });
      localStorage.setItem('accessToken', authResponse.token);
      const authenticatedUser = { ...authResponse.user, avatarColor: 'bg-emerald-600' };
      localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
      setCurrentUser(authenticatedUser);
      if (authView === 'register') {
        setProfileSurveyData({ ...profileSurveyData, fullName: authResponse.user.fullName });
        setProfileSurveyOpen(true);
      } else {
        setActiveTab('overview');
      }
      setAuthStep('credentials');
      setMfaToken('');
      setPendingAuthUser(null);
      setOtpCode('');
      setNotification(null);
    } catch (error) { setNotification(error.message); }
  };

  const handleResendMfa = async () => {
    try {
      const response = await api('/auth/resend-mfa', {
        method: 'POST',
        body: JSON.stringify({ mfaToken }),
      });
      setMfaToken(response.mfaToken);
      setOtpCode('');
      setNotification(response.otpCode
        ? `Development OTP: ${response.otpCode}`
        : 'A new verification code was generated.');
    } catch (error) { setNotification(error.message); }
  };

  const handleViewPatientProfile = async (appointment) => {
    try {
      const [profile, medicalBooklet] = await Promise.all([
        api(`/patients/${appointment.patient_id}`),
        api(`/patient/booklet/${appointment.patient_id}`),
      ]);
      setSelectedPatientProfile(profile);
      setSelectedPatientBooklet(medicalBooklet);
      setRecommendationDrafts(Object.fromEntries(
        (medicalBooklet.verified_records || []).map((record) => [record.id, record.recommendations || '']),
      ));
    } catch (error) {
      setNotification(`Patient profile unavailable: ${error.message}`);
    }
  };

  const handleRecommendationSave = async (recordId) => {
    try {
      const updatedRecord = await api(`/medical-records/${recordId}/recommendations`, {
        method: 'PATCH',
        body: JSON.stringify({ recommendations: recommendationDrafts[recordId] || '' }),
      });
      setSelectedPatientBooklet((bookletData) => ({
        ...bookletData,
        verified_records: bookletData.verified_records.map((record) => record.id === recordId ? updatedRecord : record),
      }));
      setNotification('Recommendation updated successfully.');
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      setNotification(`Recommendation could not be updated: ${error.message}`);
    }
  };

  // Finish booking
  const handleConfirmBooking = async () => {
    const slot = await api(`/doctors/${selectedDoctor.id}/schedules`);
    const selectedSlot = slot.find((item) => item.date.toString().slice(0, 10) === selectedDate) || slot[0];
    await api('/appointments', { method: 'POST', body: JSON.stringify({
      patient_id: currentUser.patient_id, doctor_id: selectedDoctor.id, schedule_slot_id: selectedSlot?.id,
      appointment_type: 'offline', scheduled_at: `${selectedDate}T${to24Hour(selectedTime)}`, price: selectedDoctor.price_per_consultation,
    }) });
    await loadAppointments(currentUser);
    setIsBookingOpen(false);
    setBookingStep(1);
    setSelectedSpec(null);
    setSelectedDoctor(null);
    setActiveTab('appointments');
    setNotification('Your appointment was booked successfully!');
    setTimeout(() => setNotification(null), 4000);
  };

  // Complete consultation by Doctor
  const handleSaveConsultationCompletion = async (e) => {
    e.preventDefault();
    if (!selectedAppointmentToComplete) return;

    if (selectedAppointmentToComplete.status === 'Completed') {
      setIsCompleteModalOpen(false);
      setSelectedAppointmentToComplete(null);
      return;
    }

    try {
      await api('/medical-records', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: selectedAppointmentToComplete.patient_id,
          doctor_id: currentUser.doctor_id,
          diagnosis: completionFormData.diagnosis,
          diagnosis_type: completionFormData.diagnosisType,
          notes: completionFormData.notes,
        }),
      });
    } catch (err) {
      setNotification(`Consultation saved locally, but medical record was not stored: ${err.message}`);
    }

    await api(`/appointments/${selectedAppointmentToComplete.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'completed',
        diagnosis: completionFormData.diagnosis,
        prescription: completionFormData.prescription,
        notes: completionFormData.notes,
      }),
    });

    if (completionFormData.prescription?.trim() && currentUser.doctor_id && selectedAppointmentToComplete.patient_id) {
      try {
        await api('/prescriptions', {
          method: 'POST',
          body: JSON.stringify({
            patient_id: selectedAppointmentToComplete.patient_id,
            doctor_id: currentUser.doctor_id,
            medication_name: completionFormData.prescription.trim(),
            dosage_instructions: 'Follow the instructions provided by your doctor.',
          }),
        });
      } catch (err) {
        setNotification(`Consultation saved, but prescription was not stored: ${err.message}`);
      }
    }

    setIsCompleteModalOpen(false);
    setSelectedAppointmentToComplete(null);
    setCompletionFormData({ diagnosis: '', diagnosisType: 'other', prescription: '', notes: '' });
    await loadAppointments(currentUser);
    setNotification('Consultation marked as completed and added to Medical History!');
    setTimeout(() => setNotification(null), 4000);
  };

  // Patient-specific data loaded from PostgreSQL through the booklet endpoint.
  const userAppointments = appointments.filter(a => a.patientName === currentUser?.fullName);
  const upcomingAppointments = userAppointments.filter(a => a.status !== 'Completed');
  const bookletRecords = booklet?.verified_records || [];
  const activePrescriptions = booklet?.active_prescriptions || [];
  const bookletPatient = booklet?.patient || {};
  const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not recorded';
  const getIllnessCategory = (record) => {
    if (record.diagnosis_type) return String(record.diagnosis_type).toLowerCase();
    if (record.category) return String(record.category).toLowerCase();
    const text = `${record.diagnosis || ''} ${record.notes || ''} ${record.recommendations || ''}`.toLowerCase();
    if (/chronic|hypertension|diabetes|asthma|arthritis|migraine/.test(text)) return 'chronic';
    if (/acute|infection|sinusitis|fever|flu|injury|pain/.test(text)) return 'acute';
    return 'other';
  };
  const filteredIllnessRecords = bookletRecords.filter((record) => {
    const searchText = `${record.diagnosis || ''} ${record.notes || ''} ${record.recommendations || ''} ${record.verified_by_doctor || ''}`.toLowerCase();
    const matchesSearch = searchText.includes(illnessSearch.trim().toLowerCase());
    const matchesCategory = illnessCategory === 'all' || getIllnessCategory(record) === illnessCategory;
    const matchesDoctor = illnessDoctor === 'all' || record.doctor_specialty === illnessDoctor;
    const matchesYear = illnessYear === 'all' || String(new Date(record.created_at).getFullYear()) === illnessYear;
    return matchesSearch && matchesCategory && matchesDoctor && matchesYear;
  });
  const illnessYears = [...new Set(bookletRecords.map((record) => new Date(record.created_at).getFullYear()).filter(Boolean))].sort((first, second) => second - first);
  const illnessDoctorSpecialties = [...new Set(bookletRecords.map((record) => record.doctor_specialty).filter(Boolean))].sort();
  const openMedicalBookletPdf = async (showPreview = true) => {
    const latestBooklet = currentUser?.patient_id
      ? await api(`/patient/booklet/${currentUser.patient_id}`).catch(() => booklet)
      : booklet;
    const latestPatient = latestBooklet?.patient || bookletPatient;
    const latestRecords = latestBooklet?.verified_records || bookletRecords;
    const latestPrescriptions = latestBooklet?.active_prescriptions || activePrescriptions;
    const escapeHtml = (value) => String(value ?? 'Not recorded').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
    const patientName = latestPatient.full_name || currentUser.fullName;
    const records = latestRecords.map((record) => `
      <article class="record"><div class="record-heading"><strong>${escapeHtml(record.diagnosis)}</strong><span>${escapeHtml(formatDate(record.created_at))}</span></div>
        ${record.verified_by_doctor ? `<p class="muted">Doctor: ${escapeHtml(record.verified_by_doctor)}</p>` : ''}
        ${record.notes ? `<p><b>Notes:</b> ${escapeHtml(record.notes)}</p>` : ''}
        ${record.recommendations ? `<p><b>Recommendations:</b> ${escapeHtml(record.recommendations)}</p>` : ''}
      </article>`).join('') || '<p class="muted">No verified medical records.</p>';
    const prescriptions = latestPrescriptions.map((prescription) => `
      <article class="record"><div class="record-heading"><strong>${escapeHtml(prescription.medication_name)}</strong><span>Active</span></div>
        <p>${escapeHtml(prescription.dosage_instructions)}</p><p class="muted">${escapeHtml(prescription.duration_days ? `${prescription.duration_days} days` : 'Continuous')}${prescription.doctor_name ? ` • Issued by ${escapeHtml(prescription.doctor_name)}` : ''}</p>
      </article>`).join('') || '<p class="muted">No active prescriptions.</p>';
    const bookletHtml = `<!doctype html><html><head><title>FAFCare Medical Booklet - ${escapeHtml(patientName)}</title><style>
      *{box-sizing:border-box}body{margin:0;background:#f1f5f9;color:#172b2d;font-family:Arial,sans-serif;line-height:1.45}.page{max-width:850px;margin:28px auto;background:#fff;padding:42px;box-shadow:0 4px 20px #0f172a1a}.cover{background:#103f42;color:#fff;padding:28px 32px;border-radius:14px;margin-bottom:24px}.eyebrow{color:#b8e3dc;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase}.cover h1{font-size:30px;margin:7px 0 24px}.holder{border-top:1px solid #ffffff33;padding-top:18px}.holder-label{color:#b8e3dc;font-size:10px;text-transform:uppercase;letter-spacing:1px}.holder strong{display:block;font-size:20px;margin-top:3px}.meta{color:#d8f3ee;font-size:12px;margin-top:10px}.section{border-top:2px solid #0f766e;margin-top:24px;padding-top:16px}.section h2{font-size:20px;margin:0 0 14px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field{border-bottom:1px solid #e2e8f0;padding-bottom:8px}.label{color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px}.value{font-weight:700;margin-top:3px}.record{border:1px solid #dbe4e5;border-left:4px solid #10b981;border-radius:8px;padding:12px 14px;margin:10px 0}.record-heading{display:flex;justify-content:space-between;gap:16px}.record-heading span,.muted{color:#64748b;font-size:12px}.record p{margin:7px 0 0;font-size:13px}.pdf-export{background:#fff}.pdf-export .page{margin:0;max-width:none;box-shadow:none;padding:20px}.pdf-export .cover{print-color-adjust:exact;-webkit-print-color-adjust:exact}@media print{body{background:#fff}.page{margin:0;max-width:none;box-shadow:none;padding:20px}.cover{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style></head><body><main class="page"><section class="cover"><div class="eyebrow">Republic of Moldova • FAFcare Health System</div><div class="eyebrow" style="margin-top:20px">Electronic Health Passport & Record</div><h1>Individual Medical Booklet</h1><div class="holder"><div class="holder-label">Authorized holder</div><strong>${escapeHtml(patientName)}</strong><div class="meta">Patient ID: PAT-${escapeHtml(String(latestPatient.id || currentUser.patient_id).slice(0, 8))} • Signed & secured</div></div></section>
      <section class="section"><h2>Patient Personal Record</h2><div class="grid"><div class="field"><div class="label">Full name</div><div class="value">${escapeHtml(patientName)}</div></div><div class="field"><div class="label">Date of birth</div><div class="value">${escapeHtml(formatDate(latestPatient.birth_date))}</div></div><div class="field"><div class="label">Medical insurance</div><div class="value">${escapeHtml(latestPatient.insurance_type)}</div></div><div class="field"><div class="label">Blood type / Rh</div><div class="value">${escapeHtml(latestPatient.blood_type)}</div></div><div class="field"><div class="label">Known allergies</div><div class="value">${escapeHtml(latestPatient.allergies || 'None recorded')}</div></div><div class="field"><div class="label">Chronic conditions</div><div class="value">${escapeHtml(latestPatient.chronic_conditions || 'None recorded')}</div></div></div></section>
      <section class="section"><h2>Illness History & Diagnoses</h2>${records}</section><section class="section"><h2>Active Prescriptions</h2>${prescriptions}</section></main></body></html>`;
    if (showPreview) setPdfPreviewHtml(bookletHtml);
    return bookletHtml;
  };

  // =========================================================================
  // 1. LOGIN SCREEN (WHEN NOT AUTHENTICATED)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          <div className="bg-emerald-600 p-6 text-white text-center relative">
            {(authView !== 'login' || authStep === 'mfa') && (
              <button onClick={() => { setAuthView('login'); setAuthStep('credentials'); setMfaToken(''); setPendingAuthUser(null); setOtpCode(''); setNotification(null); }} className="absolute left-4 top-6 p-1 rounded-lg hover:bg-white/10 transition text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">FAFCare Portal</h1>
            <p className="text-emerald-100 text-sm mt-1">Sign in to your FAFCare account</p>
          </div>

          <div className="p-8">
            {notification && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {authStep === 'mfa' ? (
              <form onSubmit={handleVerifyMfa} className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Two-step verification</h2>
                  <p className="text-sm text-slate-500 mt-1">A verification code was generated for {pendingAuthUser?.email || formData.email}.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">6-digit verification code</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required autoFocus value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="w-full px-3 py-2 border rounded-lg text-sm tracking-[0.35em] text-center focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition">Verify and continue</button>
                <button type="button" onClick={handleResendMfa} className="w-full text-sm text-emerald-600 hover:underline">I didn't get the code</button>
              </form>
            ) : (authView === 'login' || authView === 'register') && (
              <form onSubmit={handleSubmitAuth} className="space-y-4">
                {authView === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Patient full name</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="John Smith" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                {authView === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
                    <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                )}
                <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition">
                  {authView === 'login' ? 'Log in' : 'Create account'}
                </button>
                <button type="button" onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')} className="w-full text-sm text-emerald-600 hover:underline">
                  {authView === 'login' ? 'Register new patient' : 'Back to login'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'Patient' && profileSurveyOpen) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-emerald-600 p-6 text-white">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Patient personal record</p>
            <h1 className="text-2xl font-bold mt-1">Complete your medical profile</h1>
            <p className="text-emerald-100 text-sm mt-2">This information will be saved to your medical card and shown on your dashboard.</p>
          </div>
          <form onSubmit={handleProfileSurveySubmit} className="p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input type="text" name="fullName" required value={profileSurveyData.fullName} onChange={handleProfileSurveyChange} className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of birth</label>
                <input type="text" name="birthDate" required value={profileSurveyData.birthDate} onChange={handleProfileSurveyChange} placeholder="DD.MM.YYYY" pattern="[0-9]{2}\.[0-9]{2}\.[0-9]{4}" inputMode="numeric" className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medical insurance</label>
                <input type="text" name="insuranceType" required value={profileSurveyData.insuranceType} onChange={handleProfileSurveyChange} className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood type / Rh</label>
                <select name="bloodType" required value={profileSurveyData.bloodType} onChange={handleProfileSurveyChange} className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="">Select blood type</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Known allergies & intolerances</label>
                <input type="text" name="allergies" required value={profileSurveyData.allergies} onChange={handleProfileSurveyChange} className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Chronic conditions</label>
                <textarea name="chronicConditions" required value={profileSurveyData.chronicConditions} onChange={handleProfileSurveyChange} rows={3} className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-y" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition">Save medical profile</button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. ADMIN & DOCTOR DASHBOARDS
  // =========================================================================
  if (currentUser.role === 'Admin') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl text-white"><ShieldCheck className="w-6 h-6" /></div>
              <div><span className="font-bold text-lg text-slate-900">FAFCare Administration</span><span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded ml-2">Admin</span></div>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
          <div><h2 className="text-2xl font-bold text-slate-800">Administration dashboard</h2><p className="text-sm text-slate-500 mt-1">System overview and management access</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500">Registered doctors</p><p className="text-3xl font-bold text-slate-800 mt-2">{doctorsList.length}</p></div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500">Specialties</p><p className="text-3xl font-bold text-slate-800 mt-2">{specialties.length}</p></div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500">Appointments</p><p className="text-3xl font-bold text-slate-800 mt-2">{appointments.length}</p></div>
          </div>
        </main>
      </div>
    );
  }

  if (currentUser.role === 'Doctor') {
    const doctorAppointments = appointments.filter((a) => a.doctor === currentUser.fullName);

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-xl text-white">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900">FAFCare Doctor</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded ml-2 border border-emerald-200">Doctor</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{currentUser.fullName}</p>
                <p className="text-xs text-slate-500">{currentUser.specialty}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100 transition">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
          {notification && (
            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Doctor dashboard: {currentUser.fullName}</h2>
              <p className="text-sm text-slate-500 mt-1">Specialty: {currentUser.specialty} • Total patients scheduled: {doctorAppointments.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Your patients’ appointments</h3>
            </div>

            {doctorAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">There are no appointments for you right now.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {doctorAppointments.map((app) => (
                  <div key={app.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-sm">
                        {app.patientName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{app.patientName}</h4>
                        <p className="text-xs text-slate-500">Appointment: {app.date} at {app.time}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{app.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPatientProfile(app)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium text-xs rounded-lg transition"
                      >
                        View patient profile
                      </button>
                      {app.status !== 'Completed' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAppointmentToComplete(app);
                              setIsCompleteModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Add diagnosis &amp; prescription
                          </button>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Confirmed
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {selectedPatientProfile && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
              <div className="p-5 bg-slate-800 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Patient medical card</h3>
                  <p className="text-xs text-slate-300">Read-only medical record with editable recommendations</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelectedPatientProfile(null); setSelectedPatientBooklet(null); setRecommendationDrafts({}); }} className="p-1 hover:bg-white/10 rounded-lg text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-500 mb-1">Full name</p><p className="font-semibold text-slate-800">{selectedPatientProfile.full_name}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Date of birth</p><p className="font-semibold text-slate-800">{selectedPatientProfile.birth_date || 'Not recorded'}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Gender</p><p className="font-semibold text-slate-800">{selectedPatientProfile.gender || 'Not recorded'}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Insurance</p><p className="font-semibold text-slate-800">{selectedPatientProfile.insurance_type || 'Not recorded'}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Blood type</p><p className="font-semibold text-slate-800">{selectedPatientProfile.blood_type || 'Not recorded'}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Allergies</p><p className="font-semibold text-slate-800">{selectedPatientProfile.allergies || 'Not recorded'}</p></div>
                  <div className="sm:col-span-2"><p className="text-xs text-slate-500 mb-1">Chronic conditions</p><p className="font-semibold text-slate-800">{selectedPatientProfile.chronic_conditions || 'Not recorded'}</p></div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <h4 className="font-bold text-slate-800">Verified medical records</h4>
                  {selectedPatientBooklet?.verified_records?.length ? <div className="mt-3 space-y-3">{selectedPatientBooklet.verified_records.map((record) => <div key={record.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"><p className="font-semibold text-slate-800">{record.diagnosis}</p><p className="mt-1 text-xs text-slate-500">{formatDate(record.created_at)}{record.verified_by_doctor ? ` • ${record.verified_by_doctor}` : ''}</p>{record.notes && <p className="mt-2 text-slate-600">{record.notes}</p>}<label className="mt-3 block"><span className="block text-xs font-semibold text-slate-600">Recommendations</span><textarea value={recommendationDrafts[record.id] || ''} onChange={(event) => setRecommendationDrafts({ ...recommendationDrafts, [record.id]: event.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Add or update recommendations" /><button type="button" onClick={() => handleRecommendationSave(record.id)} className="mt-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Save recommendation</button></label></div>)}</div> : <p className="mt-2 text-sm text-slate-500">No verified records.</p>}
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <h4 className="font-bold text-slate-800">Active prescriptions</h4>
                  {selectedPatientBooklet?.active_prescriptions?.length ? <div className="mt-3 space-y-3">{selectedPatientBooklet.active_prescriptions.map((prescription) => <div key={prescription.id} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm"><p className="font-semibold text-slate-800">{prescription.medication_name}</p><p className="mt-1 text-slate-600">{prescription.dosage_instructions}</p></div>)}</div> : <p className="mt-2 text-sm text-slate-500">No active prescriptions.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCTOR COMPLETION MODAL */}
        {isCompleteModalOpen && selectedAppointmentToComplete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
              <div className="p-5 bg-emerald-600 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Add consultation result</h3>
                  <p className="text-xs text-emerald-100">Patient: {selectedAppointmentToComplete.patientName}</p>
                </div>
                <button onClick={() => setIsCompleteModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveConsultationCompletion} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={completionFormData.diagnosis}
                    onChange={(e) => setCompletionFormData({ ...completionFormData, diagnosis: e.target.value })}
                    placeholder="e.g. Mild Hypertension, Acute Sinusitis"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis type</label>
                  <select value={completionFormData.diagnosisType} onChange={(e) => setCompletionFormData({ ...completionFormData, diagnosisType: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="chronic">Chronic</option>
                    <option value="acute">Acute</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prescription</label>
                  <input
                    type="text"
                    value={completionFormData.prescription}
                    onChange={(e) => setCompletionFormData({ ...completionFormData, prescription: e.target.value })}
                    placeholder="e.g. Amoxicillin 500mg - twice daily for 7 days"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Notes & Advice</label>
                  <textarea
                    rows={3}
                    value={completionFormData.notes}
                    onChange={(e) => setCompletionFormData({ ...completionFormData, notes: e.target.value })}
                    placeholder="Enter clinical observations, follow-up instructions..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCompleteModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition"
                  >
                    Save & Complete
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. PATIENT DASHBOARD (WITH HOME, APPOINTMENTS & MEDICAL HISTORY)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900">FAFCare</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded ml-2 border border-emerald-100">Patient</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-slate-200">
              <div className={`w-9 h-9 ${currentUser.avatarColor} text-white font-bold rounded-full flex items-center justify-center text-sm`}>
                {currentUser.fullName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">{currentUser.fullName}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
            </div>

            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}>
            <Activity className="w-5 h-5" /> Home
          </button>
          <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeTab === 'appointments' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}>
            <Calendar className="w-5 h-5" /> Appointments ({upcomingAppointments.length})
          </button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}>
            <History className="w-5 h-5" /> Medical History
          </button>
          <button onClick={() => setActiveTab('booklet')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${activeTab === 'booklet' ? 'bg-teal-800 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}>
            <FileText className="w-5 h-5" /> Digital Medical Booklet
          </button>
        </aside>

        <main className="flex-1 space-y-6">
          {notification && (
            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {currentUser.fullName}!</h2>
                  <p className="text-emerald-100 text-sm mt-1">You have {upcomingAppointments.length} upcoming appointment(s) booked</p>
                </div>
                <button onClick={() => setIsBookingOpen(true)} className="py-2.5 px-4 bg-white text-emerald-600 font-bold rounded-xl text-xs hover:bg-emerald-50 transition shadow">
                  + Book appointment
                </button>
              </div>

                          {/* Symptom Checker Call-to-Action Banner */}
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Not sure which doctor to visit?</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Use our Symptom Checker to get a quick specialty recommendation.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSymptomStep(1); setIsSymptomCheckerOpen(true); }}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow shrink-0"
                >
                  Check symptoms
                </button>
              </div>

              <button onClick={() => setActiveTab('booklet')} className="w-full rounded-2xl border border-teal-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-500 hover:bg-teal-50/50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-teal-100 p-3 text-teal-700"><FileText className="h-6 w-6" /></div>
                    <div><p className="font-bold text-slate-900">Digital Medical Booklet</p><p className="mt-1 text-sm text-slate-500">Open your electronic health passport, verified consultations and prescriptions.</p></div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-teal-700" />
                </div>
              </button>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl"><User className="w-5 h-5" /></div>
                  <div><h3 className="font-bold text-slate-900">Patient personal record</h3><p className="text-xs text-slate-500 mt-0.5">Your saved general medical information</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5 text-sm">
                  <div><p className="text-xs text-slate-500">Full name</p><p className="mt-1 font-semibold text-slate-900">{bookletPatient.full_name || currentUser.fullName}</p></div>
                  <div><p className="text-xs text-slate-500">Date of birth</p><p className="mt-1 font-semibold text-slate-900">{formatDate(bookletPatient.birth_date)}</p></div>
                  <div><p className="text-xs text-slate-500">Medical insurance</p><p className="mt-1 font-semibold text-slate-900">{bookletPatient.insurance_type || 'Not recorded'}</p></div>
                  <div><p className="text-xs text-slate-500">Blood type / Rh</p><p className="mt-1 font-semibold text-slate-900">{bookletPatient.blood_type || 'Not recorded'}</p></div>
                  <div><p className="text-xs text-slate-500">Known allergies & intolerances</p><p className="mt-1 font-semibold text-slate-900">{bookletPatient.allergies || 'None recorded'}</p></div>
                  <div><p className="text-xs text-slate-500">Chronic conditions</p><p className="mt-1 font-semibold text-slate-900">{bookletPatient.chronic_conditions || 'None recorded'}</p></div>
                </div>
              </div>

              {/* Live medical profile summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl"><Heart className="w-6 h-6" /></div>
                  <div><p className="text-xs text-slate-500">Blood type / Rh</p><p className="text-xl font-bold text-slate-800">{bookletPatient.blood_type || 'Not recorded'}</p></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><Droplets className="w-6 h-6" /></div>
                  <div><p className="text-xs text-slate-500">Known allergies</p><p className="text-sm font-bold text-slate-800">{bookletPatient.allergies || 'None recorded'}</p></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Thermometer className="w-6 h-6" /></div>
                  <div><p className="text-xs text-slate-500">Chronic conditions</p><p className="text-sm font-bold text-slate-800">{bookletPatient.chronic_conditions || 'None recorded'}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">My appointments</h2>
                <button onClick={() => setIsBookingOpen(true)} className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition shadow">
                  <Plus className="w-4 h-4" /> Book appointment
                </button>
              </div>

              <div className="space-y-3">
                {upcomingAppointments.length === 0 ? (
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">You do not have any active appointments yet.</div>
                ) : (
                  upcomingAppointments.map((app) => (
                    <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><Calendar className="w-6 h-6" /></div>
                        <div>
                          <h4 className="font-bold text-slate-800">{app.doctor}</h4>
                          <p className="text-xs text-slate-500">{app.spec} • {app.location}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {app.date} at {app.time}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Scheduled
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MEDICAL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div><h2 className="text-xl font-bold text-slate-800">Medical History & Past Consultations</h2><p className="mt-1 text-sm text-slate-500">Verified records from your medical database.</p></div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{bookletRecords.length} record(s)</span>
              </div>
              {bookletRecords.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">No verified medical history recorded yet.</div>
              ) : (
                <div className="space-y-4">
                  {bookletRecords.map((record) => (
                    <article key={record.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><FileCheck className="h-5 w-5" /></div><div><h4 className="font-bold text-slate-800">{record.verified_by_doctor || 'Verified medical consultation'}</h4><p className="text-xs text-slate-500">{formatDate(record.created_at)}</p></div></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Verified</span></div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Diagnosis</p><p className="mt-1 font-medium text-slate-800">{record.diagnosis}</p></div>
                      {record.notes && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><strong>Doctor Notes:</strong> {record.notes}</p>}
                      {record.recommendations && <p className="rounded-xl bg-emerald-50/50 p-3 text-sm text-emerald-900"><strong>Recommendations:</strong> {record.recommendations}</p>}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DIGITAL MEDICAL BOOKLET */}
          {activeTab === 'booklet' && (
            <div className="space-y-6">
              {bookletLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">Loading your digital medical booklet...</div>
              ) : (
                <div className="space-y-5">
                  <section className="relative overflow-hidden rounded-[1.25rem] border border-teal-900/10 bg-[#103f42] p-5 text-white shadow-lg sm:p-6">
                    <div className="absolute -right-8 -top-12 text-white/[0.06]"><ShieldCheck className="h-56 w-56" /></div>
                    <div className="relative flex flex-wrap items-start justify-between gap-5 border-b border-white/15 pb-6">
                      <div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-200">Republic of Moldova • FAFcare Health System</p><p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">Electronic Health Passport & Record</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Individual Medical Booklet</h2></div>
                      <button onClick={() => openMedicalBookletPdf(true)} title="Print medical booklet" aria-label="Print medical booklet" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-teal-100 transition hover:bg-white/20"><Printer className="h-6 w-6" /><span>Print</span></button>
                    </div>
                    <div className="relative mt-4 flex flex-wrap items-end justify-between gap-3">
                      <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200">Authorized holder</p><p className="mt-1 text-xl font-bold">{bookletPatient.full_name || currentUser.fullName}</p></div>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold"><span className="rounded-md border border-teal-200/30 bg-white/10 px-3 py-2">ID: PAT-{String(bookletPatient.id || currentUser.patient_id).slice(0, 8)}</span><span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-400/20 px-3 py-2 text-emerald-100"><ShieldCheck className="h-4 w-4" /> Signed & secured</span></div>
                    </div>
                  </section>

                  <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <nav className="rounded-2xl border border-teal-900/10 bg-[#103f42] p-3 text-white shadow-md lg:sticky lg:top-24" aria-label="Booklet table of contents">
                      <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200">Table of contents</p>
                      <div className="space-y-1">
                        {[
                          { id: 'profile', number: '01', label: 'Personal Record', icon: User },
                          { id: 'visits', number: '02', label: 'Consultations', icon: FileCheck },
                          { id: 'history', number: '03', label: 'Illness History', icon: History },
                          { id: 'prescriptions', number: '04', label: 'Prescriptions', icon: Pill },
                          { id: 'access-log', number: '05', label: 'Security & Access', icon: ShieldCheck },
                        ].map(({ id, number, label, icon: Icon }) => (
                          <button key={id} onClick={() => setBookletSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${bookletSection === id ? 'bg-white text-teal-900 shadow-sm' : 'text-teal-50 hover:bg-white/10'}`}>
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${bookletSection === id ? 'bg-teal-100 text-teal-800' : 'bg-white/10 text-teal-100'}`}>{number}</span>
                            <span className="min-w-0 flex-1 whitespace-nowrap text-xs font-bold">{label}</span>
                            <Icon className="h-4 w-4 shrink-0 opacity-80" />
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 border-t border-white/15 px-3 pt-3 text-[10px] leading-4 text-teal-200">Secure electronic<br />medical record</div>
                    </nav>

                    <div className="min-h-[34rem] min-w-0 rounded-2xl border border-slate-200 bg-white p-1 shadow-lg sm:p-2">
                      <div className="h-full rounded-xl border border-slate-100 bg-white p-5 sm:p-8">
                  {bookletSection === 'profile' && (
                    <section>
                    <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Page No. 01</p><h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Patient Personal Record</h3><p className="mt-1 text-sm text-slate-500">Biometric information & health status</p></div>
                      <div className="rounded-xl bg-teal-50 p-3 text-teal-700"><User className="h-6 w-6" /></div>
                    </div>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full name</p><p className="mt-1 text-base font-bold text-slate-900">{bookletPatient.full_name || 'Not recorded'}</p></div>
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of birth</p><p className="mt-1 text-base font-bold text-slate-900">{formatDate(bookletPatient.birth_date)}</p></div>
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Medical insurance</p><p className="mt-1 text-base font-bold text-emerald-700">{bookletPatient.insurance_type || 'Not recorded'}</p></div>
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood type / Rh</p><p className="mt-1 text-base font-bold text-slate-900">{bookletPatient.blood_type || 'Not recorded'}</p></div>
                      <div className="sm:col-span-2"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Known allergies & intolerances</p><p className="mt-1 font-semibold text-slate-900">{bookletPatient.allergies || 'None recorded'}</p></div>
                      <div className="sm:col-span-2"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chronic conditions</p><p className="mt-1 font-semibold text-slate-900">{bookletPatient.chronic_conditions || 'None recorded'}</p></div>
                    </div>
                    </section>
                  )}

                  {bookletSection === 'visits' && (
                    <section>
                    <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Page No. 02</p><h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Verified Consultations & Visits</h3><p className="mt-1 text-sm text-slate-500">Records validated by medical specialists</p></div><div className="rounded-xl bg-teal-50 p-3 text-teal-700"><FileCheck className="h-6 w-6" /></div></div>
                    {bookletRecords.length === 0 ? (
                      <p className="text-sm text-slate-500">No verified consultations are recorded yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {bookletRecords.map((record) => (
                          <article key={record.id} className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-slate-50/50 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /><h4 className="font-bold text-slate-900">Verified medical record</h4></div>
                                <p className="mt-1 text-xs text-slate-500">{formatDate(record.created_at)}{record.verified_by_doctor ? ` • ${record.verified_by_doctor}` : ''}</p>
                              </div>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Verified</span>
                            </div>
                            <p className="mt-4 text-sm"><span className="font-semibold text-slate-700">Diagnosis:</span> {record.diagnosis}</p>
                            {record.notes && <p className="mt-2 text-sm text-slate-600"><span className="font-semibold text-slate-700">Notes:</span> {record.notes}</p>}
                            {record.recommendations && <p className="mt-2 text-sm text-slate-600"><span className="font-semibold text-slate-700">Recommendations:</span> {record.recommendations}</p>}
                          </article>
                        ))}
                      </div>
                    )}
                    </section>
                  )}

                  {bookletSection === 'history' && (
                    <section>
                      <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Page No. 03</p><h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Illness History & Diagnoses</h3><p className="mt-1 text-sm text-slate-500">Diagnoses, chronic conditions, clinical notes and treatment overview</p></div>
                        <div className="rounded-xl bg-teal-50 p-3 text-teal-700"><History className="h-6 w-6" /></div>
                      </div>
                      <div className="mb-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnoses</p><p className="mt-1 text-2xl font-black text-slate-900">{bookletRecords.length}</p></div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chronic conditions</p><p className="mt-1 text-sm font-bold text-slate-900">{bookletPatient.chronic_conditions || 'None recorded'}</p></div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active treatments</p><p className="mt-1 text-2xl font-black text-emerald-700">{activePrescriptions.length}</p></div>
                      </div>
                      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex flex-col gap-3 lg:flex-row">
                          <label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={illnessSearch} onChange={(event) => setIllnessSearch(event.target.value)} placeholder="Search diagnoses, doctors or notes..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>
                          <select value={illnessYear} onChange={(event) => setIllnessYear(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"><option value="all">All years</option>{illnessYears.map((year) => <option key={year} value={year}>{year}</option>)}</select>
                          <select value={illnessDoctor} onChange={(event) => setIllnessDoctor(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"><option value="all">All specialties</option>{illnessDoctorSpecialties.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}</select>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-slate-500">Category:</span>{[{ id: 'all', label: 'All' }, { id: 'chronic', label: 'Chronic' }, { id: 'acute', label: 'Acute' }].map((category) => <button key={category.id} onClick={() => setIllnessCategory(category.id)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${illnessCategory === category.id ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 hover:bg-teal-50'}`}>{category.label}</button>)}<span className="ml-auto text-xs font-semibold text-slate-400">Showing {filteredIllnessRecords.length} of {bookletRecords.length}</span></div>
                      </div>
                      {bookletRecords.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No diagnoses have been recorded yet.</div>
                      ) : filteredIllnessRecords.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No diagnoses match your search and filters.</div>
                      ) : (
                        <div className="relative space-y-4 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-teal-100">
                          {filteredIllnessRecords.map((record) => (
                            <article key={record.id} className="relative pl-10">
                              <span className="absolute left-2 top-5 h-3 w-3 rounded-full border-2 border-white bg-teal-600 shadow-sm" />
                              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-teal-700">{formatDate(record.created_at)}</p><h4 className="mt-1 font-bold text-slate-900">{record.diagnosis}</h4></div><div className="flex gap-2"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold capitalize text-teal-700">{record.diagnosis_type || getIllnessCategory(record)}</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Verified</span></div></div>
                                {(record.verified_by_doctor || record.doctor_specialty) && <p className="mt-2 text-xs text-slate-500">Doctor: {record.verified_by_doctor || 'Not recorded'}{record.doctor_specialty ? ` • ${record.doctor_specialty}` : ''}</p>}
                                {record.notes && <p className="mt-3 text-sm text-slate-600"><span className="font-semibold text-slate-700">Notes:</span> {record.notes}</p>}
                                {record.recommendations && <p className="mt-2 text-sm text-slate-600"><span className="font-semibold text-slate-700">Recommendations:</span> {record.recommendations}</p>}
                                {record.id === bookletRecords[0]?.id && <button onClick={() => { setActiveTab('appointments'); setIsBookingOpen(true); }} className="mt-4 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-800">Book a follow-up appointment</button>}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {bookletSection === 'prescriptions' && (
                    <section>
                    <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Page No. 04</p><h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Active Prescriptions</h3><p className="mt-1 text-sm text-slate-500">Issued treatment plan</p></div><div className="rounded-xl bg-teal-50 p-3 text-teal-700"><Pill className="h-6 w-6" /></div></div>
                    {activePrescriptions.length === 0 ? (
                      <p className="text-sm text-slate-500">No active prescriptions are recorded yet.</p>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {activePrescriptions.map((prescription) => (
                          <article key={prescription.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                            <div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-slate-900">{prescription.medication_name}</h4><p className="mt-2 text-sm text-slate-700">{prescription.dosage_instructions}</p></div><span className="whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span></div>
                            <p className="mt-3 text-xs text-slate-500">{prescription.duration_days ? `${prescription.duration_days} days` : 'Continuous'}{prescription.doctor_name ? ` • Issued by ${prescription.doctor_name}` : ''}</p>
                          </article>
                        ))}
                      </div>
                    )}
                    </section>
                  )}

                  {bookletSection === 'access-log' && (
                    <section>
                    <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Page No. 05</p><h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Security & Access Log</h3><p className="mt-1 text-sm text-slate-500">A record of doctors who accessed your medical information</p></div><div className="rounded-xl bg-teal-50 p-3 text-teal-700"><ShieldCheck className="h-6 w-6" /></div></div>
                    {auditLogs.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No access activity recorded yet.</div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                              <th className="px-4 py-3">Doctor name</th>
                              <th className="px-4 py-3">Specialty</th>
                              <th className="px-4 py-3">Date / time</th>
                              <th className="px-4 py-3">Access reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {auditLogs.map((log) => (
                              <tr key={log.id} className="align-top transition hover:bg-teal-50/40">
                                <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">{log.doctor_name || 'Unknown doctor'}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{log.specialty || 'Not recorded'}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{new Date(log.accessed_at).toLocaleString('en-GB')}</td>
                                <td className="px-4 py-4 text-slate-600">{log.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    </section>
                  )}
                      </div>
                    </div>
                    </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {pdfPreviewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-[#103f42] px-4 py-3 text-white sm:px-6">
              <div><h2 className="font-bold">Medical Booklet</h2><p className="text-xs text-teal-100">Print the document or close the preview.</p></div>
              <button onClick={() => setPdfPreviewHtml(null)} title="Close PDF preview" aria-label="Close PDF preview" className="rounded-lg p-2 text-teal-100 transition hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <iframe id="pdf-preview-frame" title="Medical booklet PDF preview" srcDoc={pdfPreviewHtml} className="min-h-0 flex-1 border-0 bg-slate-100" />
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white p-3 sm:flex-row sm:justify-end sm:px-6">
              <button onClick={() => setPdfPreviewHtml(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">Close</button>
              <button onClick={() => document.getElementById('pdf-preview-frame')?.contentWindow?.print()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"><Printer className="h-4 w-4" /> Print</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. INTERACTIVE APPOINTMENT BOOKING MODAL (3 STEPS)
         ========================================================================= */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            
            {/* Modal header */}
            <div className="p-5 bg-emerald-600 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg">Book an appointment</h3>
                <p className="text-xs text-emerald-100">Step {bookingStep} of 3</p>
              </div>
              <button onClick={() => setIsBookingOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* STEP 1: SPECIALTY SELECTION */}
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-700">1. Choose a medical specialty:</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {specialties.map((spec) => {
                      const IconComp = spec.icon;
                      return (
                        <button
                          key={spec.id}
                          onClick={() => {
                            setSelectedSpec(spec);
                            setBookingStep(2);
                          }}
                          className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
                        >
                          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-800">{spec.name}</h4>
                            <p className="text-xs text-slate-500">{spec.desc}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: DOCTOR SELECTION */}
              {bookingStep === 2 && (
                <div className="space-y-4">
                  <button onClick={() => setBookingStep(1)} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to specialty selection
                  </button>
                  <p className="text-sm font-semibold text-slate-700">2. Available doctors ({selectedSpec?.name}):</p>
                  
                  <div className="space-y-2.5">
                    {doctorsList.filter(d => d.specId === selectedSpec?.id).map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setBookingStep(3);
                        }}
                        className="w-full flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-sm shrink-0">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600">{doc.name}</h4>
                            <p className="text-xs text-slate-500">{doc.location} • Experience {doc.experience}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: DATE AND TIME */}
              {bookingStep === 3 && (
                <div className="space-y-4">
                  <button onClick={() => setBookingStep(2)} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to doctor selection
                  </button>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                    <p><strong>Doctor:</strong> {selectedDoctor?.name}</p>
                    <p><strong>Specialty:</strong> {selectedDoctor?.spec}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select appointment date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select available time:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition ${
                            selectedTime === slot ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition mt-4"
                  >
                    Confirm appointment
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          5. SYMPTOM CHECKER & PRE-CONSULTATION MODAL (3 STEPS)
         ========================================================================= */}
      {isSymptomCheckerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            
            {/* Header */}
            <div className="p-5 bg-emerald-600 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg">Symptom Checker</h3>
                <p className="text-xs text-emerald-100">Step {symptomStep} of 3</p>
              </div>
              <button onClick={() => setIsSymptomCheckerOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* STEP 1: Main symptom / body area selection */}
              {symptomStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-700">1. Select your primary symptom or affected area:</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {symptomCategories.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedSymptom(item);
                          setSymptomStep(2);
                        }}
                        className={`flex items-center justify-between p-3.5 border rounded-xl transition text-left ${
                          selectedSymptom?.id === item.id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{item.zone}</span>
                            <h4 className="font-bold text-sm text-slate-800">{item.label}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Duration and intensity */}
              {symptomStep === 2 && (
                <div className="space-y-5">
                  <button onClick={() => setSymptomStep(1)} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to symptom selection
                  </button>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                    <strong>Selected symptom:</strong> {selectedSymptom?.label} ({selectedSymptom?.zone})
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Symptom duration:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Under 24 hours', '1-3 days', 'Over 1 week'].map((dur) => (
                        <button
                          key={dur}
                          onClick={() => setSymptomDuration(dur)}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg border transition ${
                            symptomDuration === dur ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">Discomfort level (1 - 10):</label>
                      <span className="text-sm font-bold text-emerald-600">{symptomIntensity} / 10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={symptomIntensity} 
                      onChange={(e) => setSymptomIntensity(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Mild</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSymptomStep(3)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition mt-2"
                  >
                    Generate recommendation
                  </button>
                </div>
              )}

              {/* STEP 3: Smart recommendation & direct booking button */}
              {symptomStep === 3 && (
                <div className="space-y-5 text-center py-2">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Triage Recommendation
                    </span>
                    <h4 className="text-xl font-bold text-slate-800 mt-3">
                      Recommended consultation: {specialties.find(s => s.name.toLowerCase().includes(selectedSymptom?.keyword))?.name || 'General Practice'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                      Based on your symptom (<em>{selectedSymptom?.label}</em>), intensity level {symptomIntensity}/10 and duration of {symptomDuration}.
                    </p>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={handleProceedToBookingFromSymptom}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" /> Book appointment for {specialties.find(s => s.name.toLowerCase().includes(selectedSymptom?.keyword))?.name || 'Specialty'}
                    </button>
                    <button
                      onClick={() => setSymptomStep(1)}
                      className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 transition"
                    >
                      Reset questionnaire
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}