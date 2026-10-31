'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { useApp, NEEDS_NAME } from '@/context/AppContext';

// details -> otp -> (name, only for a number we have never seen)
type Step = 'details' | 'otp' | 'name';

export default function AuthCard() {
  const { loginWithToken, showToast } = useApp();
  const router = useRouter();

  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const idTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => () => { verifierRef.current?.clear(); }, []);

  const backToStart = (message?: string) => {
    idTokenRef.current = null;
    setStep('details');
    setOtp('');
    if (message) showToast('❌ ' + message);
  };

  const sendOtp = async () => {
    const p = phone.trim();
    if (!/^\d{10}$/.test(p)) return showToast('❌ Enter a valid 10-digit phone number');

    setLoading(true);
    try {
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
    if (otp.length !== 6 || !confirmationRef.current) return showToast('❌ Enter the 6-digit OTP');

    setLoading(true);
    try {
      const cred = await confirmationRef.current.confirm(otp);
      const idToken = await cred.user.getIdToken();
      await firebaseAuth.signOut(); // Firebase is only used to verify the phone
      idTokenRef.current = idToken;

      const err = await loginWithToken(idToken);
      if (err === NEEDS_NAME) {
        setStep('name');
        return;
      }
      if (err) {
        backToStart(err);
        return;
      }
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

  const submitName = async () => {
    if (!name.trim()) return showToast('❌ Please enter your name');
    if (!idTokenRef.current) return backToStart('Please verify your number again.');

    setLoading(true);
    try {
      const err = await loginWithToken(idTokenRef.current, name.trim(), email.trim());
      if (err) {
        backToStart(err === NEEDS_NAME ? 'Please verify your number again.' : err);
        return;
      }
      router.push('/customer');
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
          {step === 'details' ? 'Login with your mobile number' : step === 'otp' ? 'Verify your number' : 'One last step'}
        </p>
      </div>

      <div className="fade-up animate-in fade-in slide-in-from-bottom-2 duration-300">
        {step === 'details' && (
          <>
            <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="10-digit mobile number" type="tel" maxLength={10} onEnter={sendOtp} />
            <PrimaryButton onClick={sendOtp} loading={loading} idle="Send OTP →" busy="Sending..." />
          </>
        )}

        {step === 'otp' && (
          <>
            <p className="text-sm text-amber-900/70 mb-4">
              Enter the 6-digit code sent to <b>+91 {phone}</b>{' '}
              <span className="text-orange-500 font-bold cursor-pointer" onClick={() => !loading && backToStart()}>
                Change
              </span>
            </p>
            <Field label="OTP" value={otp} onChange={setOtp} placeholder="6-digit OTP" type="tel" maxLength={6} onEnter={verifyOtp} />
            <PrimaryButton onClick={verifyOtp} loading={loading} idle="Verify & Continue →" busy="Verifying..." />
            <button
              disabled={resendIn > 0 || loading}
              onClick={sendOtp}
              className="w-full mt-4 text-sm font-bold text-orange-500 disabled:text-amber-900/30"
            >
              {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
            </button>
          </>
        )}

        {step === 'name' && (
          <>
            <p className="text-sm text-amber-900/70 mb-4">
              Your number <b>+91 {phone}</b> is verified. Tell us your name to finish setting up your account.
            </p>
            <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Rahul Sharma" onEnter={submitName} />
            <Field label="Email (optional)" value={email} onChange={setEmail} placeholder="your@email.com" type="email" onEnter={submitName} />
            <PrimaryButton onClick={submitName} loading={loading} idle="Continue →" busy="Please wait..." />
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
  label, value, onChange, placeholder, type = 'text', maxLength, onEnter,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; maxLength?: number; onEnter?: () => void;
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
          if (e.key === 'Enter' && onEnter) onEnter();
        }}
      />
    </div>
  );
}
