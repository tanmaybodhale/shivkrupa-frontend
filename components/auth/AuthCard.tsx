'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

type Tab  = 'login'  | 'signup';
type Role = 'customer' | 'shopkeeper';

export default function AuthCard() {
  const { login, signup, showToast } = useApp();
  const router = useRouter();

  const [tab,  setTab]  = useState<Tab>('login');
  const [role, setRole] = useState<Role>('customer');

  // Login fields
  const [loginId,   setLoginId]   = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Signup fields
  const [signupName,  setSignupName]  = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass,  setSignupPass]  = useState('');

  const handleLogin = async () => {
    const err = await login(loginId.trim(), loginPass.trim(), role);
    if (err) { showToast('❌ ' + err); return; }
    router.push(role === 'shopkeeper' ? '/shopkeeper' : '/customer');
  };

  const handleSignup = async () => {
    const err = await signup(signupName.trim(), signupPhone.trim(), signupEmail.trim(), signupPass.trim());
    if (err) { showToast('❌ ' + err); return; }
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
            onClick={() => setTab(t)}
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

      {/* Role select */}
      <div className="flex gap-2.5 mb-6">
        {(['customer','shopkeeper'] as Role[]).map(r => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all capitalize"
            style={{
              border: '2px solid',
              borderColor: role === r ? 'var(--gold)' : 'rgba(201,148,26,.3)',
              background: role === r ? 'rgba(201,148,26,.15)' : 'transparent',
              color: role === r ? 'var(--gold-light)' : 'rgba(255,255,255,.5)',
            }}
          >
            {r === 'customer' ? '🛍️ Customer' : '🏪 Shopkeeper'}
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
            className="btn-gold w-full py-3.5 mt-2 text-base"
          >
            Sign In →
          </button>
          <p className="text-center mt-4 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
            New here?{' '}
            <span
              className="font-semibold cursor-pointer"
              style={{ color: 'var(--gold-light)' }}
              onClick={() => setTab('signup')}
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
            className="btn-gold w-full py-3.5 mt-2 text-base"
          >
            Create Account →
          </button>
          <p className="text-center mt-4 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
            Already have an account?{' '}
            <span
              className="font-semibold cursor-pointer"
              style={{ color: 'var(--gold-light)' }}
              onClick={() => setTab('login')}
            >
              Sign In
            </span>
          </p>
        </div>
      )}

      {/* Demo hint */}
      {tab === 'login' && role === 'shopkeeper' && (
        <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,.3)' }}>
          Demo — username: <b>admin</b> &nbsp;|&nbsp; password: <b>admin123</b>
        </p>
      )}
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
