'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const { login, signup, showToast } = useApp();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');

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
    
    // Maintain your existing checkout redirect logic
    const pendingCheckout = sessionStorage.getItem('pending_checkout');
    if (pendingCheckout && role === 'customer') {
      sessionStorage.removeItem('pending_checkout');
      router.push('/customer?checkout=true');
    } else {
      router.push(role === 'shopkeeper' ? '/admin' : '/customer');
    }
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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      
      {/* Decorative Background Blobs for Vibrancy */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Back to shop link */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => router.push('/customer')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-amber-900 bg-white/80 backdrop-blur-md shadow-sm border border-orange-100 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-95"
        >
          ← Back to Shop
        </button>
      </div>

      {/* Header / Logo */}
      <div className="text-center mb-8 relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 mb-4 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200 rotate-3 hover:rotate-6 transition-transform duration-300">
          <span className="text-5xl text-white drop-shadow-sm">✿</span>
        </div>
        <h1 className="font-extrabold text-4xl sm:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 leading-tight">
          Shivkrupa Emporium
        </h1>
        <p className="font-bold text-amber-900/50 mt-2 tracking-[0.2em] uppercase text-xs">
          Your Neighbourhood Everything Store
        </p>
        <div className="mt-3 px-4 py-1.5 bg-orange-100/50 rounded-full border border-orange-200 inline-block">
          <p className="font-bold text-orange-600 text-sm tracking-wider">
            📞 9975636622
          </p>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-orange-100 shadow-2xl shadow-orange-900/10 rounded-[2rem] p-8 sm:p-10 relative z-10 overflow-hidden">
        
        {/* Decorative top gradient line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-600" />

        {/* Tab bar */}
        <div className="flex rounded-xl p-1.5 mb-8 bg-orange-50 border border-orange-100">
          {(['login', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => !loading && setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${
                tab === t
                  ? 'bg-white text-orange-600 shadow-sm border border-orange-100/50'
                  : 'text-amber-900/50 hover:text-orange-500 hover:bg-orange-100/30'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* LOGIN */}
        {tab === 'login' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Field label="Phone / Email" value={loginId} onChange={setLoginId} placeholder="Enter phone or email" />
            <Field label="Password" value={loginPass} onChange={setLoginPass} placeholder="Enter password" type="password" />
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 mt-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
            
            <p className="text-center mt-6 text-sm text-amber-900/60 font-medium">
              New here?{' '}
              <span
                className="font-bold text-orange-500 hover:text-orange-600 cursor-pointer transition-colors"
                onClick={() => !loading && setTab('signup')}
              >
                Create an account
              </span>
            </p>
          </div>
        )}

        {/* SIGNUP */}
        {tab === 'signup' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Field label="Full Name" value={signupName} onChange={setSignupName} placeholder="Your full name" />
            <Field label="Phone Number" value={signupPhone} onChange={setSignupPhone} placeholder="10-digit phone number" type="tel" />
            <Field label="Email (optional)" value={signupEmail} onChange={setSignupEmail} placeholder="your@email.com" type="email" />
            <Field label="Password" value={signupPass} onChange={setSignupPass} placeholder="Create a password" type="password" />
            
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3.5 mt-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Account →'
              )}
            </button>
            
            <p className="text-center mt-6 text-sm text-amber-900/60 font-medium">
              Already have an account?{' '}
              <span
                className="font-bold text-orange-500 hover:text-orange-600 cursor-pointer transition-colors"
                onClick={() => !loading && setTab('login')}
              >
                Sign In
              </span>
            </p>
          </div>
        )}

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
    </main>
  );
}

/* ── Reusable Input Field ── */
function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string;
}) {
  return (
    <div className="mb-4 text-left">
      <label className="block mb-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-amber-950/60">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all"
        onKeyDown={e => { 
          if (e.key === 'Enter') {
            const button = e.currentTarget.closest('.animate-in')?.querySelector('button') as HTMLButtonElement;
            if (button) button.click();
          }
        }}
      />
    </div>
  );
}