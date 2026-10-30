'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { useApp } from '@/context/AppContext';

type Tab = 'login' | 'signup';

// Same base URL AppContext uses (already ends in /api)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AuthCard() {
  const { loginWithToken, signupWithToken, showToast } = useApp();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('login');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => () => { verifierRef.current?.clear(); }, []);

  const switchTab = (t: Tab) => {
    if (loading) return;
    setTab(t);
    setStep('details');
    setOtp('');
  };

  const sendOtp = async () => {
    const p = phone.trim();
    if (!/^\d{10}$/.test(p)) return showToast('❌ Enter a valid 10-digit phone number');
    if (tab === 'signup' && !name.trim()) return showToast('❌ Please enter your name');

    setLoading(true);
    try {
      // 1. Don't spend an SMS on the wrong flow
      const r = await fetch(`${API_URL}/auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p }),
      });
      const check = await r.json();
      if (!check.success) { showToast('❌ ' + (check.message || 'Please try again')); return; }
      if (tab === 'login' && !check.exists) { showToast('❌ Number not registered. Please sign up first.'); return; }
      if (tab === 'signup' && check.exists) { showToast('❌ Already registered. Please login.'); return; }

      // 2. Send the OTP
      if (!verifierRef.current) {
        verifierRef.current = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', { size: 'invisible' });
      }
      confirmationRef.current = await signInWithPhoneNumber(firebaseAuth, '+91' + p, verifierRef.current);
      setStep('otp');
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
    if (otp.length !== 6 || !confirmationRef.current) return showToast('❌ Enter the 6-digit OTP');

    setLoading(true);
    try {
      const cred = await confirmationRef.current.confirm(otp);
      const idToken = await cred.user.getIdToken();
      await firebaseAuth.signOut(); // Firebase is only used to verify the phone

      const err = tab === 'login'
        ? await loginWithToken(idToken)
        : await signupWithToken(idToken, name.trim(), email.trim());

      if (err) { showToast('❌ ' + err); return; }
      router.push('/customer');
    } catch (e: any) {
      showToast('❌ ' + (e?.code === 'auth/invalid-verification-code'
        ? 'Wrong OTP. Please check and retry.'
        : e?.code === 'auth/code-expired'
        ? 'OTP expired. Please resend.'
        : 'Verification failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-[2rem] p-8 sm:p-10 bg-white/95 backdrop-blur-xl border border-orange-100 shadow-2xl shadow-orange-900/10 relative overflow-hidden">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-600" />

      {/* Header text */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-amber-950">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Shivkrupa</span>
        </h2>
        <p className="text-sm font-medium text-amber-900/60 mt-1">
          {tab === 'login' ? 'Login with your mobile number' : 'Join our neighbourhood store'}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex rounded-xl p-1.5 mb-8 bg-orange-50 border border-orange-100">
        {(['login', 'signup'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              tab === t
                ? 'bg-white text-orange-600 shadow-sm border border-orange-100/50'
                : 'text-amber-900/50 hover:text-orange-500 hover:bg-orange-100/30'
            }`}
          >
            {t === 'login' ? 'Login' : 'Sign Up'}
          </button>
        ))}
      </div>

      <div className="fade-up animate-in fade-in slide-in-from-bottom-2 duration-300">
        {step === 'details' ? (
          <>
            {tab === 'signup' && (
              <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Rahul Sharma" />
            )}
            <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="10-digit mobile number" type="tel" maxLength={10} />
            {tab === 'signup' && (
              <Field label="Email (optional)" value={email} onChange={setEmail} placeholder="your@email.com" type="email" />
            )}
            <PrimaryButton onClick={sendOtp} loading={loading} idle="Send OTP →" busy="Sending..." />
          </>
        ) : (
          <>
            <p className="text-sm text-amber-900/70 mb-4">
              Enter the 6-digit code sent to <b>+91 {phone}</b>{' '}
              <span className="text-orange-500 font-bold cursor-pointer" onClick={() => !loading && setStep('details')}>
                Change
              </span>
            </p>
            <Field label="OTP" value={otp} onChange={setOtp} placeholder="6-digit OTP" type="tel" maxLength={6} />
            <PrimaryButton onClick={verifyOtp} loading={loading} idle="Verify & Continue →" busy="Verifying..." />
            <button
              disabled={resendIn > 0 || loading}
              onClick={() => { setOtp(''); sendOtp(); }}
              className="w-full mt-4 text-sm font-bold text-orange-500 disabled:text-amber-900/30"
            >
              {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
            </button>
          </>
        )}
      </div>

      {/* Invisible reCAPTCHA mounts here */}
      <div id="recaptcha-container" />

      {/* Admin link */}
      <div className="mt-8 pt-4 border-t border-orange-50 text-center">
        <p className="text-xs font-medium text-amber-900/40">
          Admin?{' '}
          <a href="/admin/login" className="font-bold text-amber-900/60 hover:text-orange-500 transition-colors">
            Click here to login
          </a>
        </p>
      </div>
    </div>
  );
}

/* ── shared button ── */
function PrimaryButton({
  onClick, loading, idle, busy,
}: { onClick: () => void; loading: boolean; idle: string; busy: string }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3.5 mt-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {busy}
        </span>
      ) : idle}
    </button>
  );
}

/* ── small reusable input ── */
function Field({
  label, value, onChange, placeholder, type = 'text', maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; maxLength?: number;
}) {
  return (
    <div className="mb-4 text-left">
      <label className="block mb-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-amber-950/60">
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
        className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all"
        onKeyDown={e => {
          if (e.key === 'Enter') {
            const button = e.currentTarget.closest('.fade-up')?.querySelector('button') as HTMLButtonElement;
            if (button) button.click();
          }
        }}
      />
    </div>
  );
}
