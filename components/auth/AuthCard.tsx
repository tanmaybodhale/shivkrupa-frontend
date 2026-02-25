'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

type Tab  = 'login'  | 'signup';

export default function   AuthCard() {
  const { login, signup, showToast } = useApp();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginId,   setLoginId]   = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Signup fields
  const [signupName,  setSignupName]  = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass,  setSignupPass]  = useState('');

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPass.trim()) {
      showToast('❌ Please enter username and password');
      return;
    }
    setLoading(true);
    const role = (loginId === 'admin' || loginId === '9975636622') ? 'shopkeeper' : 'customer';
    const err = await login(loginId.trim(), loginPass.trim(), role);
    setLoading(false);
    if (err) { 
      showToast('❌ ' + err); 
      return; 
    }
    router.push(role === 'shopkeeper' ? '/admin' : '/customer');
  };

  const handleSignup = async () => {
    if (!signupName.trim() || !signupPhone.trim() || !signupPass.trim()) {
      showToast('❌ Please fill all required fields');
      return;
    }
    if (!/^\d{10}$/.test(signupPhone.trim())) {
      showToast('❌ Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    const err = await signup(signupName.trim(), signupPhone.trim(), signupEmail.trim(), signupPass.trim());
    setLoading(false);
    if (err) { 
      showToast('❌ ' + err); 
      return; 
    }
    showToast('✅ Account created! Please sign in.');
    setTab('login');
  };

  return (
    <div
      className="w-full rounded-3xl p-9"
      style={{
        background: 'rgba(255,255,255,.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201,148,26,.25)',
        boxShadow: '0 24px 80px rgba(0,0,0,.4)',
      }}
    >
      {/* Tab bar */}
      <div
        className="flex rounded-xl p-1 mb-7"
        style={{ background: 'rgba(0,0,0,.3)' }}
      >
        {(['login','signup'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => !loading && setTab(t)}
            className="flex-1 py-2.5 rounded-[9px] text-sm font-bold transition-all capitalize"
            style={tab === t
              ? { background: 'var(--gold)', color: 'var(--dark)' }
              : { color: 'rgba(255,255,255,.5)' }
            }
          >
            {t === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {/* LOGIN */}
      {tab === 'login' && (
        <div className="fade-up">
          <Field label="Phone / Email" value={loginId}   onChange={setLoginId}   placeholder="Enter phone or email" />
          <Field label="Password"      value={loginPass} onChange={setLoginPass} placeholder="Enter password" type="password" />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-gold w-full py-3.5 mt-2 text-base disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
          <p className="text-center mt-4 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
            New here?{' '}
            <span
              className="font-semibold cursor-pointer"
              style={{ color: 'var(--gold-light)' }}
              onClick={() => !loading && setTab('signup')}
            >
              Create account
            </span>
          </p>
        </div>
      )}

      {/* SIGNUP */}
      {tab === 'signup' && (
        <div className="fade-up">
          <Field label="Full Name"        value={signupName}  onChange={setSignupName}  placeholder="Your full name" />
          <Field label="Phone Number"     value={signupPhone} onChange={setSignupPhone} placeholder="10-digit phone number" type="tel" />
          <Field label="Email (optional)" value={signupEmail} onChange={setSignupEmail} placeholder="your@email.com" type="email" />
          <Field label="Password"         value={signupPass}  onChange={setSignupPass}  placeholder="Create a password" type="password" />
          <button
            onClick={handleSignup}
            disabled={loading}
            className="btn-gold w-full py-3.5 mt-2 text-base disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
          <p className="text-center mt-4 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
            Already have an account?{' '}
            <span
              className="font-semibold cursor-pointer"
              style={{ color: 'var(--gold-light)' }}
              onClick={() => !loading && setTab('login')}
            >
              Sign In
            </span>
          </p>
        </div>
      )}

      {/* Admin link */}
      <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,.3)' }}>
        Admin?{' '}
        <a href="/admin/login" className="underline hover:text-yellow-400">Click here to login</a>
      </p>
    </div>
  );
}

/* ── small reusable input ── */
function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string;
}) {
  return (
    <div className="mb-4">
      <label
        className="block mb-1.5 text-xs font-bold uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,.55)' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="auth-input"
        onKeyDown={e => { if (e.key === 'Enter') (e.currentTarget.closest('div.fade-up')?.querySelector('button') as HTMLButtonElement)?.click(); }}
      />
    </div>
  );
}
