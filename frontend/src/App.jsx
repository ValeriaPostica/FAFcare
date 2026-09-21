import React, { useEffect, useState, useCallback } from 'react';
import { 
  Activity, Calendar, FileText, Pill, User, LogOut, ArrowLeft, ChevronLeft, ChevronRight,
  Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, Clock, 
  Heart, Droplets, Thermometer, Plus, X, Stethoscope, 
  Building, Check, Users, History, FileCheck, Printer, Search, RefreshCw,
  TrendingUp, ClipboardList, UserCheck, CalendarClock, Star,
  Award, MessageSquare, BarChart3, PieChart
} from 'lucide-react';

/* -------------------------------------------------------------------------
   FAF Logo
------------------------------------------------------------------------- */
const FafLogo = ({ className = 'h-9 w-9', dark = true }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet">
    {dark && <rect width="200" height="200" fill="#1a1a1a" />}
    <path d="M32 72 h40 v13 h-26 v20 h22 v13 h-22 v40 h-14 z" fill="#ffffff" />
    <path d="M78 72 h20 l28 84 h-15 l-6 -20 h-30 l-6 20 h-15 z M92 84 l-10 34 h20 z" fill="#ffffff" />
    <path d="M64 122 L108 90 L135 90 L91 122 Z" fill="#ff7a00" />
    <path d="M68 138 L112 106 L135 106 L91 138 Z" fill="#ff9a1f" />
    <path d="M72 150 L116 118 L135 118 L91 150 Z" fill="#ff7a00" />
    <path d="M138 72 h40 v13 h-26 v20 h22 v13 h-22 v40 h-14 z" fill="#ffffff" />
  </svg>
);

