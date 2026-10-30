'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { authFetch } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { User } from '@/lib/types';
import Toast from '@/components/shared/Toast';

type Tab = 'login' | 'signup';
type Step = 'details' | 'otp';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const { loginWithToken, signupWithToken, setCurrentUser, showToast } = useApp();
  const { isDark } = useTheme();
  const { t } = useLang();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('login');
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; otp?: string }>({});

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
  });

  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => () => { verifierRef.current?.clear(); }, []);

  const switchTab = (next: Tab) => {
    if (loading) return;
    setTab(next);
    setStep('details');
    setOtp('');
    setErrors({});
  };

  // After a successful login/signup, go where the customer was heading
  const goNext = () => {
    const pendingCheckout = sessionStorage.getItem('pending_checkout');
    if (pendingCheckout) {
      sessionStorage.removeItem('pending_checkout');
      router.push('/customer?checkout=true');
    } else {
      router.push('/customer');
    }
  };

  // Signup form lets the customer add an address; save it right after the account exists
  const saveSignupAddress = async () => {
    const hasAddress =
      showAddressForm &&
      (address.street || address.area || address.city || address.state || address.pincode);
    if (!hasAddress) return;
    try {
      const res = await authFetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), address }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user as User);
        localStorage.setItem('sk_session', JSON.stringify(data.user));
      }
    } catch {
      // Account is already created; the address can be added later from the profile
    }
  };

  const sendOtp = async () => {
    const p = phone.trim();
    const errs: { name?: string; phone?: string } = {};
    if (tab === 'signup' && !name.trim()) errs.name = t('nameRequired');
    if (!p) errs.phone = t('mobileRequired');
    else if (!/^\d{10}$/.test(p)) errs.phone = t('invalidMobile');
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      // 1. Don't spend an SMS on the wrong flow
      const r = await fetch(`${API_URL}/auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p }),
      });
      const check = await r.json();
      if (!check.success) {
        showToast('❌ ' + (check.message || 'Please try again'));
        return;
      }
      if (tab === 'login' && !check.exists) {
        setErrors({ phone: 'This number is not registered. Please sign up first.' });
        return;
      }
      if (tab === 'signup' && check.exists) {
        setErrors({ phone: 'This number is already registered. Please login.' });
        return;
      }

      // 2. Send the OTP
      if (!verifierRef.current) {
        verifierRef.current = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', { size: 'invisible' });
      }
      confirmationRef.current = await signInWithPhoneNumber(firebaseAuth, '+91' + p, verifierRef.current);
      setStep('otp');
      setOtp('');
      setResendIn(30);
      showToast('📩 OTP sent to +91 ' + p);
    } catch (e: any) {
      verifierRef.current?.clear();
      verifierRef.current = null;
      showToast('❌ ' + (e?.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : 'Could not send OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6 || !confirmationRef.current) {
      setErrors({ otp: 'Enter the 6-digit OTP' });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const cred = await confirmationRef.current.confirm(otp);
      const idToken = await cred.user.getIdToken();
      await firebaseAuth.signOut(); // Firebase is only used to verify the phone number

      const err = tab === 'login'
        ? await loginWithToken(idToken)
        : await signupWithToken(idToken, name.trim(), email.trim());

      if (err) {
        showToast('❌ ' + err);
        setStep('details');
        return;
      }

      if (tab === 'signup') await saveSignupAddress();
      goNext();
    } catch (e: any) {
      const message =
        e?.code === 'auth/invalid-verification-code'
          ? 'Wrong OTP. Please check and retry.'
          : e?.code === 'auth/code-expired'
          ? 'OTP expired. Please resend.'
          : 'Verification failed. Please try again.';
      setErrors({ otp: message });
      showToast('❌ ' + message);
    } finally {
      setLoading(false);
    }
  };

  const primaryButtonClass = `w-full py-3.5 mt-4 text-base font-bold text-white rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-900/50' : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-orange-200'}`;

  const linkClass = `font-bold cursor-pointer transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-orange-500 hover:text-orange-600'}`;

  const spinner = <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0f0d1a]' : 'bg-gradient-to-br from-orange-50 via-white to-yellow-50'}`}>
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-indigo-900/20' : 'bg-orange-200/40'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-purple-900/20' : 'bg-yellow-200/40'}`} />

      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => router.push('/customer')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border transition-all active:scale-95 ${isDark ? 'text-gray-300 bg-[#1a1535]/80 backdrop-blur-md border-[#2d2450] hover:bg-indigo-500/10 hover:text-indigo-400' : 'text-amber-900 bg-white/80 backdrop-blur-md border-orange-100 hover:bg-orange-50 hover:text-orange-600'}`}
        >
          ← Back to Shop
        </button>
      </div>

      <div className="text-center mb-8 relative z-10 flex flex-col items-center">
        <div className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-6 transition-transform duration-300 ${isDark ? 'bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-indigo-900/30' : 'bg-gradient-to-tr from-orange-500 to-yellow-400 shadow-orange-200'}`}>
          <span className="text-5xl text-white drop-shadow-sm">✿</span>
        </div>
        <h1 className={`font-extrabold text-4xl sm:text-5xl tracking-tight text-transparent bg-clip-text leading-tight ${isDark ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-gradient-to-r from-orange-600 to-yellow-500'}`}>
          Shivkrupa Emporium
        </h1>
        <p className={`font-bold mt-2 tracking-[0.2em] uppercase text-xs ${isDark ? 'text-gray-500' : 'text-amber-900/50'}`}>
          Your Neighbourhood Everything Store
        </p>
        <div className={`mt-3 px-4 py-1.5 rounded-full border inline-block ${isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-orange-100/50 border-orange-200'}`}>
          <p className={`font-bold text-sm tracking-wider ${isDark ? 'text-indigo-400' : 'text-orange-600'}`}>
            📞 9975636622
          </p>
        </div>
      </div>

      <div className={`w-full max-w-lg backdrop-blur-xl border shadow-2xl rounded-[2rem] p-8 sm:p-10 relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#1a1535]/90 border-[#2d2450] shadow-black/20' : 'bg-white/90 border-orange-100 shadow-orange-900/10'}`}>
        <div className={`absolute top-0 left-0 w-full h-1.5 ${isDark ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600' : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-600'}`} />

        <div className={`flex rounded-xl p-1.5 mb-6 border ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-orange-50 border-orange-100'}`}>
          {(['login', 'signup'] as Tab[]).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => switchTab(tabKey)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${tab === tabKey
                ? (isDark ? 'bg-[#1a1535] text-indigo-400 shadow-sm border border-[#2d2450]' : 'bg-white text-orange-600 shadow-sm border border-orange-100/50')
                : (isDark ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-amber-900/50 hover:text-orange-500 hover:bg-orange-100/30')
                }`}
            >
              {tabKey === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step === 'details' ? (
            <>
              {tab === 'signup' && (
                <Field
                  label="Full Name"
                  value={name}
                  onChange={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
                  placeholder="Your full name"
                  error={errors.name}
                  onEnter={sendOtp}
                />
              )}
              <Field
                label="Phone Number"
                value={phone}
                onChange={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: undefined })); }}
                placeholder="10-digit mobile number"
                type="tel"
                maxLength={10}
                error={errors.phone}
                onEnter={sendOtp}
              />

              {tab === 'signup' && (
                <>
                  <Field label="Email (optional)" value={email} onChange={setEmail} placeholder="your@email.com" type="email" onEnter={sendOtp} />

                  <button
                    type="button"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors mb-4"
                  >
                    {showAddressForm ? '− Hide Address Details' : '+ Add Address Details (Optional)'}
                  </button>

                  {showAddressForm && (
                    <div className={`space-y-3 mb-4 p-4 rounded-xl border ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-orange-50 border-orange-100'}`}>
                      <Field label="Street Address" value={address.street} onChange={(v) => setAddress({ ...address, street: v })} placeholder="House No., Street Name" />
                      <Field label="Area/Locality" value={address.area} onChange={(v) => setAddress({ ...address, area: v })} placeholder="Area, Landmark" />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} placeholder="City" />
                        <Field label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} placeholder="State" />
                      </div>
                      <Field label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} placeholder="6-digit pincode" />
                    </div>
                  )}
                </>
              )}

              <button onClick={sendOtp} disabled={loading} className={primaryButtonClass}>
                {loading ? (
                  <span className="flex items-center gap-2">{spinner}Sending...</span>
                ) : (
                  'Send OTP →'
                )}
              </button>

              <p className={`text-center mt-6 text-sm font-medium ${isDark ? 'text-gray-500' : 'text-amber-900/60'}`}>
                {tab === 'login' ? 'New here? ' : 'Already have an account? '}
                <span className={linkClass} onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}>
                  {tab === 'login' ? 'Create an account' : 'Login'}
                </span>
              </p>
            </>
          ) : (
            <>
              <p className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-amber-900/70'}`}>
                Enter the 6-digit code sent to <b>+91 {phone}</b>{' '}
                <span className={linkClass} onClick={() => !loading && setStep('details')}>
                  Change
                </span>
              </p>
              <Field
                label="OTP"
                value={otp}
                onChange={(v) => { setOtp(v); setErrors((e) => ({ ...e, otp: undefined })); }}
                placeholder="6-digit OTP"
                type="tel"
                maxLength={6}
                error={errors.otp}
                onEnter={verifyOtp}
              />

              <button onClick={verifyOtp} disabled={loading} className={primaryButtonClass}>
                {loading ? (
                  <span className="flex items-center gap-2">{spinner}Verifying...</span>
                ) : (
                  'Verify & Continue →'
                )}
              </button>

              <button
                disabled={resendIn > 0 || loading}
                onClick={sendOtp}
                className={`w-full mt-4 text-sm font-bold disabled:opacity-40 ${isDark ? 'text-indigo-400' : 'text-orange-500'}`}
              >
                {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
              </button>
            </>
          )}
        </div>

        {/* Invisible reCAPTCHA mounts here */}
        <div id="recaptcha-container" />

        <div className={`mt-8 pt-4 border-t text-center ${isDark ? 'border-[#2d2450]' : 'border-orange-50'}`}>
          <p className={`text-xs font-medium ${isDark ? 'text-gray-600' : 'text-amber-900/40'}`}>
            Admin?{' '}
            <a href="/admin/login" className={`font-bold transition-colors ${isDark ? 'text-gray-500 hover:text-indigo-400' : 'text-amber-900/60 hover:text-orange-500'}`}>
              Click here to login
            </a>
          </p>
        </div>
      </div>

      <Toast />
    </main>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text', maxLength, error, onEnter,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; maxLength?: number; error?: string; onEnter?: () => void;
}) {
  const { isDark } = useTheme();
  return (
    <div className="mb-3 text-left">
      <label className={`block mb-1.5 text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-amber-950/60'}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => {
          const v = type === 'tel' ? e.target.value.replace(/\D/g, '') : e.target.value;
          onChange(maxLength ? v.slice(0, maxLength) : v);
        }}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border font-medium focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-400 ring-2 ring-red-400/20' : ''} ${isDark ? 'border-[#2d2450] bg-[#13102a] text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:ring-indigo-500/10 focus:bg-[#1a1535]' : 'border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 focus:border-orange-500 focus:ring-orange-500/10 focus:bg-white'}`}
        onKeyDown={e => {
          if (e.key === 'Enter' && onEnter) onEnter();
        }}
      />
      {error && (
        <p className="mt-1 text-xs font-bold text-red-500">{error}</p>
      )}
    </div>
  );
}
