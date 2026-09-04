import React, { useEffect, useState } from 'react';
import { 
  Activity, Calendar, FileText, Pill, User, LogOut, PlusCircle, ArrowLeft, 
  Mail, Lock, Phone, Eye, EyeOff, ShieldCheck, CheckCircle2, Clock, 
  ChevronRight, Download, Heart, Droplets, Thermometer, Plus, X, Stethoscope, 
  Building, Check, Users
} from 'lucide-react';

export default function App() {
  // --- SAVED ACCOUNTS (PATIENT AND DOCTOR) ---
  const [savedAccounts, setSavedAccounts] = useState([]);

  // --- DOCTOR SPECIALTIES AND LIST ---
  const [specialties, setSpecialties] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);

  // --- APPOINTMENTS LIST ---
  const [appointments, setAppointments] = useState([]);

  // --- AUTH AND NAVIGATION STATE ---
  const [authView, setAuthView] = useState('saved'); // 'saved' | 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'appointments' | 'labs' | 'medications'

  // --- BOOKING MODAL STATE ---
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: specialty selection, 2: doctor selection, 3: date and time
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-09-15');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  // Login form
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });

  const availableTimeSlots = ['09:00 AM', '10:30 AM', '01:15 PM', '03:00 PM', '04:30 PM'];
  const to24Hour = (time) => {
    const [clock, meridiem] = time.split(' ');
    let [hours, minutes] = clock.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };

  const api = async (path, options = {}) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers }, ...options,
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body;
  };

  const loadAppointments = async (user = currentUser) => {
    if (!user) return;
    const query = user.role === 'Doctor' ? `doctor_id=${user.doctor_id}` : `patient_id=${user.patient_id}`;
    const rows = await api(`/appointments?${query}`);
    setAppointments(rows.map((row) => ({ ...row, patientName: row.patient_name, date: row.scheduled_at.slice(0, 10), time: row.scheduled_at.slice(11, 16), location: 'FAFCare clinic' })));
  };

  useEffect(() => {
    Promise.all([api('/accounts'), api('/specialties'), api('/doctors')])
      .then(([accounts, remoteSpecialties, remoteDoctors]) => {
        setSavedAccounts(accounts.map((account) => ({ ...account, avatarColor: 'bg-emerald-600' })));
        setSpecialties(remoteSpecialties.map((spec) => ({ ...spec, icon: spec.name.toLowerCase().includes('heart') ? Heart : Stethoscope })));
        setDoctorsList(remoteDoctors.map((doctor) => ({ ...doctor, specId: doctor.spec_id })));
      })
      .catch((error) => setNotification(`API unavailable: ${error.message}`));
  }, []);

  useEffect(() => { loadAppointments().catch(() => {}); }, [currentUser]);

  // --- HANDLERS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleQuickLogin = async (account) => {
    try {
      const user = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: account.email, password: 'Password123!' }) });
      setCurrentUser({ ...user, avatarColor: 'bg-emerald-600' });
      setActiveTab('overview');
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
      const newAcc = await api('/auth/register', { method: 'POST', body: JSON.stringify(formData) });
      setSavedAccounts([...savedAccounts, { ...newAcc, avatarColor: 'bg-emerald-600' }]);
      setNotification('Account created successfully!');
      setFormData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
      setAuthView('saved');
      setTimeout(() => setNotification(null), 3000);
      } else {
        const user = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: formData.email, password: formData.password }) });
        setCurrentUser({ ...user, avatarColor: 'bg-emerald-600' });
      setActiveTab('overview');
      }
    } catch (error) { setNotification(error.message); }
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

  // =========================================================================
  // 1. LOGIN SCREEN (WHEN NOT AUTHENTICATED)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          <div className="bg-emerald-600 p-6 text-white text-center relative">
            {authView !== 'saved' && (
              <button onClick={() => setAuthView('saved')} className="absolute left-4 top-6 p-1 rounded-lg hover:bg-white/10 transition text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">FAFCare Portal</h1>
            <p className="text-emerald-100 text-sm mt-1">Select a test profile or sign in</p>
          </div>

          <div className="p-8">
            {notification && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {authView === 'saved' && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Available profiles ({savedAccounts.length})
                </p>

                {savedAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleQuickLogin(account)}
                    className="w-full flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${account.avatarColor} text-white font-bold rounded-full flex items-center justify-center text-sm shadow-sm`}>
                        {account.fullName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm group-hover:text-emerald-600 transition">
                            {account.fullName}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${account.role === 'Doctor' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {account.role === 'Doctor' ? 'DOCTOR' : 'PATIENT'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{account.email}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium group-hover:bg-emerald-100 group-hover:text-emerald-700 transition">
                      Log in
                    </span>
                  </button>
                ))}

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button onClick={() => setAuthView('login')} className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> Sign in with email
                  </button>
                  <button onClick={() => setAuthView('register')} className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium rounded-lg text-sm transition flex items-center justify-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Register new patient
                  </button>
                </div>
              </div>
            )}

            {(authView === 'login' || authView === 'register') && (
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
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. DOCTOR DASHBOARD (IF AUTHENTICATED AS DOCTOR)
  // =========================================================================
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
              <button onClick={() => setCurrentUser(null)} className="p-2 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100 transition">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
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
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // 3. PATIENT DASHBOARD (WITH INTERACTIVE BOOKING)
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

            <button onClick={() => setCurrentUser(null)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition">
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
            <Calendar className="w-5 h-5" /> Appointments ({appointments.filter(a => a.patientName === currentUser.fullName).length})
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
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {currentUser.fullName}!</h2>
                  <p className="text-emerald-100 text-sm mt-1">You have {appointments.filter(a => a.patientName === currentUser.fullName).length} appointment(s) booked</p>
                </div>
                <button onClick={() => setIsBookingOpen(true)} className="py-2.5 px-4 bg-white text-emerald-600 font-bold rounded-xl text-xs hover:bg-emerald-50 transition shadow">
                  + Book appointment
                </button>
              </div>

              {/* Health metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl"><Heart className="w-6 h-6" /></div>
                  <div><p className="text-xs text-slate-500">Pulse</p><p className="text-xl font-bold text-slate-800">72 bpm</p></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><Droplets className="w-6 h-6" /></div>
                  <div><p className="text-xs text-slate-500">Blood pressure</p><p className="text-xl font-bold text-slate-800">120/80</p></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Thermometer className="w-6 h-6" /></div>
                  <div><p className="text-xs text-slate-500">Temperature</p><p className="text-xl font-bold text-slate-800">36.6 °C</p></div>
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
                {appointments.filter(a => a.patientName === currentUser.fullName).length === 0 ? (
                  <div className="p-8 bg-white rounded-2xl border text-center text-slate-500">You do not have any active appointments yet.</div>
                ) : (
                  appointments.filter(a => a.patientName === currentUser.fullName).map((app) => (
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
        </main>
      </div>

      {/* =========================================================================
          4. INTERACTIVE APPOINTMENT BOOKING MODAL (3 STEPS)
         ========================================================================= */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
            
            {/* Modal header */}
            <div className="p-5 bg-emerald-600 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Book an appointment</h3>
                <p className="text-xs text-emerald-100">Step {bookingStep} of 3</p>
              </div>
              <button onClick={() => setIsBookingOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
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
                          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-800">{spec.name}</h4>
                            <p className="text-xs text-slate-500">{spec.desc}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
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
                  <p className="text-sm font-semibold text-slate-700">2. Available doctors ({selectedSpec.name}):</p>
                  
                  <div className="space-y-2.5">
                    {doctorsList.filter(d => d.specId === selectedSpec.id).map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setBookingStep(3);
                        }}
                        className="w-full flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-sm">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600">{doc.name}</h4>
                            <p className="text-xs text-slate-500">{doc.location} • Experience {doc.experience}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
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
                    <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
                    <p><strong>Specialty:</strong> {selectedDoctor.spec}</p>
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
    </div>
  );
}