/* -------------------------------------------------------------------------
   Star rating
------------------------------------------------------------------------- */
const StarRating = ({ value = 0, onChange = null, size = 'md', showValue = false, count = null }) => {
  const sizeMap = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const cls = sizeMap[size] || sizeMap.md;
  const interactive = typeof onChange === 'function';
  return (
    <div className="inline-flex items-center gap-1">
      <div className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(value);
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange(star)}
              aria-label={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
              className={`${interactive ? 'cursor-pointer transition-transform duration-150 hover:scale-110' : 'cursor-default pointer-events-none'}`}
            >
              <svg className={`${cls} ${filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>
      {showValue && <span className="tnum text-xs font-semibold text-slate-600">{value ? value.toFixed(1) : '—'}</span>}
      {count != null && <span className="tnum text-[11px] text-slate-400">({count})</span>}
    </div>
  );
};

/* -------------------------------------------------------------------------
   Global styles
------------------------------------------------------------------------- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600;700&family=Sora:wght@600;700;800&display=swap');

    :root {
      --ink: #0f172a;
      --brand-900: #0b3b3e;
      --canvas: #e9eef0;
      --canvas-2: #eef3f3;
    }

    .fc-canvas {
      background-color: var(--canvas);
      background-image: linear-gradient(180deg, var(--canvas-2) 0%, var(--canvas) 42%, #e4eaec 100%);
      background-attachment: fixed;
    }

    .fc-brand {
      background-color: #0b3b3e;
      background-image: radial-gradient(130% 130% at 0% 0%, #115e59 0%, #0b3b3e 58%, #062a2c 100%);
      color: #fff;
    }
    .fc-brand-alt {
      background-color: #0b3b3e;
      background-image: radial-gradient(130% 130% at 100% 0%, #0f766e 0%, #0b3b3e 70%);
      color: #fff;
    }

    html { -webkit-text-size-adjust: 100%; }
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-feature-settings: 'cv02','cv03','cv04','ss01';
      color: var(--ink);
    }
    .font-display { font-family: 'Sora', 'Inter', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.022em; }
    .tnum { font-variant-numeric: tabular-nums; }

    ::selection { background: rgba(5, 150, 105, 0.16); color: #064e3b; }

    .fc-field { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
    .fc-field::before {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(900px 480px at 12% -8%, rgba(16,185,129,0.13), transparent 62%),
        radial-gradient(760px 420px at 96% 4%, rgba(13,148,136,0.11), transparent 60%),
        radial-gradient(680px 520px at 50% 108%, rgba(100,116,139,0.10), transparent 64%);
    }
    .fc-field::after {
      content: ''; position: absolute; inset: 0;
      background-image:
        linear-gradient(to right, rgba(15,23,42,0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(15,23,42,0.035) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(ellipse 85% 60% at 50% 0%, #000 35%, transparent 78%);
      -webkit-mask-image: radial-gradient(ellipse 85% 60% at 50% 0%, #000 35%, transparent 78%);
    }

    .fc-auth-field { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .fc-auth-field::before {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(1100px 620px at 8% -10%, rgba(16,185,129,0.22), transparent 60%),
        radial-gradient(900px 560px at 100% 8%, rgba(13,148,136,0.20), transparent 58%),
        radial-gradient(900px 700px at 50% 118%, rgba(11,59,62,0.16), transparent 62%);
    }
    .fc-auth-field::after {
      content: ''; position: absolute; inset: 0;
      background-image:
        linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 90% 65% at 50% 0%, #000 30%, transparent 80%);
      -webkit-mask-image: radial-gradient(ellipse 90% 65% at 50% 0%, #000 30%, transparent 80%);
    }

    @keyframes fcFloat {
      0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
      50% { transform: translate3d(0, -18px, 0) scale(1.03); }
    }
    .fc-orb { animation: fcFloat 9s ease-in-out infinite; }
    .fc-orb-slow { animation: fcFloat 13s ease-in-out infinite; }

    @keyframes fcPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.15); }
    }
    .fc-pulse { animation: fcPulse 2s ease-in-out infinite; }

    .fc-weave {
      background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 11px);
    }

    .fc-e1 { box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.03); }
    .fc-e2 { box-shadow: 0 1px 2px rgba(15,23,42,0.05), 0 10px 26px -14px rgba(15,23,42,0.22); }
    .fc-e3 { box-shadow: 0 2px 4px rgba(15,23,42,0.06), 0 24px 56px -22px rgba(11,59,62,0.42); }

    @keyframes fcRise { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }
    @keyframes fcVeil { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fcSweep { from { background-position: 200% 0; } to { background-position: -200% 0; } }
    @keyframes fcSlideIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
    @keyframes fcBarGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    .fc-rise { animation: fcRise 220ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    .fc-veil { animation: fcVeil 160ms ease-out both; }
    .fc-slide-in { animation: fcSlideIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    .fc-bar { animation: fcBarGrow 500ms cubic-bezier(0.22, 1, 0.36, 1) both; transform-origin: bottom; }
    .fc-skeleton {
      background: linear-gradient(90deg, #eef2f6 25%, #f8fafc 50%, #eef2f6 75%);
      background-size: 200% 100%;
      animation: fcSweep 1.4s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .fc-rise, .fc-veil, .fc-skeleton, .fc-orb, .fc-orb-slow, .fc-pulse, .fc-slide-in, .fc-bar { animation: none !important; }
      * { transition-duration: 1ms !important; }
    }

    :where(button, a, input, select, textarea):focus-visible {
      outline: 2px solid #059669; outline-offset: 2px; border-radius: 10px;
    }

    .fc-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
    .fc-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.28); border-radius: 999px; border: 3px solid transparent; background-clip: content-box; }
    .fc-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.45); background-clip: content-box; }
    .fc-scroll::-webkit-scrollbar-track { background: transparent; }
  `}</style>
);

/* -------------------------------------------------------------------------
   Time helpers
------------------------------------------------------------------------- */
const normalizeTime = (raw) => {
  if (!raw) return '';
  let s = String(raw).trim();
  if (s.includes('T')) s = s.split('T')[1];
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!m) return s;
  let hours = Number(m[1]);
  const minutes = m[2];
  const meridiem = (m[3] || '').toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const formatTimeDisplay = (t) => {
  if (!t) return '';
  const norm = normalizeTime(t);
  const [h, m] = norm.split(':').map(Number);
  if (isNaN(h)) return t;
  const meridiem = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${meridiem}`;
};

const to24Hour = (time) => {
  const [clock, meridiem] = time.split(' ');
  let [hours, minutes] = clock.split(':').map(Number);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

export default function App() {
  /* ---------- STATE ---------- */
  const [specialties, setSpecialties] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorReviews, setDoctorReviews] = useState({ rating_average: 0, rating_count: 0, reviews: [] });
  const [booklet, setBooklet] = useState(null);
  const [bookletLoading, setBookletLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pdfPreviewHtml, setPdfPreviewHtml] = useState(null);
  const [adminRefreshing, setAdminRefreshing] = useState(false);

  const [authView, setAuthView] = useState('login');
  const [authStep, setAuthStep] = useState('credentials');
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
  const [activeTab, setActiveTab] = useState('overview');
  const [bookletSection, setBookletSection] = useState('profile');
  const [illnessSearch, setIllnessSearch] = useState('');
  const [illnessCategory, setIllnessCategory] = useState('all');
  const [illnessDoctor, setIllnessDoctor] = useState('all');
  const [illnessYear, setIllnessYear] = useState('all');
  const [profileSurveyOpen, setProfileSurveyOpen] = useState(false);
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [profileSurveyData, setProfileSurveyData] = useState({
    fullName: '', birthDate: '', insuranceType: '', bloodType: '', allergies: '', chronicConditions: '',
  });

  const [isSymptomCheckerOpen, setIsSymptomCheckerOpen] = useState(false);
  const [symptomStep, setSymptomStep] = useState(1);
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

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-09-15');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedAppointmentToComplete, setSelectedAppointmentToComplete] = useState(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);
  const [selectedPatientBooklet, setSelectedPatientBooklet] = useState(null);
  const [recommendationDrafts, setRecommendationDrafts] = useState({});
  const [doctorView, setDoctorView] = useState('appointments');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarMode, setCalendarMode] = useState('month');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date());
  const [completionFormData, setCompletionFormData] = useState({ diagnosis: '', diagnosisType: 'other', prescription: '', notes: '' });

  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otpCode, setOtpCode] = useState('');

  const availableTimeSlots = ['09:00 AM', '10:30 AM', '01:15 PM', '03:00 PM', '04:30 PM'];

  /* ---------- API ---------- */
  const api = async (path, options = {}) => {
    const { silent, ...fetchOptions } = options;
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    if (silent && (response.status === 404 || response.status === 204)) return null;

    const responseText = await response.text();
    let body;
    try {
      body = responseText ? JSON.parse(responseText) : {};
    } catch {
      if (silent) return null;
      throw new Error(`API returned ${response.status} ${response.statusText} instead of JSON`);
    }
    if (!response.ok) {
      if (silent) return null;
      const serverMessage = body.error || 'Request failed';
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (response.status === 403) throw new Error(`Access denied: ${serverMessage}`);
      if (response.status === 409) throw new Error(`Conflict: ${serverMessage}`);
      throw new Error(serverMessage);
    }
    return body;
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const loadAppointments = useCallback(async (user = currentUser) => {
    if (!user) return;
    const query = user.role === 'Doctor' ? `doctor_id=${user.doctor_id}` : user.role === 'Patient' ? `patient_id=${user.patient_id}` : '';
    const rows = await api(`/appointments?${query}`);
    setAppointments(rows.map((row) => ({
      ...row,
      patientName: row.patient_name,
      date: row.scheduled_at.slice(0, 10),
      time: row.scheduled_at.slice(11, 16),
      location: 'FAFCare clinic',
      status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase() : 'Scheduled',
    })));
  }, [currentUser]);

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    Promise.all([api('/specialties'), api('/doctors')])
      .then(([remoteSpecialties, remoteDoctors]) => {
        setSpecialties(remoteSpecialties.map((spec) => ({ ...spec, icon: spec.name.toLowerCase().includes('heart') ? Heart : Stethoscope })));
        setDoctorsList(remoteDoctors.map((doctor) => ({ ...doctor, specId: doctor.spec_id })));
      })
      .catch((error) => setNotification(`API unavailable: ${error.message}`));
  }, []);

  useEffect(() => { loadAppointments().catch(() => {}); }, [loadAppointments]);

  useEffect(() => {
    if (currentUser?.role !== 'Doctor') {
      setDoctorReviews({ rating_average: 0, rating_count: 0, reviews: [] });
      return;
    }
    api('/doctor/reviews', { silent: true })
      .then((data) => {
        setDoctorReviews({
          rating_average: data?.rating_average ?? 0,
          rating_count: data?.rating_count ?? 0,
          reviews: Array.isArray(data?.reviews) ? data.reviews : [],
        });
      })
      .catch(() => setDoctorReviews({ rating_average: 0, rating_count: 0, reviews: [] }));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.patient_id) {
      setBooklet(null);
      setAuditLogs([]);
      return;
    }
    setBookletLoading(true);
    Promise.all([
      api(`/patient/booklet/${currentUser.patient_id}`, { silent: true }),
      api('/patient/audit-logs', { silent: true }),
    ])
      .then(([bookletData, logs]) => {
        setBooklet(bookletData || null);
        setAuditLogs(Array.isArray(logs) ? logs : []);
      })
      .catch(() => { setBooklet(null); setAuditLogs([]); })
      .finally(() => setBookletLoading(false));
  }, [currentUser]);

  /* ---------- HANDLERS ---------- */
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleProfileSurveyChange = (e) => setProfileSurveyData({ ...profileSurveyData, [e.target.name]: e.target.value });

  const handleProfileSurveySubmit = async (e) => {
    e.preventDefault();
    try {
      const dateParts = profileSurveyData.birthDate.split('.');
      const birthDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : profileSurveyData.birthDate;
      await api(`/patients/${currentUser.patient_id}/profile`, {
        method: 'PATCH',
        body: JSON.stringify({ ...profileSurveyData, birthDate }),
      });
      const updatedBooklet = await api(`/patient/booklet/${currentUser.patient_id}`, { silent: true });
      setBooklet(updatedBooklet || booklet);
      setCurrentUser({ ...currentUser, fullName: profileSurveyData.fullName });
      setProfileSurveyOpen(false);
      setNotification('Your medical profile was saved successfully.');
      setTimeout(() => setNotification(null), 4000);
    } catch (error) { setNotification(error.message); }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    try {
      await api(`/doctors/${reviewAppointment.doctor_id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ appointment_id: reviewAppointment.id, rating: reviewRating, comment: reviewComment }),
      });
      await loadAppointments(currentUser);
      setReviewAppointment(null);
      setReviewComment('');
      setReviewRating(5);
      setNotification('Thank you. Your review was submitted.');
      setTimeout(() => setNotification(null), 4000);
    } catch (error) { setNotification(`Review could not be submitted: ${error.message}`); }
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
        setNotification(authResponse.otpCode ? `Development OTP: ${authResponse.otpCode}` : 'Enter the 6-digit verification code to finish signing in.');
        setFormData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
      } else {
        const authResponse = await api('/auth/login-step1', { method: 'POST', body: JSON.stringify({ email: formData.email, password: formData.password }) });
        setMfaToken(authResponse.mfaToken);
        setPendingAuthUser(authResponse.user);
        setAuthStep('mfa');
        setOtpCode('');
        setNotification(authResponse.otpCode ? `Development OTP: ${authResponse.otpCode}` : 'Enter the 6-digit verification code to finish signing in.');
      }
    } catch (error) { setNotification(error.message); }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    try {
      const authResponse = await api('/auth/verify-mfa', { method: 'POST', body: JSON.stringify({ mfaToken, otpCode }) });
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
      const response = await api('/auth/resend-mfa', { method: 'POST', body: JSON.stringify({ mfaToken }) });
      setMfaToken(response.mfaToken);
      setOtpCode('');
      setNotification(response.otpCode ? `Development OTP: ${response.otpCode}` : 'A new verification code was generated.');
    } catch (error) { setNotification(error.message); }
  };

  const handleViewPatientProfile = async (appointment) => {
    try {
      const [profile, medicalBooklet] = await Promise.all([
        api(`/patients/${appointment.patient_id}`, { silent: true }),
        api(`/patient/booklet/${appointment.patient_id}`, { silent: true }),
      ]);
      setSelectedPatientProfile(profile || {});
      setSelectedPatientBooklet(medicalBooklet || { verified_records: [], active_prescriptions: [] });
      setRecommendationDrafts(Object.fromEntries(
        ((medicalBooklet?.verified_records) || []).map((record) => [record.id, record.recommendations || '']),
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
        verified_records: (bookletData?.verified_records || []).map((record) => record.id === recordId ? updatedRecord : record),
      }));
      setNotification('Recommendation updated successfully.');
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      setNotification(`Recommendation could not be updated: ${error.message}`);
    }
  };

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

  const handleProceedToBookingFromSymptom = () => {
    if (!selectedSymptom) return;
    const matchedSpec = specialties.find(spec => spec.name.toLowerCase().includes(selectedSymptom.keyword)) || specialties[0];
    setSelectedSpec(matchedSpec);
    setIsSymptomCheckerOpen(false);
    setBookingStep(2);
    setIsBookingOpen(true);
    setSymptomStep(1);
    setSelectedSymptom(null);
  };

  const handleAdminRefresh = async () => {
    setAdminRefreshing(true);
    try {
      await loadAppointments(currentUser);
    } catch (err) {
      setNotification(`Refresh failed: ${err.message}`);
    } finally {
      setTimeout(() => setAdminRefreshing(false), 600);
    }
  };

  /* ---------- DERIVED ---------- */
  const userAppointments = appointments.filter(a => a.patientName === currentUser?.fullName);
  const upcomingAppointments = userAppointments.filter(a => a.status !== 'Completed');
  const completedAppointments = userAppointments.filter(a => a.status === 'Completed');
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
  const illnessYears = [...new Set(bookletRecords.map((record) => new Date(record.created_at).getFullYear()).filter(Boolean))].sort((a, b) => b - a);
  const illnessDoctorSpecialties = [...new Set(bookletRecords.map((record) => record.doctor_specialty).filter(Boolean))].sort();

  const openMedicalBookletPdf = async (showPreview = true) => {
    const latestBooklet = currentUser?.patient_id
      ? await api(`/patient/booklet/${currentUser.patient_id}`, { silent: true }).catch(() => booklet)
      : booklet;
    const latestPatient = latestBooklet?.patient || bookletPatient;
    const latestRecords = latestBooklet?.verified_records || bookletRecords;
    const latestPrescriptions = latestBooklet?.active_prescriptions || activePrescriptions;
    const escapeHtml = (value) => String(value ?? 'Not recorded').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]);
    const patientName = latestPatient.full_name || currentUser.fullName;
    const records = latestRecords.map((r) => `
      <article class="record"><div class="record-heading"><strong>${escapeHtml(r.diagnosis)}</strong><span>${escapeHtml(formatDate(r.created_at))}</span></div>
        ${r.verified_by_doctor ? `<p class="muted">Doctor: ${escapeHtml(r.verified_by_doctor)}</p>` : ''}
        ${r.notes ? `<p><b>Notes:</b> ${escapeHtml(r.notes)}</p>` : ''}
        ${r.recommendations ? `<p><b>Recommendations:</b> ${escapeHtml(r.recommendations)}</p>` : ''}
      </article>`).join('') || '<p class="muted">No verified medical records.</p>';
    const prescriptions = latestPrescriptions.map((p) => `
      <article class="record"><div class="record-heading"><strong>${escapeHtml(p.medication_name)}</strong><span>Active</span></div>
        <p>${escapeHtml(p.dosage_instructions)}</p><p class="muted">${escapeHtml(p.duration_days ? `${p.duration_days} days` : 'Continuous')}${p.doctor_name ? ` • Issued by ${escapeHtml(p.doctor_name)}` : ''}</p>
      </article>`).join('') || '<p class="muted">No active prescriptions.</p>';
    const bookletHtml = `<!doctype html><html><head><title>FAFCare Medical Booklet - ${escapeHtml(patientName)}</title><style>
      *{box-sizing:border-box}body{margin:0;background:#f1f5f9;color:#172b2d;font-family:Arial,sans-serif;line-height:1.45}.page{max-width:850px;margin:28px auto;background:#fff;padding:42px;box-shadow:0 4px 20px #0f172a1a}.cover{background:#103f42;color:#fff;padding:28px 32px;border-radius:14px;margin-bottom:24px}.eyebrow{color:#b8e3dc;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase}.cover h1{font-size:30px;margin:7px 0 24px}.holder{border-top:1px solid #ffffff33;padding-top:18px}.holder-label{color:#b8e3dc;font-size:10px;text-transform:uppercase;letter-spacing:1px}.holder strong{display:block;font-size:20px;margin-top:3px}.meta{color:#d8f3ee;font-size:12px;margin-top:10px}.section{border-top:2px solid #0f766e;margin-top:24px;padding-top:16px}.section h2{font-size:20px;margin:0 0 14px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field{border-bottom:1px solid #e2e8f0;padding-bottom:8px}.label{color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px}.value{font-weight:700;margin-top:3px}.record{border:1px solid #dbe4e5;border-left:4px solid #10b981;border-radius:8px;padding:12px 14px;margin:10px 0}.record-heading{display:flex;justify-content:space-between;gap:16px}.record-heading span,.muted{color:#64748b;font-size:12px}.record p{margin:7px 0 0;font-size:13px}@media print{body{background:#fff}.page{margin:0;max-width:none;box-shadow:none;padding:20px}.cover{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style></head><body><main class="page"><section class="cover"><div class="eyebrow">Republic of Moldova • FAFcare Health System</div><div class="eyebrow" style="margin-top:20px">Electronic Health Passport & Record</div><h1>Individual Medical Booklet</h1><div class="holder"><div class="holder-label">Authorized holder</div><strong>${escapeHtml(patientName)}</strong><div class="meta">Patient ID: PAT-${escapeHtml(String(latestPatient.id || currentUser.patient_id).slice(0, 8))} • Signed & secured</div></div></section>
      <section class="section"><h2>Patient Personal Record</h2><div class="grid"><div class="field"><div class="label">Full name</div><div class="value">${escapeHtml(patientName)}</div></div><div class="field"><div class="label">Date of birth</div><div class="value">${escapeHtml(formatDate(latestPatient.birth_date))}</div></div><div class="field"><div class="label">Medical insurance</div><div class="value">${escapeHtml(latestPatient.insurance_type)}</div></div><div class="field"><div class="label">Blood type / Rh</div><div class="value">${escapeHtml(latestPatient.blood_type)}</div></div><div class="field"><div class="label">Known allergies</div><div class="value">${escapeHtml(latestPatient.allergies || 'None recorded')}</div></div><div class="field"><div class="label">Chronic conditions</div><div class="value">${escapeHtml(latestPatient.chronic_conditions || 'None recorded')}</div></div></div></section>
      <section class="section"><h2>Illness History & Diagnoses</h2>${records}</section><section class="section"><h2>Active Prescriptions</h2>${prescriptions}</section></main></body></html>`;
    if (showPreview) setPdfPreviewHtml(bookletHtml);
    return bookletHtml;
  };

  /* ---------- SHARED CLASSES ---------- */
  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 ease-in-out hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10';
  const labelClass = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500';
  const primaryButtonClass = 'group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_10px_22px_-12px_rgba(5,150,105,0.9)] ring-1 ring-inset ring-white/20 transition-all duration-200 ease-in-out hover:from-emerald-500 hover:to-emerald-700 hover:shadow-[0_2px_4px_rgba(15,23,42,0.1),0_16px_30px_-14px_rgba(5,150,105,0.95)] active:scale-[0.99]';
  const ghostButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 fc-e1 transition-all duration-200 ease-in-out hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]';
  const surfaceClass = 'rounded-2xl border border-slate-200/70 bg-white fc-e2';
  const badgeClass = 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700';
  const microLabel = 'text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400';

  /* =========================================================================
     1. LOGIN SCREEN
     ========================================================================= */
  if (!currentUser) {
    return (
      <>
        <GlobalStyles />
        <div className="relative min-h-screen fc-canvas antialiased">
          <div className="fc-auth-field" aria-hidden="true">
            <div className="fc-orb absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="fc-orb-slow absolute right-[-4rem] top-1/3 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="fc-orb absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
            <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_minmax(0,460px)] lg:gap-16">
              <section className="hidden lg:block">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1.5 fc-e1 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Republic of Moldova health network</span>
                </div>
                <h1 className="font-display mt-7 text-[2.9rem] font-bold leading-[1.06] text-slate-900">
                  Your medical record,<br />in one secure place.
                </h1>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
                  Book consultations, read verified diagnoses, and carry your electronic health passport wherever you receive care.
                </p>
                <dl className="mt-10 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/70 fc-e1">
                  {[
                    { k: 'Consultations', v: 'Verified by doctors', icon: FileCheck },
                    { k: 'Prescriptions', v: 'Always current', icon: Pill },
                    { k: 'Access', v: 'Two-step secured', icon: ShieldCheck },
                  ].map(({ k, v, icon: Icon }) => (
                    <div key={k} className="bg-white/80 p-4 backdrop-blur-sm">
                      <Icon className="h-4 w-4 text-emerald-600" />
                      <dt className="mt-3 text-[13px] font-semibold text-slate-900">{k}</dt>
                      <dd className="mt-0.5 text-xs leading-snug text-slate-500">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <div className="fc-rise w-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_30px_80px_-40px_rgba(11,59,62,0.55)] backdrop-blur-xl fc-e3">
                <div className="fc-weave relative overflow-hidden fc-brand px-8 py-9 text-center text-white">
                  <div className="pointer-events-none absolute -right-14 -top-16 text-white/[0.06]"><ShieldCheck className="h-56 w-56" /></div>
                  <div className="pointer-events-none absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />
                  {(authView !== 'login' || authStep === 'mfa') && (
                    <button type="button" onClick={() => { setAuthView('login'); setAuthStep('credentials'); setMfaToken(''); setPendingAuthUser(null); setOtpCode(''); setNotification(null); }} className="absolute left-4 top-5 rounded-lg p-2 text-white/70 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  )}
                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-2xl border border-white/20 bg-[#1a1a1a] p-2 fc-e1">
                    <FafLogo className="h-full w-full" dark={false} />
                  </div>
                  <div className="relative mt-5 flex items-center justify-center gap-2">
                    <span className="font-display text-2xl font-extrabold tracking-tight">FAF</span>
                    <span className="font-display text-2xl font-extrabold tracking-tight text-emerald-300">care</span>
                  </div>
                  <p className="relative mt-2 text-sm text-emerald-100/80">
                    {authStep === 'mfa' ? 'Confirm it is you to continue' : authView === 'login' ? 'Sign in to your FAFCare account' : 'Create your patient account'}
                  </p>
                  <div className="relative mt-5 flex items-center justify-center gap-2">
                    <span className="h-px w-10 bg-white/20" />
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/90 backdrop-blur-md">
                      <ShieldCheck className="h-3 w-3" /> Secure portal
                    </span>
                    <span className="h-px w-10 bg-white/20" />
                  </div>
                </div>

                <div className="p-8">
                  {notification && (
                    <div className="fc-rise mb-6 flex items-start gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/80 p-3.5 text-sm text-emerald-800">
                      <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="leading-relaxed">{notification}</span>
                    </div>
                  )}

                  {authStep === 'mfa' ? (
                    <form onSubmit={handleVerifyMfa} className="space-y-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className={microLabel}>Verification sent to</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{pendingAuthUser?.email || formData.email}</p>
                      </div>
                      <div>
                        <label className={labelClass}>6-digit code</label>
                        <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required autoFocus value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className={`${inputClass} tnum py-3.5 text-center text-xl font-semibold tracking-[0.5em]`} />
                      </div>
                      <button type="submit" className={primaryButtonClass}>Verify and continue</button>
                      <button type="button" onClick={handleResendMfa} className="w-full py-1 text-sm font-medium text-emerald-700 transition-all duration-200 ease-in-out hover:text-emerald-800 hover:underline">I didn't get the code</button>
                    </form>
                  ) : (
                    <form onSubmit={handleSubmitAuth} className="space-y-4">
                      {authView === 'register' && (
                        <div>
                          <label className={labelClass}>Patient full name</label>
                          <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="John Smith" className={inputClass} />
                        </div>
                      )}
                      <div>
                        <label className={labelClass}>Email</label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Password</label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className={`${inputClass} pl-10 pr-10`} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      {authView === 'register' && (
                        <div>
                          <label className={labelClass}>Confirm password</label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={`${inputClass} pl-10`} />
                          </div>
                        </div>
                      )}
                      <div className="pt-2">
                        <button type="submit" className={primaryButtonClass}>
                          {authView === 'login' ? 'Log in' : 'Create account'}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">or</span>
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
                      <button type="button" onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')} className={`${ghostButtonClass} w-full`}>
                        {authView === 'login' ? 'Register new patient' : 'Back to login'}
                      </button>
                    </form>
                  )}

                  <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <Lock className="h-3 w-3" /> Protected by two-step verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* =========================================================================
     2. PATIENT PROFILE SURVEY
     ========================================================================= */
  if (currentUser.role === 'Patient' && profileSurveyOpen) {
    const surveyFilled = Object.values(profileSurveyData).filter((v) => String(v).trim()).length;
    return (
      <>
        <GlobalStyles />
        <div className="relative min-h-screen fc-canvas antialiased">
          <div className="fc-field" aria-hidden="true" />
          <div className="relative z-10 flex min-h-screen items-center justify-center p-4 py-10">
            <div className="fc-rise w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white fc-e3">
              <div className="fc-weave relative overflow-hidden fc-brand p-7 text-white sm:p-9">
                <div className="pointer-events-none absolute -right-10 -top-12 text-white/[0.06]"><User className="h-48 w-48" /></div>
                <div className="relative flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-[#1a1a1a] p-1.5">
                    <FafLogo className="h-full w-full" dark={false} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/90">Patient personal record</p>
                    <h1 className="font-display mt-1 text-2xl font-bold sm:text-3xl">Complete your medical profile</h1>
                  </div>
                </div>
                <p className="relative mt-3 max-w-lg text-sm leading-relaxed text-emerald-100/80">This information is saved to your medical card and shown on your dashboard.</p>
                <div className="relative mt-6 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-emerald-400 transition-all duration-300 ease-out" style={{ width: `${(surveyFilled / 6) * 100}%` }} />
                  </div>
                  <span className="tnum text-[11px] font-semibold text-emerald-100/90">{surveyFilled} of 6</span>
                </div>
              </div>

              <form onSubmit={handleProfileSurveySubmit} className="space-y-7 p-6 sm:p-9">
                <fieldset className="space-y-5">
                  <legend className="flex w-full items-center gap-3 pb-1">
                    <span className="text-sm font-semibold text-slate-900">Identity</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </legend>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Full name</label>
                      <input type="text" name="fullName" required value={profileSurveyData.fullName} onChange={handleProfileSurveyChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Date of birth</label>
                      <input type="text" name="birthDate" required value={profileSurveyData.birthDate} onChange={handleProfileSurveyChange} placeholder="DD.MM.YYYY" pattern="[0-9]{2}\.[0-9]{2}\.[0-9]{4}" inputMode="numeric" className={`${inputClass} tnum`} />
                    </div>
                    <div>
                      <label className={labelClass}>Medical insurance</label>
                      <input type="text" name="insuranceType" required value={profileSurveyData.insuranceType} onChange={handleProfileSurveyChange} className={inputClass} />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-5">
                  <legend className="flex w-full items-center gap-3 pb-1">
                    <span className="text-sm font-semibold text-slate-900">Clinical baseline</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </legend>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Blood type / Rh</label>
                      <select name="bloodType" required value={profileSurveyData.bloodType} onChange={handleProfileSurveyChange} className={inputClass}>
                        <option value="">Select blood type</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Known allergies & intolerances</label>
                      <input type="text" name="allergies" required value={profileSurveyData.allergies} onChange={handleProfileSurveyChange} placeholder="Penicillin, pollen…" className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Chronic conditions</label>
                      <textarea name="chronicConditions" required value={profileSurveyData.chronicConditions} onChange={handleProfileSurveyChange} rows={3} placeholder="List ongoing conditions, or write “None”." className={`${inputClass} resize-y`} />
                    </div>
                  </div>
                </fieldset>

                <button type="submit" className={primaryButtonClass}>Save medical profile</button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* =========================================================================
     3. ADMIN DASHBOARD
     ========================================================================= */
  if (currentUser.role === 'Admin') {
    const totalAppointments = appointments.length;
    const adminCompletedAppointments = appointments.filter(a => a.status === 'Completed').length;
    const adminUpcomingAppointments = totalAppointments - adminCompletedAppointments;
    const uniquePatients = new Set(appointments.map(a => a.patientName)).size;
    const uniqueDoctors = new Set(appointments.map(a => a.doctor)).size;

    const dayBuckets = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dayBuckets[d.toISOString().slice(0, 10)] = 0;
    }
    appointments.forEach(a => { if (dayBuckets[a.date] !== undefined) dayBuckets[a.date] += 1; });
    const daySeries = Object.entries(dayBuckets).map(([date, count]) => ({ date, count }));
    const maxDayCount = Math.max(...daySeries.map(d => d.count), 1);

    const statusCounts = appointments.reduce((acc, a) => {
      const s = a.status || 'Scheduled';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const statusSeries = Object.entries(statusCounts).map(([label, count]) => ({ label, count }));
    const statusTotal = statusSeries.reduce((s, x) => s + x.count, 0) || 1;
    const statusColors = { 'Scheduled': '#10b981', 'Confirmed': '#0d9488', 'Completed': '#64748b', 'Cancelled': '#f43f5e' };

    const appointmentsByDoctor = appointments.reduce((acc, app) => {
      const key = app.doctor || 'Unassigned';
      if (!acc[key]) acc[key] = 0;
      acc[key] += 1;
      return acc;
    }, {});
    const doctorLoadList = Object.entries(appointmentsByDoctor)
      .map(([doctor, count]) => ({ doctor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const maxDoctorLoad = Math.max(...doctorLoadList.map(d => d.count), 1);

    const recentAppointments = [...appointments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    const specialtyCount = specialties.map(spec => ({
      name: spec.name,
      count: doctorsList.filter(d => d.specId === spec.id).length,
    })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

    const doctorRatingMap = {};
    (doctorReviews?.reviews || []).forEach(r => {
      const id = r.doctor_id;
      if (!doctorRatingMap[id]) doctorRatingMap[id] = { sum: 0, count: 0 };
      doctorRatingMap[id].sum += Number(r.rating || 0);
      doctorRatingMap[id].count += 1;
    });
    const topRatedDoctors = doctorsList
      .map(d => {
        const stat = doctorRatingMap[d.id];
        return {
          ...d,
          avg: stat ? stat.sum / stat.count : Number(d.rating_average || 0),
          count: stat ? stat.count : Number(d.rating_count || 0),
        };
      })
      .filter(d => d.count > 0)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    const donutRadius = 60;
    const donutCircumference = 2 * Math.PI * donutRadius;
    let donutOffset = 0;

    return (
      <>
        <GlobalStyles />
        <div className="relative flex min-h-screen flex-col fc-canvas antialiased">
          <div className="fc-field" aria-hidden="true" />

          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-xl fc-e1">
                  <FafLogo className="h-full w-full" dark />
                </div>
                <div className="leading-tight">
                  <span className="font-display block text-[15px] font-bold text-slate-900">
                    FAF<span className="text-emerald-600">care</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Administration</span>
                </div>
                <span className="ml-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">Admin</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 sm:inline-flex">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="fc-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  </span>
                  Live
                </span>
                <button
                  onClick={handleAdminRefresh}
                  disabled={adminRefreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 fc-e1 transition-all duration-200 ease-in-out hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${adminRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button onClick={handleLogout} className="rounded-lg p-2 text-slate-500 transition-all duration-200 ease-in-out hover:bg-rose-50 hover:text-rose-600">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">
            {notification && (
              <div className="fc-rise flex items-start gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/80 p-4 text-sm font-medium text-emerald-800 backdrop-blur-sm">
                <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-600" />
                <span className="leading-relaxed">{notification}</span>
              </div>
            )}

            <section className="fc-weave relative overflow-hidden rounded-3xl border border-teal-900/10 fc-brand p-6 text-white fc-e3 sm:p-8">
              <div className="pointer-events-none absolute -right-12 -top-16 text-white/[0.05]"><Activity className="h-64 w-64" /></div>
              <div className="relative flex flex-wrap items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/90 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="fc-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    Live system
                  </div>
                  <h2 className="font-display mt-4 text-3xl font-bold sm:text-4xl">Operations dashboard</h2>
                  <p className="mt-2 max-w-lg text-sm text-emerald-100/80">
                    Real-time view of the FAFCare network — doctors, patients and appointment flow.
                  </p>
                </div>
                <dl className="grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:w-auto sm:grid-cols-4">
                  {[
                    { k: 'Doctors', v: doctorsList.length },
                    { k: 'Specialties', v: specialties.length },
                    { k: 'Appointments', v: totalAppointments },
                    { k: 'Patients', v: uniquePatients },
                  ].map(({ k, v }) => (
                    <div key={k} className="px-5 py-3.5 sm:min-w-[100px]">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">{k}</dt>
                      <dd className="font-display tnum mt-1 text-2xl font-bold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                { label: 'Completed consultations', value: adminCompletedAppointments, icon: UserCheck, tint: 'bg-emerald-50 text-emerald-600 ring-emerald-100', trend: 'Signed off' },
                { label: 'Upcoming consultations', value: adminUpcomingAppointments, icon: CalendarClock, tint: 'bg-teal-50 text-teal-700 ring-teal-100', trend: 'In pipeline' },
                { label: 'Active doctors', value: uniqueDoctors, icon: Stethoscope, tint: 'bg-slate-100 text-slate-700 ring-slate-200', trend: `of ${doctorsList.length} registered` },
              ].map(({ label, value, icon: Icon, tint, trend }) => (
                <div key={label} className={`${surfaceClass} group relative overflow-hidden p-6 transition-all duration-200 ease-in-out hover:-translate-y-0.5`}>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={microLabel}>{label}</p>
                      <p className="font-display tnum mt-4 text-4xl font-bold text-slate-900">{value}</p>
                      <p className="mt-1.5 text-xs font-medium text-slate-500">{trend}</p>
                    </div>
                    <div className={`rounded-xl p-2.5 ring-1 ring-inset ${tint}`}><Icon className="h-5 w-5" /></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <section className={`${surfaceClass} overflow-hidden`}>
                <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 ring-1 ring-inset ring-teal-100"><BarChart3 className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Appointments · last 14 days</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Daily volume across the network</p>
                    </div>
                  </div>
                  <span className="tnum rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {daySeries.reduce((s, d) => s + d.count, 0)} total
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex h-44 items-end gap-1.5">
                    {daySeries.map(({ date, count }, idx) => {
                      const heightPct = (count / maxDayCount) * 100;
                      const dayLabel = new Date(date).toLocaleDateString('en-GB', { day: '2-digit' });
                      return (
                        <div key={date} className="group flex flex-1 flex-col items-center gap-1.5">
                          <div className="relative flex w-full flex-1 items-end">
                            <div
                              className="fc-bar w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-200 ease-in-out group-hover:from-emerald-600 group-hover:to-emerald-500"
                              style={{ height: `${Math.max(heightPct, 3)}%`, animationDelay: `${idx * 30}ms` }}
                              title={`${date}: ${count} appointment${count !== 1 ? 's' : ''}`}
                            />
                          </div>
                          <span className="tnum text-[9px] font-medium text-slate-400">{dayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className={`${surfaceClass} overflow-hidden`}>
                <div className="flex items-center gap-3 border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                  <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 ring-1 ring-inset ring-teal-100"><PieChart className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Status breakdown</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Current appointment states</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-5 p-5 sm:flex-row">
                  <div className="relative h-40 w-40 shrink-0">
                    <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                      <circle cx="80" cy="80" r={donutRadius} fill="none" stroke="#f1f5f9" strokeWidth="18" />
                      {statusSeries.map((s) => {
                        const fraction = s.count / statusTotal;
                        const dash = fraction * donutCircumference;
                        const offset = donutOffset;
                        donutOffset += dash;
                        const color = statusColors[s.label] || '#94a3b8';
                        return (
                          <circle
                            key={s.label}
                            cx="80" cy="80" r={donutRadius} fill="none"
                            stroke={color}
                            strokeWidth="18"
                            strokeDasharray={`${dash} ${donutCircumference - dash}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="butt"
                          />
                        );
                      })}
                    </svg>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display tnum text-3xl font-bold text-slate-900">{statusTotal}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total</span>
                    </div>
                  </div>
                  <ul className="w-full space-y-2.5">
                    {statusSeries.map((s) => {
                      const pct = ((s.count / statusTotal) * 100).toFixed(0);
                      const color = statusColors[s.label] || '#94a3b8';
                      return (
                        <li key={s.label} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                            <span className="text-sm font-medium text-slate-700">{s.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="tnum text-sm font-semibold text-slate-900">{s.count}</span>
                            <span className="tnum text-[11px] text-slate-400">{pct}%</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
              <section className={`${surfaceClass} overflow-hidden`}>
                <div className="flex items-center gap-3 border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                  <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 ring-1 ring-inset ring-teal-100"><TrendingUp className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Doctor workload</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Appointments per clinician</p>
                  </div>
                </div>
                <div className="p-5">
                  {doctorLoadList.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">No appointment data yet.</p>
                  ) : (
                    <ul className="space-y-4">
                      {doctorLoadList.map(({ doctor, count }) => (
                        <li key={doctor}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-semibold text-slate-800">{doctor}</span>
                            <span className="tnum text-xs font-semibold text-slate-500">{count}</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500" style={{ width: `${(count / maxDoctorLoad) * 100}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <section className={`${surfaceClass} overflow-hidden`}>
                <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 ring-1 ring-inset ring-teal-100"><ClipboardList className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Recent appointments</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Latest activity across the network</p>
                    </div>
                  </div>
                  <span className="tnum rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">{totalAppointments}</span>
                </div>
                {recentAppointments.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Calendar className="h-5 w-5" /></div>
                    <p className="text-sm font-medium text-slate-700">No appointments yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentAppointments.map((app) => (
                      <div key={app.id} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors duration-200 hover:bg-slate-50/70">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-teal-50 to-teal-100 text-[11px] font-semibold text-teal-800 ring-1 ring-inset ring-teal-200/70">
                            {(app.patientName || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{app.patientName}</p>
                            <p className="truncate text-[11px] text-slate-500">{app.doctor || 'Unassigned'}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="tnum hidden text-xs text-slate-500 sm:inline">{app.date}</span>
                          <span className={`tnum rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            app.status === 'Completed'
                              ? 'border border-slate-200 bg-slate-50 text-slate-600'
                              : 'border border-emerald-200/80 bg-emerald-50 text-emerald-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className={`${surfaceClass} overflow-hidden`}>
                <div className="flex items-center gap-3 border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 ring-1 ring-inset ring-amber-100"><Award className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Top rated doctors</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Based on patient reviews</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {topRatedDoctors.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-slate-500">No reviews yet.</p>
                  ) : (
                    topRatedDoctors.map((doc, idx) => (
                      <div key={doc.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{idx + 1}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{doc.name}</p>
                            <p className="truncate text-[11px] text-slate-500">{doc.spec || '—'}</p>
                          </div>
                        </div>
                        <StarRating value={doc.avg} count={doc.count} showValue size="sm" />
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className={`${surfaceClass} overflow-hidden`}>
                <div className="flex items-center gap-3 border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                  <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 ring-1 ring-inset ring-teal-100"><Stethoscope className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Doctors by specialty</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Distribution across the registry</p>
                  </div>
                </div>
                <div className="p-5">
                  {specialtyCount.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">No specialty data available.</p>
                  ) : (
                    <ul className="space-y-4">
                      {specialtyCount.map((spec) => {
                        const max = Math.max(...specialtyCount.map(s => s.count), 1);
                        return (
                          <li key={spec.name}>
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate text-sm font-semibold text-slate-800">{spec.name}</span>
                              <span className="tnum text-xs font-semibold text-slate-500">{spec.count}</span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-500" style={{ width: `${(spec.count / max) * 100}%` }} />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          </main>
        </div>
      </>
    );
  }

  /* =========================================================================
     4. DOCTOR DASHBOARD
     ========================================================================= */
  if (currentUser.role === 'Doctor') {
    const doctorAppointments = appointments.filter((a) => a.doctor === currentUser.fullName);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const appointmentDate = (app) => new Date(`${app.date}T${app.time || '00:00'}`);
    const pendingDoctorAppointments = doctorAppointments.filter((app) => app.status !== 'Completed' && appointmentDate(app) < startOfToday);
    const completedDoctorAppointments = doctorAppointments.filter((app) => app.status === 'Completed');
    const upcomingDoctorAppointments = doctorAppointments.filter((app) => new Date(`${app.date}T${app.time || '00:00'}`) >= startOfToday);
    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    const calendarDays = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => {
      const dayNumber = index - firstWeekday + 1;
      return dayNumber > 0 ? new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNumber) : null;
    });
    const appointmentsForDay = (day) => doctorAppointments.filter((app) => app.date === day.toISOString().slice(0, 10));
    const calendarTitle = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const startOfWeek = new Date(selectedCalendarDate);
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
    const calendarWeekDays = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);
      return day;
    });
    const selectedDayAppointments = appointmentsForDay(selectedCalendarDate);
    const setCalendarDate = (date) => {
      setSelectedCalendarDate(date);
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    };
    const moveCalendar = (amount) => {
      const nextDate = new Date(selectedCalendarDate);
      if (calendarMode === 'month') nextDate.setMonth(nextDate.getMonth() + amount);
      if (calendarMode === 'week') nextDate.setDate(nextDate.getDate() + amount * 7);
      if (calendarMode === 'day') nextDate.setDate(nextDate.getDate() + amount);
      setCalendarDate(nextDate);
    };
    const calendarRangeTitle = calendarMode === 'month'
      ? calendarTitle
      : calendarMode === 'week'
        ? `${calendarWeekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${calendarWeekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
      <>
        <GlobalStyles />
        <div className="relative flex min-h-screen flex-col fc-canvas antialiased">
          <div className="fc-field" aria-hidden="true" />
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-xl fc-e1">
                  <FafLogo className="h-full w-full" dark />
                </div>
                <div className="leading-tight">
                  <span className="font-display block text-[15px] font-bold text-slate-900">
                    FAF<span className="text-emerald-600">care</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Clinician workspace</span>
                </div>
                <span className="ml-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Doctor</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-900">{currentUser.fullName}</p>
                  <p className="text-[11px] leading-tight text-slate-500">{currentUser.specialty}</p>
                </div>
                <button onClick={handleLogout} className="rounded-lg p-2 text-slate-500 transition-all duration-200 ease-in-out hover:bg-rose-50 hover:text-rose-600">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">
            {notification && (
              <div className="fc-rise flex items-start gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/80 p-4 text-sm font-medium text-emerald-800 backdrop-blur-sm">
                <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-600" />
                <span className="leading-relaxed">{notification}</span>
              </div>
            )}

            <section className="fc-weave relative overflow-hidden rounded-3xl border border-teal-900/10 fc-brand p-6 text-white fc-e3 sm:p-8">
              <div className="pointer-events-none absolute -right-12 -top-16 text-white/[0.05]"><Stethoscope className="h-64 w-64" /></div>
              <div className="relative flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/90">Clinician dashboard</p>
                  <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">{currentUser.fullName}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="text-sm text-emerald-100/80">{currentUser.specialty}</p>
                    {doctorReviews.rating_count > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-50 backdrop-blur-md">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {Number(doctorReviews.rating_average || 0).toFixed(1)} · {doctorReviews.rating_count} review{doctorReviews.rating_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <dl className="flex gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">
                  {[
                    { k: 'Today', v: appointmentsForDay(today).length },
                    { k: 'Upcoming', v: upcomingDoctorAppointments.length },
                    { k: 'Completed', v: completedDoctorAppointments.length },
                  ].map(({ k, v }) => (
                    <div key={k} className="min-w-[100px] px-5 py-3.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">{k}</dt>
                      <dd className="font-display tnum mt-1 text-2xl font-bold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {doctorReviews.rating_count > 0 && (
              <section className={`${surfaceClass} overflow-hidden`}>
                <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 ring-1 ring-inset ring-amber-100"><Star className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Patient reviews</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Feedback from completed consultations</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{doctorReviews.rating_count} total</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {doctorReviews.reviews.map((review) => (
                    <article key={review.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800">{review.patient_name}</p>
                        <StarRating value={review.rating} showValue size="sm" />
                      </div>
                      {review.comment && <p className="mt-2 text-sm text-slate-600">{review.comment}</p>}
                      <p className="mt-2 text-xs text-slate-400">{formatDate(review.created_at)}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 fc-e2">
              <div className="flex gap-2">
                <button onClick={() => setDoctorView('calendar')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ease-in-out ${doctorView === 'calendar' ? 'bg-teal-800 text-white fc-e1' : 'text-slate-600 hover:bg-slate-100'}`}><Calendar className="h-4 w-4" /> Calendar</button>
                <button onClick={() => setDoctorView('appointments')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ease-in-out ${doctorView === 'appointments' ? 'bg-teal-800 text-white fc-e1' : 'text-slate-600 hover:bg-slate-100'}`}><Users className="h-4 w-4" /> Consultations</button>
                <button onClick={() => setDoctorView('completed')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ease-in-out ${doctorView === 'completed' ? 'bg-teal-800 text-white fc-e1' : 'text-slate-600 hover:bg-slate-100'}`}><Check className="h-4 w-4" /> Completed</button>
              </div>
              <p className="tnum text-xs font-semibold text-slate-500">{doctorView === 'completed' ? completedDoctorAppointments.length : pendingDoctorAppointments.length} consultation(s)</p>
            </div>

            {(doctorView === 'appointments' || doctorView === 'completed') && (
              <div className={`${surfaceClass} overflow-hidden`}>
                <div className="border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-900">{doctorView === 'completed' ? 'Completed consultations' : 'Consultations requiring recommendations'}</h3>
                </div>

                {(doctorView === 'completed' ? completedDoctorAppointments : pendingDoctorAppointments).length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Calendar className="h-6 w-6" /></div>
                    <p className="text-sm font-medium text-slate-700">{doctorView === 'completed' ? 'No completed consultations yet.' : 'No consultations require recommendations right now.'}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {(doctorView === 'completed' ? completedDoctorAppointments : pendingDoctorAppointments).map((app) => (
                      <div key={app.id} className="flex flex-col gap-4 p-5 transition-all duration-200 ease-in-out hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-teal-50 to-teal-100 text-sm font-semibold text-teal-800 ring-1 ring-inset ring-teal-200/70">
                            {app.patientName.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-slate-900">{app.patientName}</h4>
                            <p className="text-xs text-slate-500">Appointment: {app.date} at {app.time}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{app.location}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleViewPatientProfile(app)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 fc-e1 transition-all duration-200 ease-in-out hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                          >
                            View patient profile
                          </button>
                          {doctorView !== 'completed' ? (
                            <>
                              <button
                                onClick={() => { setSelectedAppointmentToComplete(app); setIsCompleteModalOpen(true); }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 fc-e1 transition-all duration-200 ease-in-out hover:to-emerald-700 hover:fc-e2 active:scale-[0.98]"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Add diagnosis &amp; prescription
                              </button>
                              <span className={badgeClass}>Confirmed</span>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {doctorView === 'calendar' && (
              <section className={`${surfaceClass} overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 px-5 py-4 sm:px-6">
                  <div><h3 className="text-xl font-black text-slate-900">My calendar</h3><p className="mt-1 text-sm text-slate-500">Upcoming patient appointments</p></div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => moveCalendar(-1)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Previous period" aria-label="Previous period"><ChevronLeft className="h-5 w-5" /></button>
                    <span className="min-w-52 text-center text-sm font-bold text-slate-800">{calendarRangeTitle}</span>
                    <button onClick={() => moveCalendar(1)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Next period" aria-label="Next period"><ChevronRight className="h-5 w-5" /></button>
                    <button onClick={() => setCalendarDate(new Date())} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">Today</button>
                    <div className="ml-1 flex rounded-lg bg-slate-100 p-1">
                      {[['month', 'Month'], ['week', 'Week'], ['day', 'Day']].map(([mode, label]) => (
                        <button key={mode} onClick={() => setCalendarMode(mode)} className={`rounded-md px-3 py-1.5 text-xs font-bold ${calendarMode === mode ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {calendarMode === 'month' && (
                  <>
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="py-3">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                      {calendarDays.map((day, index) => {
                        const dayAppointments = day ? appointmentsForDay(day) : [];
                        const isToday = day && day.toDateString() === today.toDateString();
                        return (
                          <div key={day ? day.toISOString() : `empty-${index}`} className={`min-h-36 border-b border-r border-slate-100 p-2 ${day ? 'bg-white' : 'hidden lg:block bg-slate-50/70'}`}>
                            {day && (
                              <>
                                <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>{day.getDate()}</div>
                                <div className="space-y-2">
                                  {dayAppointments.map((app) => {
                                    const future = appointmentDate(app) >= startOfToday;
                                    return (
                                      <button key={app.id} onClick={() => handleViewPatientProfile(app)} className={`w-full rounded-lg border p-2 text-left transition ${future ? 'border-emerald-100 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100' : 'border-slate-200 bg-slate-100 hover:border-slate-300 hover:bg-slate-200'}`}>
                                        <p className={`text-[11px] font-black ${future ? 'text-emerald-800' : 'text-slate-500'}`}>{app.time}</p>
                                        <p className="mt-0.5 truncate text-xs font-semibold text-slate-800">{app.patientName}</p>
                                        <p className="truncate text-[10px] text-slate-500">View medical card</p>
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {calendarMode === 'week' && (
                  <>
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {calendarWeekDays.map((day) => <div key={day.toISOString()} className="py-3">{day.toLocaleDateString('en-US', { weekday: 'short' })}<span className="ml-1 text-slate-400">{day.getDate()}</span></div>)}
                    </div>
                    <div className="grid min-h-[28rem] grid-cols-7">
                      {calendarWeekDays.map((day) => (
                        <div key={day.toISOString()} className={`border-r border-slate-100 p-2 ${day.toDateString() === today.toDateString() ? 'bg-emerald-50/30' : ''}`}>
                          <div className="space-y-2">
                            {appointmentsForDay(day).map((app) => {
                              const future = appointmentDate(app) >= startOfToday;
                              return (
                                <button key={app.id} onClick={() => handleViewPatientProfile(app)} className={`w-full rounded-lg border p-2 text-left ${future ? 'border-emerald-100 bg-emerald-50 hover:bg-emerald-100' : 'border-slate-200 bg-slate-100 hover:bg-slate-200'}`}>
                                  <p className={`text-[11px] font-black ${future ? 'text-emerald-800' : 'text-slate-500'}`}>{app.time}</p>
                                  <p className="truncate text-xs font-semibold text-slate-800">{app.patientName}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {calendarMode === 'day' && (
                  <div className="min-h-[28rem] bg-white p-4">
                    <div className="mb-4 text-sm font-bold text-slate-700">{selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    {selectedDayAppointments.length ? (
                      <div className="space-y-3">
                        {selectedDayAppointments.map((app) => {
                          const future = appointmentDate(app) >= startOfToday;
                          return (
                            <button key={app.id} onClick={() => handleViewPatientProfile(app)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left ${future ? 'border-emerald-100 bg-emerald-50 hover:bg-emerald-100' : 'border-slate-200 bg-slate-100 hover:bg-slate-200'}`}>
                              <span className={`min-w-20 text-sm font-black ${future ? 'text-emerald-800' : 'text-slate-500'}`}>{app.time}</span>
                              <span>
                                <span className="block font-bold text-slate-800">{app.patientName}</span>
                                <span className="text-xs text-slate-500">View medical card</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No appointments scheduled for this day.</div>
                    )}
                  </div>
                )}
                {upcomingDoctorAppointments.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No upcoming appointments are scheduled.</div>}
              </section>
            )}
          </main>

          {selectedPatientProfile && (
            <div className="fc-veil fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
              <div className="fc-rise max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200/70 bg-white fc-e3">
                <div className="fc-weave flex items-center justify-between fc-brand p-5 text-white">
                  <div>
                    <h3 className="font-display font-bold text-lg">Patient medical card</h3>
                    <p className="text-xs text-emerald-100/70">Read-only medical record with editable recommendations</p>
                  </div>
                  <button onClick={() => { setSelectedPatientProfile(null); setSelectedPatientBooklet(null); setRecommendationDrafts({}); }} className="rounded-lg p-1.5 text-emerald-100 hover:bg-white/10 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><p className={microLabel}>Full name</p><p className="mt-1 font-semibold text-slate-800">{selectedPatientProfile.full_name}</p></div>
                    <div><p className={microLabel}>Date of birth</p><p className="mt-1 font-semibold text-slate-800">{selectedPatientProfile.birth_date || 'Not recorded'}</p></div>
                    <div><p className={microLabel}>Gender</p><p className="mt-1 font-semibold text-slate-800">{selectedPatientProfile.gender || 'Not recorded'}</p></div>
                    <div><p className={microLabel}>Insurance</p><p className="mt-1 font-semibold text-slate-800">{selectedPatientProfile.insurance_type || 'Not recorded'}</p></div>
                    <div><p className={microLabel}>Blood type</p><p className="mt-1 font-semibold text-slate-800">{selectedPatientProfile.blood_type || 'Not recorded'}</p></div>
                    <div><p className={microLabel}>Allergies</p><p className="mt-1 font-semibold text-slate-800">{selectedPatientProfile.allergies || 'Not recorded'}</p></div>
                    <div className="sm:col-span-2"><p className={microLabel}>Chronic conditions</p><p className="mt-1 font-semibold text-slate-800">{selectedPatientProfile.chronic_conditions || 'Not recorded'}</p></div>
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <h4 className="font-bold text-slate-800">Verified medical records</h4>
                    {selectedPatientBooklet?.verified_records?.length ? (
                      <div className="mt-3 space-y-3">
                        {selectedPatientBooklet.verified_records.map((record) => (
                          <div key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                            <p className="font-semibold text-slate-800">{record.diagnosis}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDate(record.created_at)}{record.verified_by_doctor ? ` • ${record.verified_by_doctor}` : ''}</p>
                            {record.notes && <p className="mt-2 text-slate-600">{record.notes}</p>}
                            <label className="mt-3 block">
                              <span className="block text-xs font-semibold text-slate-600">Recommendations</span>
                              <textarea value={recommendationDrafts[record.id] || ''} onChange={(event) => setRecommendationDrafts({ ...recommendationDrafts, [record.id]: event.target.value })} rows={3} className={`${inputClass} mt-1`} placeholder="Add or update recommendations" />
                              <button type="button" onClick={() => handleRecommendationSave(record.id)} className="mt-2 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 px-3 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 fc-e1 transition-all duration-200 ease-in-out hover:to-emerald-700">Save recommendation</button>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : <p className="mt-2 text-sm text-slate-500">No verified records.</p>}
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <h4 className="font-bold text-slate-800">Active prescriptions</h4>
                    {selectedPatientBooklet?.active_prescriptions?.length ? (
                      <div className="mt-3 space-y-3">
                        {selectedPatientBooklet.active_prescriptions.map((prescription) => (
                          <div key={prescription.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm">
                            <p className="font-semibold text-slate-800">{prescription.medication_name}</p>
                            <p className="mt-1 text-slate-600">{prescription.dosage_instructions}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="mt-2 text-sm text-slate-500">No active prescriptions.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isCompleteModalOpen && selectedAppointmentToComplete && (
            <div className="fc-veil fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
              <div className="fc-rise w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/70 bg-white fc-e3">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 bg-emerald-50/30 px-6 py-5">
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600 ring-1 ring-inset ring-emerald-100"><FileCheck className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">Add consultation result</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Patient: {selectedAppointmentToComplete.patientName}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCompleteModalOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 ease-in-out hover:bg-slate-200/60 hover:text-slate-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveConsultationCompletion} className="fc-scroll max-h-[68vh] space-y-5 overflow-y-auto p-6">
                  <div>
                    <label className={labelClass}>Diagnosis *</label>
                    <input type="text" required value={completionFormData.diagnosis} onChange={(e) => setCompletionFormData({ ...completionFormData, diagnosis: e.target.value })} placeholder="e.g. Mild Hypertension, Acute Sinusitis" className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Diagnosis type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ value: 'chronic', label: 'Chronic' }, { value: 'acute', label: 'Acute' }, { value: 'other', label: 'Other' }].map((option) => (
                        <button key={option.value} type="button" onClick={() => setCompletionFormData({ ...completionFormData, diagnosisType: option.value })} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 ease-in-out ${completionFormData.diagnosisType === option.value ? 'border-emerald-600 bg-emerald-600 text-white fc-e1' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'}`}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Prescription</label>
                    <div className="relative">
                      <Pill className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={completionFormData.prescription} onChange={(e) => setCompletionFormData({ ...completionFormData, prescription: e.target.value })} placeholder="e.g. Amoxicillin 500mg — twice daily for 7 days" className={`${inputClass} pl-10`} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400">Leave empty if no medication is issued.</p>
                  </div>

                  <div>
                    <label className={labelClass}>Notes & advice</label>
                    <textarea rows={3} value={completionFormData.notes} onChange={(e) => setCompletionFormData({ ...completionFormData, notes: e.target.value })} placeholder="Clinical observations, follow-up instructions…" className={`${inputClass} resize-y`} />
                  </div>

                  <div className="flex gap-3 border-t border-slate-100 pt-5">
                    <button type="button" onClick={() => setIsCompleteModalOpen(false)} className={`${ghostButtonClass} flex-1`}>Cancel</button>
                    <button type="submit" className={`${primaryButtonClass} flex-1 py-2.5`}>Save &amp; complete</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  /* =========================================================================
     5. PATIENT DASHBOARD
     ========================================================================= */
  const patientNavItems = [
    { id: 'overview', label: 'Home', hint: 'Snapshot', icon: Activity, count: null },
    { id: 'appointments', label: 'Appointments', hint: 'Upcoming visits', icon: Calendar, count: upcomingAppointments.length },
    { id: 'history', label: 'Medical history', hint: 'Past consultations', icon: History, count: bookletRecords.length },
    { id: 'booklet', label: 'Medical booklet', hint: 'Health passport', icon: FileText, count: null },
  ];
  const nextAppointment = upcomingAppointments[0];

  return (
    <>
      <GlobalStyles />
      <div className="relative flex min-h-screen flex-col fc-canvas antialiased">
        <div className="fc-field" aria-hidden="true" />

        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              aria-label="FAFCare — go to Home"
              title="Go to Home"
              className="group flex cursor-pointer items-center gap-3 rounded-xl py-1 pr-2 text-left transition-all duration-200 ease-in-out hover:opacity-90 active:scale-[0.99]"
            >
              <span className="h-9 w-9 overflow-hidden rounded-xl fc-e1 transition-all duration-200 ease-in-out group-hover:shadow-[0_8px_20px_-8px_rgba(5,150,105,0.9)]">
                <FafLogo className="h-full w-full" dark />
              </span>
              <span className="leading-tight">
                <span className="font-display block text-[15px] font-bold text-slate-900">
                  FAF<span className="text-emerald-600">care</span>
                </span>
                <span className="text-[11px] text-slate-500 transition-colors duration-200 group-hover:text-emerald-700">Health System</span>
              </span>
            </button>

            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 sm:inline-block">Patient</span>

              <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
                <div className="relative">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white fc-e1 ${currentUser.avatarColor || 'bg-emerald-600'}`}>
                    {currentUser.fullName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold leading-tight text-slate-900">{currentUser.fullName}</p>
                  <p className="max-w-[180px] truncate text-[11px] leading-tight text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 ease-in-out hover:bg-rose-50 hover:text-rose-600">
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:py-10">
          <aside className="w-full shrink-0 lg:w-[268px]">
            <div className="lg:sticky lg:top-24 lg:space-y-4">
              <nav className="fc-brand fc-weave rounded-2xl border border-teal-900/20 p-2.5 fc-e2">
                <p className="hidden px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70 lg:block">Navigate</p>
                <div className="fc-scroll flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
                  {patientNavItems.map(({ id, label, hint, icon: Icon, count }) => {
                    const isActive = activeTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ease-in-out lg:w-full ${
                          isActive ? 'bg-white text-teal-900 fc-e1' : 'text-emerald-50/85 hover:bg-white/10'
                        }`}
                      >
                        <span className={`absolute -left-1.5 top-1/2 hidden h-7 w-[3px] -translate-y-1/2 rounded-full bg-emerald-400 transition-all duration-200 ease-in-out lg:block ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ease-in-out ${
                          isActive ? 'bg-teal-100 text-teal-800' : 'bg-white/10 text-emerald-100 group-hover:bg-white/20'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block whitespace-nowrap text-[13px] font-semibold">{label}</span>
                          <span className={`hidden whitespace-nowrap text-[11px] lg:block ${isActive ? 'text-teal-600' : 'text-emerald-200/60'}`}>{hint}</span>
                        </span>
                        {count > 0 && (
                          <span className={`tnum ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors duration-200 ${isActive ? 'bg-teal-800 text-white' : 'bg-white/15 text-emerald-50'}`}>{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="hidden overflow-hidden rounded-2xl border border-slate-200/70 bg-white fc-e2 lg:block">
                <div className="fc-weave fc-brand px-4 py-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/90">Need care?</p>
                  <p className="mt-2 text-[13px] leading-snug text-emerald-50/90">Pick a specialty and choose a free slot in three steps.</p>
                </div>
                <div className="p-3">
                  <button type="button" onClick={() => setIsBookingOpen(true)} className={`${primaryButtonClass} py-2.5 text-[13px]`}>
                    <Plus className="h-4 w-4" /> Book appointment
                  </button>
                </div>
              </div>

              <p className="hidden px-3 text-[11px] leading-relaxed text-slate-400 lg:block">
                Records shown here are verified by the issuing clinician and stored in the national health registry.
              </p>
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-6">
            {notification && (
              <div className="fc-rise flex items-start gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/80 p-4 text-sm font-medium text-emerald-800 backdrop-blur-sm">
                <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-600" />
                <span className="leading-relaxed">{notification}</span>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <section className="fc-weave relative overflow-hidden rounded-3xl border border-teal-900/10 fc-brand p-6 text-white fc-e3 sm:p-8">
                  <div className="pointer-events-none absolute -right-10 -top-16 text-white/[0.05]"><Activity className="h-64 w-64" /></div>
                  <div className="relative flex flex-wrap items-start justify-between gap-6">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/90">Patient dashboard</p>
                      <h2 className="font-display mt-3 text-3xl font-bold leading-tight sm:text-[2.35rem]">
                        Welcome back, {currentUser.fullName?.split(' ')[0]}
                      </h2>
                      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-emerald-100/80">
                        {upcomingAppointments.length > 0
                          ? `You have ${upcomingAppointments.length} upcoming appointment${upcomingAppointments.length > 1 ? 's' : ''}. Everything else is up to date.`
                          : 'Nothing scheduled right now. Book a consultation whenever you need one.'}
                      </p>
                      <button type="button" onClick={() => setIsBookingOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 fc-e1 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-emerald-50 hover:fc-e2 active:translate-y-0">
                        <Plus className="h-4 w-4" /> Book appointment
                      </button>
                    </div>

                    <dl className="grid w-full grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:w-auto">
                      {[
                        { k: 'Upcoming', v: upcomingAppointments.length },
                        { k: 'Diagnoses', v: bookletRecords.length },
                        { k: 'Treatments', v: activePrescriptions.length },
                      ].map(({ k, v }) => (
                        <div key={k} className="px-4 py-3.5 sm:min-w-[104px] sm:px-5">
                          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">{k}</dt>
                          <dd className="font-display tnum mt-1 text-2xl font-bold">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </section>

                <div className="grid gap-5 lg:grid-cols-[1.35fr_minmax(0,1fr)]">
                  <div className={`${surfaceClass} overflow-hidden`}>
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4">
                      <h3 className="text-sm font-semibold text-slate-900">Next appointment</h3>
                      {upcomingAppointments.length > 1 && (
                        <button type="button" onClick={() => setActiveTab('appointments')} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition-all duration-200 ease-in-out hover:text-emerald-800">
                          See all <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {nextAppointment ? (
                      <div className="flex flex-wrap items-center gap-5 p-5">
                        <div className="flex h-[74px] w-[74px] shrink-0 flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600">{String(nextAppointment.date).slice(5, 7)}</span>
                          <span className="font-display tnum text-2xl font-bold leading-none text-emerald-800">{String(nextAppointment.date).slice(8, 10)}</span>
                          <span className="tnum mt-1 text-[10px] font-medium text-slate-400">{String(nextAppointment.date).slice(0, 4)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[15px] font-semibold text-slate-900">{nextAppointment.doctor}</h4>
                          <p className="mt-0.5 text-xs text-slate-500">{nextAppointment.spec}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                            <span className="tnum inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> {nextAppointment.date} · {formatTimeDisplay(nextAppointment.time)}</span>
                            <span className="inline-flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-slate-400" /> {nextAppointment.location}</span>
                          </div>
                        </div>
                        <span className={badgeClass}>Scheduled</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-3 p-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Calendar className="h-5 w-5" /></div>
                        <p className="text-sm text-slate-600">Nothing scheduled yet.</p>
                        <button type="button" onClick={() => setIsBookingOpen(true)} className={`${ghostButtonClass} py-2 text-xs`}>
                          <Plus className="h-3.5 w-3.5" /> Book your first appointment
                        </button>
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={() => setActiveTab('booklet')} className="fc-weave group relative overflow-hidden rounded-2xl border border-teal-900/10 fc-brand-alt p-6 text-left text-white fc-e2 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:fc-e3">
                    <div className="pointer-events-none absolute -bottom-10 -right-6 text-white/[0.06]"><FileText className="h-44 w-44" /></div>
                    <div className="relative flex h-full flex-col">
                      <div className="w-fit rounded-2xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md"><FileText className="h-5 w-5" /></div>
                      <h3 className="font-display mt-5 text-lg font-bold">Digital medical booklet</h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-emerald-100/80">Your electronic health passport: personal record, verified consultations and prescriptions.</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold text-emerald-200">
                        Open booklet <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {[
                    { label: 'Blood type / Rh', value: bookletPatient.blood_type || 'Not recorded', icon: Heart, tint: 'bg-rose-50 text-rose-500 ring-rose-100', big: true },
                    { label: 'Known allergies', value: bookletPatient.allergies || 'None recorded', icon: Droplets, tint: 'bg-emerald-50 text-emerald-600 ring-emerald-100', big: false },
                    { label: 'Chronic conditions', value: bookletPatient.chronic_conditions || 'None recorded', icon: Thermometer, tint: 'bg-amber-50 text-amber-600 ring-amber-100', big: false },
                  ].map(({ label, value, icon: Icon, tint, big }) => (
                    <div key={label} className={`${surfaceClass} group relative overflow-hidden p-5 transition-all duration-200 ease-in-out hover:-translate-y-0.5`}>
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      <div className="flex items-start justify-between gap-3">
                        <p className={microLabel}>{label}</p>
                        <div className={`rounded-xl p-2.5 ring-1 ring-inset ${tint}`}><Icon className="h-5 w-5" /></div>
                      </div>
                      <p className={`mt-4 font-semibold text-slate-900 ${big ? 'font-display text-3xl' : 'text-[15px] leading-snug'}`}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className={`${surfaceClass} flex flex-wrap items-center justify-between gap-4 p-5`}>
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 ring-1 ring-inset ring-emerald-100">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Not sure which doctor to visit?</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Use our Symptom Checker to get a quick specialty recommendation.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSymptomStep(1); setIsSymptomCheckerOpen(true); }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 fc-e1 transition-all duration-200 ease-in-out hover:to-emerald-700 hover:fc-e2 active:scale-[0.98]"
                  >
                    Check symptoms
                  </button>
                </div>

                <section className={`${surfaceClass} overflow-hidden`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 ring-1 ring-inset ring-teal-100"><User className="h-5 w-5" /></div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Patient personal record</h3>
                        <p className="mt-0.5 text-xs text-slate-500">Saved general medical information</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setActiveTab('booklet')} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition-all duration-200 ease-in-out hover:text-emerald-800">
                      View in booklet <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <dl className="grid grid-cols-1 gap-px bg-slate-200/60 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ['Full name', bookletPatient.full_name || currentUser.fullName],
                      ['Date of birth', formatDate(bookletPatient.birth_date)],
                      ['Medical insurance', bookletPatient.insurance_type || 'Not recorded'],
                      ['Blood type / Rh', bookletPatient.blood_type || 'Not recorded'],
                      ['Known allergies', bookletPatient.allergies || 'None recorded'],
                      ['Chronic conditions', bookletPatient.chronic_conditions || 'None recorded'],
                    ].map(([term, value]) => (
                      <div key={term} className="bg-white px-5 py-4">
                        <dt className={microLabel}>{term}</dt>
                        <dd className="mt-1.5 text-sm font-semibold leading-snug text-slate-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className={microLabel}>Scheduling</p>
                    <h2 className="font-display mt-2 text-2xl font-bold text-slate-900">My appointments</h2>
                    <p className="mt-1.5 text-sm text-slate-500">Upcoming visits and past consultations you can review.</p>
                  </div>
                  <button type="button" onClick={() => setIsBookingOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 fc-e1 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:to-emerald-700 hover:fc-e2 active:translate-y-0">
                    <Plus className="h-4 w-4" /> Book appointment
                  </button>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">Upcoming</h3>
                  <div className="space-y-3">
                    {upcomingAppointments.length === 0 ? (
                      <div className={`${surfaceClass} px-6 py-10 text-center`}>
                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Calendar className="h-5 w-5" /></div>
                        <p className="text-sm font-medium text-slate-700">No active appointments</p>
                        <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">Choose a specialty, pick a doctor, and select a free slot.</p>
                      </div>
                    ) : (
                      upcomingAppointments.map((app) => (
                        <div key={app.id} className={`${surfaceClass} group flex flex-col gap-4 p-5 transition-all duration-200 ease-in-out hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between`}>
                          <div className="flex items-center gap-4">
                            <div className="flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600">{String(app.date).slice(5, 7)}</span>
                              <span className="font-display tnum text-xl font-bold leading-none text-emerald-800">{String(app.date).slice(8, 10)}</span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[15px] font-semibold text-slate-900">{app.doctor}</h4>
                              <p className="mt-0.5 text-xs text-slate-500">{app.spec}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                <span className="tnum inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> {app.date} · {formatTimeDisplay(app.time)}</span>
                                <span className="inline-flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-slate-400" /> {app.location}</span>
                              </div>
                            </div>
                          </div>
                          <span className={badgeClass}>Scheduled</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {completedAppointments.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Completed</h3>
                    <div className="space-y-3">
                      {completedAppointments.map((app) => (
                        <div key={app.id} className={`${surfaceClass} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
                          <div className="flex items-center gap-4">
                            <div className="flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{String(app.date).slice(5, 7)}</span>
                              <span className="font-display tnum text-xl font-bold leading-none text-slate-700">{String(app.date).slice(8, 10)}</span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[15px] font-semibold text-slate-900">{app.doctor}</h4>
                              <p className="mt-0.5 text-xs text-slate-500">{app.spec}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                <span className="tnum inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> {app.date} · {formatTimeDisplay(app.time)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              <Check className="h-3.5 w-3.5 text-emerald-600" /> Completed
                            </span>
                            {app.review_id ? (
                              <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-700">
                                <StarRating value={app.review_rating || 0} size="sm" /> Reviewed
                              </span>
                            ) : (
                              <button onClick={() => { setReviewAppointment(app); setReviewRating(5); setReviewComment(''); }} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 fc-e1 transition-all duration-200 ease-in-out hover:to-amber-600 hover:fc-e2 active:scale-[0.98]">
                                <MessageSquare className="h-3.5 w-3.5" /> Leave review
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className={microLabel}>Clinical archive</p>
                    <h2 className="font-display mt-2 text-2xl font-bold text-slate-900">Medical history</h2>
                    <p className="mt-1.5 text-sm text-slate-500">Past consultations verified by the issuing doctor.</p>
                  </div>
                  <span className="tnum rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600 backdrop-blur-md">{bookletRecords.length} record(s)</span>
                </div>

                {bookletRecords.length === 0 ? (
                  <div className={`${surfaceClass} px-6 py-16 text-center`}>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><FileCheck className="h-6 w-6" /></div>
                    <p className="text-sm font-medium text-slate-700">No verified history yet</p>
                    <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">Consultations appear here once a doctor signs off the diagnosis.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookletRecords.map((record) => (
                      <article key={record.id} className={`${surfaceClass} overflow-hidden transition-all duration-200 ease-in-out hover:-translate-y-0.5`}>
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 bg-emerald-50/40 px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 ring-1 ring-inset ring-teal-100"><FileCheck className="h-5 w-5" /></div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">{record.verified_by_doctor || 'Verified medical consultation'}</h4>
                              <p className="mt-0.5 text-xs text-slate-500">{formatDate(record.created_at)}</p>
                            </div>
                          </div>
                          <span className={badgeClass}><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>
                        </div>
                        <div className="space-y-3 p-5">
                          <div className="rounded-xl border-l-2 border-emerald-500 bg-slate-50/80 px-4 py-3.5">
                            <p className={microLabel}>Diagnosis</p>
                            <p className="mt-1 text-[15px] font-semibold text-slate-900">{record.diagnosis}</p>
                          </div>
                          {record.notes && (
                            <div className="px-1">
                              <p className={microLabel}>Doctor notes</p>
                              <p className="mt-1 text-sm leading-relaxed text-slate-600">{record.notes}</p>
                            </div>
                          )}
                          {record.recommendations && (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3.5">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600/80">Recommendations</p>
                              <p className="mt-1 text-sm leading-relaxed text-emerald-900">{record.recommendations}</p>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'booklet' && (
              <div className="space-y-6">
                {bookletLoading ? (
                  <div className="space-y-5">
                    <div className="fc-skeleton h-44 rounded-3xl" />
                    <div className="grid gap-5 lg:grid-cols-[236px_minmax(0,1fr)]">
                      <div className="fc-skeleton h-64 rounded-2xl" />
                      <div className="fc-skeleton h-[34rem] rounded-2xl" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <section className="fc-weave relative overflow-hidden rounded-3xl border border-teal-900/10 fc-brand p-6 text-white fc-e3 sm:p-8">
                      <div className="pointer-events-none absolute -right-10 -top-14 text-white/[0.05]"><ShieldCheck className="h-64 w-64" /></div>
                      <div className="relative flex flex-wrap items-start justify-between gap-5 border-b border-white/15 pb-7">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/90">Republic of Moldova · FAFcare Health System</p>
                          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200/70">Electronic health passport & record</p>
                          <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Individual medical booklet</h2>
                        </div>
                        <button type="button" onClick={() => openMedicalBookletPdf(true)} title="Print medical booklet" aria-label="Print medical booklet" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-emerald-50 backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0">
                          <Printer className="h-4 w-4" /> Print
                        </button>
                      </div>
                      <div className="relative mt-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80">Authorized holder</p>
                          <p className="font-display mt-1.5 text-xl font-bold">{bookletPatient.full_name || currentUser.fullName}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                          <span className="tnum rounded-lg border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md">ID: PAT-{String(bookletPatient.id || currentUser.patient_id).slice(0, 8)}</span>
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/25 bg-emerald-400/20 px-3 py-2 text-emerald-50"><ShieldCheck className="h-4 w-4" /> Signed & secured</span>
                        </div>
                      </div>
                    </section>

                    <div className="grid items-start gap-5 lg:grid-cols-[236px_minmax(0,1fr)]">
                      <nav className="fc-weave overflow-hidden rounded-2xl border border-teal-900/10 fc-brand p-2.5 text-white fc-e2 lg:sticky lg:top-24" aria-label="Booklet table of contents">
                        <p className="px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">Contents</p>
                        <div className="space-y-1">
                          {[
                            { id: 'profile', number: '01', label: 'Personal record', icon: User },
                            { id: 'visits', number: '02', label: 'Consultations', icon: FileCheck },
                            { id: 'history', number: '03', label: 'Illness history', icon: History },
                            { id: 'prescriptions', number: '04', label: 'Prescriptions', icon: Pill },
                            { id: 'access-log', number: '05', label: 'Security & Access', icon: ShieldCheck },
                          ].map(({ id, number, label, icon: Icon }) => (
                            <button key={id} type="button" onClick={() => setBookletSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ease-in-out ${bookletSection === id ? 'bg-white text-teal-900 fc-e1' : 'text-emerald-50/90 hover:bg-white/10'}`}>
                              <span className={`tnum flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-colors duration-200 ${bookletSection === id ? 'bg-teal-100 text-teal-800' : 'bg-white/10 text-emerald-100'}`}>{number}</span>
                              <span className="min-w-0 flex-1 whitespace-nowrap text-[12.5px] font-semibold">{label}</span>
                              <Icon className="h-4 w-4 shrink-0 opacity-60" />
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-white/15 px-3 pb-2 pt-3 text-[10px] leading-4 text-emerald-200/70">Secure electronic<br />medical record</div>
                      </nav>

                      <div className="min-h-[34rem] min-w-0 rounded-3xl border border-teal-200/50 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 p-1.5 fc-e2 sm:p-2">
                        <div className="fc-rise h-full rounded-2xl border border-slate-100 bg-white p-5 sm:p-9" key={bookletSection}>
                          {bookletSection === 'profile' && (
                            <section>
                              <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-200/70 pb-5">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Page No. 01</p>
                                  <h3 className="font-display mt-2 text-2xl font-bold text-slate-900">Patient personal record</h3>
                                  <p className="mt-1.5 text-sm text-slate-500">Biometric information & health status</p>
                                </div>
                                <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 ring-1 ring-inset ring-teal-100"><User className="h-6 w-6" /></div>
                              </div>
                              <dl className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
                                <div className="border-b border-dashed border-slate-200 pb-4"><dt className={microLabel}>Full name</dt><dd className="mt-1.5 text-base font-semibold text-slate-900">{bookletPatient.full_name || 'Not recorded'}</dd></div>
                                <div className="border-b border-dashed border-slate-200 pb-4"><dt className={microLabel}>Date of birth</dt><dd className="mt-1.5 text-base font-semibold text-slate-900">{formatDate(bookletPatient.birth_date)}</dd></div>
                                <div className="border-b border-dashed border-slate-200 pb-4"><dt className={microLabel}>Medical insurance</dt><dd className="mt-1.5 text-base font-semibold text-emerald-700">{bookletPatient.insurance_type || 'Not recorded'}</dd></div>
                                <div className="border-b border-dashed border-slate-200 pb-4"><dt className={microLabel}>Blood type / Rh</dt><dd className="mt-1.5 text-base font-semibold text-slate-900">{bookletPatient.blood_type || 'Not recorded'}</dd></div>
                                <div className="border-b border-dashed border-slate-200 pb-4 sm:col-span-2"><dt className={microLabel}>Known allergies & intolerances</dt><dd className="mt-1.5 font-medium leading-relaxed text-slate-900">{bookletPatient.allergies || 'None recorded'}</dd></div>
                                <div className="sm:col-span-2"><dt className={microLabel}>Chronic conditions</dt><dd className="mt-1.5 font-medium leading-relaxed text-slate-900">{bookletPatient.chronic_conditions || 'None recorded'}</dd></div>
                              </dl>
                            </section>
                          )}

                          {bookletSection === 'visits' && (
                            <section>
                              <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-200/70 pb-5">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Page No. 02</p>
                                  <h3 className="font-display mt-2 text-2xl font-bold text-slate-900">Verified consultations</h3>
                                  <p className="mt-1.5 text-sm text-slate-500">Records validated by medical specialists</p>
                                </div>
                                <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 ring-1 ring-inset ring-teal-100"><FileCheck className="h-6 w-6" /></div>
                              </div>
                              {bookletRecords.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                                  <p className="text-sm font-medium text-slate-700">Nothing recorded yet</p>
                                  <p className="mt-1 text-sm text-slate-500">Signed consultations will be listed on this page.</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {bookletRecords.map((record) => (
                                    <article key={record.id} className="rounded-2xl border border-slate-200/70 border-l-[3px] border-l-emerald-500 bg-emerald-50/30 p-5 transition-all duration-200 ease-in-out hover:bg-white hover:fc-e1">
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /><h4 className="text-sm font-semibold text-slate-900">Verified medical record</h4></div>
                                          <p className="mt-1 text-xs text-slate-500">{formatDate(record.created_at)}{record.verified_by_doctor ? ` · ${record.verified_by_doctor}` : ''}</p>
                                        </div>
                                        <span className={badgeClass}>Verified</span>
                                      </div>
                                      <p className="mt-4 text-sm text-slate-700"><span className="font-semibold text-slate-900">Diagnosis:</span> {record.diagnosis}</p>
                                      {record.notes && <p className="mt-2 text-sm leading-relaxed text-slate-600"><span className="font-semibold text-slate-900">Notes:</span> {record.notes}</p>}
                                      {record.recommendations && <p className="mt-2 text-sm leading-relaxed text-slate-600"><span className="font-semibold text-slate-900">Recommendations:</span> {record.recommendations}</p>}
                                    </article>
                                  ))}
                                </div>
                              )}
                            </section>
                          )}

                          {bookletSection === 'history' && (
                            <section>
                              <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-200/70 pb-5">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Page No. 03</p>
                                  <h3 className="font-display mt-2 text-2xl font-bold text-slate-900">Illness history & diagnoses</h3>
                                  <p className="mt-1.5 text-sm text-slate-500">Diagnoses, chronic conditions, clinical notes and treatment overview</p>
                                </div>
                                <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 ring-1 ring-inset ring-teal-100"><History className="h-6 w-6" /></div>
                              </div>

                              <div className="mb-6 grid gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/70 sm:grid-cols-3">
                                <div className="bg-white p-4"><p className={microLabel}>Diagnoses</p><p className="font-display tnum mt-1.5 text-2xl font-bold text-slate-900">{bookletRecords.length}</p></div>
                                <div className="bg-white p-4"><p className={microLabel}>Chronic conditions</p><p className="mt-1.5 text-sm font-semibold leading-snug text-slate-900">{bookletPatient.chronic_conditions || 'None recorded'}</p></div>
                                <div className="bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600/80">Active treatments</p><p className="font-display tnum mt-1.5 text-2xl font-bold text-emerald-700">{activePrescriptions.length}</p></div>
                              </div>

                              <div className="mb-6 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3.5">
                                <div className="flex flex-col gap-3 lg:flex-row">
                                  <label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={illnessSearch} onChange={(event) => setIllnessSearch(event.target.value)} placeholder="Search diagnoses, doctors or notes…" className={`${inputClass} pl-10`} /></label>
                                  <select value={illnessYear} onChange={(event) => setIllnessYear(event.target.value)} className={`${inputClass} lg:w-auto`}><option value="all">All years</option>{illnessYears.map((year) => <option key={year} value={year}>{year}</option>)}</select>
                                  <select value={illnessDoctor} onChange={(event) => setIllnessDoctor(event.target.value)} className={`${inputClass} lg:w-auto`}><option value="all">All specialties</option>{illnessDoctorSpecialties.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}</select>
                                </div>
                                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                                  {[{ id: 'all', label: 'All' }, { id: 'chronic', label: 'Chronic' }, { id: 'acute', label: 'Acute' }].map((category) => <button key={category.id} type="button" onClick={() => setIllnessCategory(category.id)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-in-out ${illnessCategory === category.id ? 'bg-teal-800 text-white fc-e1' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'}`}>{category.label}</button>)}
                                  <span className="tnum ml-auto text-xs font-medium text-slate-400">Showing {filteredIllnessRecords.length} of {bookletRecords.length}</span>
                                </div>
                              </div>

                              {bookletRecords.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center"><p className="text-sm font-medium text-slate-700">No diagnoses recorded</p><p className="mt-1 text-sm text-slate-500">Your timeline builds up as doctors sign consultations.</p></div>
                              ) : filteredIllnessRecords.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center"><p className="text-sm font-medium text-slate-700">Nothing matches these filters</p><p className="mt-1 text-sm text-slate-500">Clear the search box or switch back to “All”.</p></div>
                              ) : (
                                <div className="relative space-y-4 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-gradient-to-b before:from-teal-200 before:via-teal-100 before:to-transparent">
                                  {filteredIllnessRecords.map((record) => (
                                    <article key={record.id} className="relative pl-9">
                                      <span className="absolute left-0 top-6 h-3.5 w-3.5 rounded-full border-2 border-white bg-teal-600 ring-4 ring-teal-50" />
                                      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 fc-e1 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:fc-e2">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                          <div>
                                            <p className="text-xs font-semibold text-teal-700">{formatDate(record.created_at)}</p>
                                            <h4 className="mt-1 text-[15px] font-semibold text-slate-900">{record.diagnosis}</h4>
                                          </div>
                                          <div className="flex gap-2">
                                            <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-teal-700">{record.diagnosis_type || getIllnessCategory(record)}</span>
                                            <span className={badgeClass}>Verified</span>
                                          </div>
                                        </div>
                                        {(record.verified_by_doctor || record.doctor_specialty) && <p className="mt-2 text-xs text-slate-500">{record.verified_by_doctor || 'Doctor not recorded'}{record.doctor_specialty ? ` · ${record.doctor_specialty}` : ''}</p>}
                                        {record.notes && <p className="mt-3 text-sm leading-relaxed text-slate-600"><span className="font-semibold text-slate-900">Notes:</span> {record.notes}</p>}
                                        {record.recommendations && <p className="mt-2 text-sm leading-relaxed text-slate-600"><span className="font-semibold text-slate-900">Recommendations:</span> {record.recommendations}</p>}
                                      </div>
                                    </article>
                                  ))}
                                </div>
                              )}
                            </section>
                          )}

                          {bookletSection === 'prescriptions' && (
                            <section>
                              <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-200/70 pb-5">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Page No. 04</p>
                                  <h3 className="font-display mt-2 text-2xl font-bold text-slate-900">Active prescriptions</h3>
                                  <p className="mt-1.5 text-sm text-slate-500">Issued treatment plan</p>
                                </div>
                                <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 ring-1 ring-inset ring-teal-100"><Pill className="h-6 w-6" /></div>
                              </div>
                              {activePrescriptions.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center"><p className="text-sm font-medium text-slate-700">No active prescriptions</p><p className="mt-1 text-sm text-slate-500">Medication issued by a doctor appears here with dosage instructions.</p></div>
                              ) : (
                                <div className="grid gap-3 md:grid-cols-2">
                                  {activePrescriptions.map((prescription) => (
                                    <article key={prescription.id} className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/70 to-white p-5 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:fc-e1">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                          <div className="rounded-xl bg-white p-2 text-emerald-600 ring-1 ring-inset ring-emerald-100"><Pill className="h-4 w-4" /></div>
                                          <div>
                                            <h4 className="text-[15px] font-semibold text-slate-900">{prescription.medication_name}</h4>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-700">{prescription.dosage_instructions}</p>
                                          </div>
                                        </div>
                                        <span className="whitespace-nowrap rounded-full border border-emerald-200/80 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Active</span>
                                      </div>
                                      <p className="mt-4 border-t border-emerald-100/70 pt-3 text-xs text-slate-500">{prescription.duration_days ? `${prescription.duration_days} days` : 'Continuous'}{prescription.doctor_name ? ` · Issued by ${prescription.doctor_name}` : ''}</p>
                                    </article>
                                  ))}
                                </div>
                              )}
                            </section>
                          )}

                          {bookletSection === 'access-log' && (
                            <section>
                              <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-200/70 pb-5">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Page No. 05</p>
                                  <h3 className="font-display mt-2 text-2xl font-bold text-slate-900">Security & access log</h3>
                                  <p className="mt-1.5 text-sm text-slate-500">A record of doctors who accessed your medical information</p>
                                </div>
                                <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 ring-1 ring-inset ring-teal-100"><ShieldCheck className="h-6 w-6" /></div>
                              </div>
                              {auditLogs.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center"><p className="text-sm font-medium text-slate-700">No access activity recorded yet</p></div>
                              ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-200/70 fc-e1">
                                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                      <tr>
                                        <th className="px-4 py-3">Doctor name</th>
                                        <th className="px-4 py-3">Specialty</th>
                                        <th className="px-4 py-3">Date / time</th>
                                        <th className="px-4 py-3">Access reason</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                      {auditLogs.map((log) => (
                                        <tr key={log.id} className="align-top transition-colors duration-200 hover:bg-teal-50/40">
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

      {reviewAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmitReview} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-slate-900">Review your consultation</h2><p className="mt-1 text-sm text-slate-500">{reviewAppointment.doctor} • {reviewAppointment.spec}</p></div><button type="button" onClick={() => setReviewAppointment(null)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
            <label className="mt-5 block text-sm font-semibold text-slate-700">Rating<select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option value="5">5 - Excellent</option><option value="4">4 - Very good</option><option value="3">3 - Good</option><option value="2">2 - Needs improvement</option><option value="1">1 - Poor</option></select></label>
            <label className="mt-4 block text-sm font-semibold text-slate-700">Comment<textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={4} maxLength={2000} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal" placeholder="Share your experience (optional)" /></label>
            <button type="submit" className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600">Submit review</button>
          </form>
        </div>
      )}

        {pdfPreviewHtml && (
          <div className="fc-veil fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-md sm:p-6">
            <div className="fc-rise flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white fc-e3">
              <div className="fc-weave flex items-center justify-between gap-4 fc-brand px-4 py-4 text-white sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-white/15 bg-white/10 p-2 backdrop-blur-md"><FileText className="h-5 w-5" /></div>
                  <div>
                    <h2 className="font-display text-sm font-bold">Medical booklet</h2>
                    <p className="text-xs text-emerald-100/70">Print the document or close the preview.</p>
                  </div>
                </div>
                <button type="button" onClick={() => setPdfPreviewHtml(null)} className="rounded-lg p-2 text-emerald-100 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <iframe id="pdf-preview-frame" title="Medical booklet PDF preview" srcDoc={pdfPreviewHtml} className="min-h-0 flex-1 border-0 bg-slate-100" />
              <div className="flex flex-col-reverse gap-2 border-t border-slate-200/70 bg-white p-3 sm:flex-row sm:justify-end sm:px-6">
                <button type="button" onClick={() => setPdfPreviewHtml(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 ease-in-out hover:bg-slate-100">Close</button>
                <button type="button" onClick={() => document.getElementById('pdf-preview-frame')?.contentWindow?.print()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 fc-e1 transition-all duration-200 ease-in-out hover:to-emerald-700 hover:fc-e2 active:scale-[0.99]"><Printer className="h-4 w-4" /> Print</button>
              </div>
            </div>
          </div>
        )}

        {reviewAppointment && (
          <div className="fc-veil fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
            <div className="fc-rise w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/70 bg-white fc-e3">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 bg-amber-50/40 px-6 py-5">
                <div className="flex items-start gap-3.5">
                  <div className="rounded-2xl bg-amber-50 p-2.5 text-amber-600 ring-1 ring-inset ring-amber-100"><Star className="h-5 w-5" /></div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">Rate your consultation</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{reviewAppointment.doctor} · {reviewAppointment.spec}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setReviewAppointment(null)} className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 ease-in-out hover:bg-slate-200/60 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5 p-6">
                <div>
                  <label className={labelClass}>Your rating *</label>
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
                    <p className="text-xs font-medium text-slate-500">
                      {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very good' : 'Excellent'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Comment (optional)</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share details about your experience…"
                    className={`${inputClass} resize-y`}
                  />
                </div>

                <div className="flex gap-3 border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => setReviewAppointment(null)} className={`${ghostButtonClass} flex-1`}>Cancel</button>
                  <button type="submit" disabled={reviewRating < 1} className={`${primaryButtonClass} flex-1 py-2.5 disabled:cursor-not-allowed disabled:opacity-60`}>Submit review</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isBookingOpen && (
          <div className="fc-veil fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
            <div className="fc-rise flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white fc-e3">
              <div className="shrink-0 border-b border-slate-200/70 bg-emerald-50/30 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600 ring-1 ring-inset ring-emerald-100"><Calendar className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">Book an appointment</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {bookingStep === 1 ? 'Choose a medical specialty' : bookingStep === 2 ? `Doctors in ${selectedSpec?.name}` : 'Pick a date and time'}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsBookingOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 ease-in-out hover:bg-slate-200/60 hover:text-slate-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <ol className="mt-5 flex items-center gap-2">
                  {['Specialty', 'Doctor', 'Time'].map((stepLabel, index) => {
                    const step = index + 1;
                    const done = step < bookingStep;
                    const active = step === bookingStep;
                    return (
                      <li key={stepLabel} className="flex flex-1 items-center gap-2">
                        <span className={`tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-200 ease-in-out ${
                          done ? 'bg-emerald-600 text-white' : active ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {done ? <Check className="h-3 w-3" /> : step}
                        </span>
                        <span className={`hidden text-[11px] font-semibold transition-colors duration-200 sm:block ${active ? 'text-slate-900' : 'text-slate-400'}`}>{stepLabel}</span>
                        {step < 3 && <span className={`h-px flex-1 transition-colors duration-200 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="fc-scroll flex-1 space-y-4 overflow-y-auto p-6">
                {bookingStep === 1 && (
                  <div className="fc-rise grid grid-cols-1 gap-2.5">
                    {specialties.map((spec) => {
                      const IconComp = spec.icon;
                      return (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => { setSelectedSpec(spec); setBookingStep(2); }}
                          className="group flex items-center gap-3.5 rounded-2xl border border-slate-200 p-4 text-left transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/40 hover:fc-e1"
                        >
                          <div className="shrink-0 rounded-xl bg-emerald-50 p-2.5 text-emerald-600 ring-1 ring-inset ring-emerald-100 transition-all duration-200 ease-in-out group-hover:bg-emerald-600 group-hover:text-white">
                            <IconComp className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-slate-900">{spec.name}</h4>
                            <p className="mt-0.5 text-xs leading-snug text-slate-500">{spec.desc}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-all duration-200 ease-in-out group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {/* STEP 2: DOCTOR SELECTION */}
                {bookingStep === 2 && (
                  <div className="fc-rise space-y-4">
                    <button type="button" onClick={() => setBookingStep(1)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition-all duration-200 ease-in-out hover:text-emerald-800">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to specialties
                    </button>

                    <div className="space-y-2.5">
                      {doctorsList.filter(d => d.specId === selectedSpec?.id).map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => { setSelectedDoctor(doc); setBookingStep(3); }}
                          className="group flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 text-left transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/40 hover:fc-e1"
                        >
                          <div className="flex min-w-0 flex-1 items-start gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100 transition-all duration-200 ease-in-out group-hover:bg-emerald-600 group-hover:text-white">
                              <Stethoscope className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-semibold text-slate-900 transition-colors duration-200 group-hover:text-emerald-800">{doc.name}</h4>
                              <p className="mt-0.5 truncate text-xs text-slate-500">{doc.location} · Experience {doc.experience}</p>
                              <div className="mt-2">
                                <StarRating value={Number(doc.rating_average || 0)} count={doc.rating_count || 0} showValue size="sm" />
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-all duration-200 ease-in-out group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {bookingStep === 3 && (
                  <div className="fc-rise space-y-5">
                    <button type="button" onClick={() => setBookingStep(2)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition-all duration-200 ease-in-out hover:text-emerald-800">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to doctors
                    </button>

                    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 ring-1 ring-inset ring-emerald-100"><Stethoscope className="h-5 w-5" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{selectedDoctor?.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{selectedDoctor?.spec}</p>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Appointment date</label>
                      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`${inputClass} tnum`} />
                    </div>

                    <div>
                      <label className={labelClass}>Available time</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`tnum rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200 ease-in-out ${
                              selectedTime === slot
                                ? 'border-emerald-600 bg-emerald-600 text-white fc-e1'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                      <button type="button" onClick={handleConfirmBooking} className={primaryButtonClass}>
                        Confirm appointment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isSymptomCheckerOpen && (
          <div className="fc-veil fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
            <div className="fc-rise flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white fc-e3">
              <div className="shrink-0 border-b border-slate-200/70 bg-emerald-50/30 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600 ring-1 ring-inset ring-emerald-100"><Stethoscope className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">Symptom checker</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Step {symptomStep} of 3</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsSymptomCheckerOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 ease-in-out hover:bg-slate-200/60 hover:text-slate-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="fc-scroll flex-1 space-y-5 overflow-y-auto p-6">
                {symptomStep === 1 && (
                  <div className="fc-rise space-y-4">
                    <p className="text-sm font-semibold text-slate-700">1. Select your primary symptom or affected area:</p>
                    <div className="grid grid-cols-1 gap-2.5">
                      {symptomCategories.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { setSelectedSymptom(item); setSymptomStep(2); }}
                          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ease-in-out ${
                            selectedSymptom?.id === item.id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/40 hover:fc-e1'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{item.zone}</span>
                              <h4 className="text-sm font-semibold text-slate-900">{item.label}</h4>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {symptomStep === 2 && (
                  <div className="fc-rise space-y-5">
                    <button type="button" onClick={() => setSymptomStep(1)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition-all duration-200 ease-in-out hover:text-emerald-800">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to symptom selection
                    </button>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-xs text-emerald-800">
                      <strong>Selected symptom:</strong> {selectedSymptom?.label} ({selectedSymptom?.zone})
                    </div>

                    <div>
                      <label className={labelClass}>Symptom duration</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Under 24 hours', '1-3 days', 'Over 1 week'].map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => setSymptomDuration(dur)}
                            className={`rounded-xl border px-1 py-2.5 text-xs font-semibold transition-all duration-200 ease-in-out ${
                              symptomDuration === dur ? 'border-emerald-600 bg-emerald-600 text-white fc-e1' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700'
                            }`}
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Discomfort level (1 - 10)</label>
                        <span className="tnum text-sm font-bold text-emerald-600">{symptomIntensity} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={symptomIntensity}
                        onChange={(e) => setSymptomIntensity(Number(e.target.value))}
                        className="w-full cursor-pointer accent-emerald-600"
                      />
                      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                        <span>Mild</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSymptomStep(3)}
                      className={`${primaryButtonClass} mt-2`}
                    >
                      Generate recommendation
                    </button>
                  </div>
                )}

                {symptomStep === 3 && (
                  <div className="fc-rise space-y-5 py-2 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Triage Recommendation
                      </span>
                      <h4 className="mt-3 text-xl font-bold text-slate-800">
                        Recommended consultation: {specialties.find(s => s.name.toLowerCase().includes(selectedSymptom?.keyword))?.name || 'General Practice'}
                      </h4>
                      <p className="mx-auto mt-2 max-w-sm text-xs text-slate-500">
                        Based on your symptom (<em>{selectedSymptom?.label}</em>), intensity level {symptomIntensity}/10 and duration of {symptomDuration}.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={handleProceedToBookingFromSymptom}
                        className={`${primaryButtonClass} shadow-md`}
                      >
                        <Calendar className="h-4 w-4" /> Book appointment for {specialties.find(s => s.name.toLowerCase().includes(selectedSymptom?.keyword))?.name || 'Specialty'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSymptomStep(1)}
                        className="w-full py-2 text-xs text-slate-500 transition-all duration-200 ease-in-out hover:text-slate-700"
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
    </>
  );
}