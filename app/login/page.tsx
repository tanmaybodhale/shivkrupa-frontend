'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import LocationPicker from '@/components/customer/LocationPicker';
import { User } from '@/lib/types';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const { login, signup, showToast } = useApp();
  const { isDark } = useTheme();
  const { t } = useLang();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);

  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ id?: string; pass?: string }>({});

  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupErrors, setSignupErrors] = useState<{ name?: string; phone?: string; pass?: string }>({});

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState<{
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    location?: { lat: number; lng: number };
  }>({
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    location: undefined,
  });

  const handleLogin = async () => {
    const errors: { id?: string; pass?: string } = {};
    if (!loginId.trim()) errors.id = t('mobileRequired');
    if (!loginPass.trim()) errors.pass = t('passwordRequired');
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }
    setLoginErrors({});
    setLoading(true);
    const role = (loginId === 'admin' || loginId === '9975636622') ? 'shopkeeper' : 'customer';
    const err = await login(loginId.trim(), loginPass.trim(), role);
    setLoading(false);
    if (err) {
      setLoginErrors({ pass: t('wrongCredentials') });
      showToast('❌ ' + t('wrongCredentials'));
      return;
    }

    const pendingCheckout = sessionStorage.getItem('pending_checkout');
    if (pendingCheckout && role === 'customer') {
      sessionStorage.removeItem('pending_checkout');
      router.push('/customer?checkout=true');
    } else {
      router.push(role === 'shopkeeper' ? '/admin' : '/customer');
    }
  };

  const handleSignup = async () => {
    const errors: { name?: string; phone?: string; pass?: string } = {};
    if (!signupName.trim()) errors.name = t('nameRequired');
    if (!signupPhone.trim()) {
      errors.phone = t('mobileRequired');
    } else if (!/^\d{10}$/.test(signupPhone.trim())) {
      errors.phone = t('invalidMobile');
    }
    if (!signupPass.trim()) errors.pass = t('passwordRequired');
    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }
    setSignupErrors({});
    setLoading(true);
    const err = await signup(
      signupName.trim(),
      signupPhone.trim(),
      signupEmail.trim(),
      signupPass.trim(),
      showAddressForm ? address : undefined
    );
    setLoading(false);
    if (err) {
      showToast('❌ ' + err);
      return;
    }
    showToast('✅ Account created! Please sign in.');
    setTab('login');
  };

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
          {(['login', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => !loading && setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${tab === t
                ? (isDark ? 'bg-[#1a1535] text-indigo-400 shadow-sm border border-[#2d2450]' : 'bg-white text-orange-600 shadow-sm border border-orange-100/50')
                : (isDark ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-amber-900/50 hover:text-orange-500 hover:bg-orange-100/30')
                }`}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {tab === 'login' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Field label="Phone / Email" value={loginId} onChange={(v) => { setLoginId(v); setLoginErrors(e => ({ ...e, id: undefined })); }} placeholder="Enter phone or email" error={loginErrors.id} />
            <Field label="Password" value={loginPass} onChange={(v) => { setLoginPass(v); setLoginErrors(e => ({ ...e, pass: undefined })); }} placeholder="Enter password" type="password" error={loginErrors.pass} />

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3.5 mt-4 text-base font-bold text-white rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-900/50' : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-orange-200'}`}
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

            <p className={`text-center mt-6 text-sm font-medium ${isDark ? 'text-gray-500' : 'text-amber-900/60'}`}>
              New here?{' '}
              <span
                className={`font-bold cursor-pointer transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-orange-500 hover:text-orange-600'}`}
                onClick={() => !loading && setTab('signup')}
              >
                Create an account
              </span>
            </p>
          </div>
        )}

        {tab === 'signup' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Field label="Full Name" value={signupName} onChange={(v) => { setSignupName(v); setSignupErrors(e => ({ ...e, name: undefined })); }} placeholder="Your full name" error={signupErrors.name} />
            <Field label="Phone Number" value={signupPhone} onChange={(v) => { setSignupPhone(v); setSignupErrors(e => ({ ...e, phone: undefined })); }} placeholder="10-digit phone number" type="tel" error={signupErrors.phone} />
            <Field label="Email (optional)" value={signupEmail} onChange={setSignupEmail} placeholder="your@email.com" type="email" />
            <Field label="Password" value={signupPass} onChange={(v) => { setSignupPass(v); setSignupErrors(e => ({ ...e, pass: undefined })); }} placeholder="Create a password" type="password" error={signupErrors.pass} />

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

                <div>
                  <label className="block mb-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-amber-950/60">
                    Pick Location on Map
                  </label>
                  <LocationPicker
                    location={address.location || null}
                    onLocationChange={(loc) => setAddress({ ...address, location: loc || undefined })}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className={`w-full py-3.5 text-base font-bold text-white rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-900/50' : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-orange-200'}`}
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
                className={`font-bold cursor-pointer transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-orange-500 hover:text-orange-600'}`}
                onClick={() => !loading && setTab('login')}
              >
                Sign In
              </span>
            </p>
          </div>
        )}

        <div className={`mt-8 pt-4 border-t text-center ${isDark ? 'border-[#2d2450]' : 'border-orange-50'}`}>
          <p className={`text-xs font-medium ${isDark ? 'text-gray-600' : 'text-amber-900/40'}`}>
            Admin?{' '}
            <a href="/admin/login" className={`font-bold transition-colors ${isDark ? 'text-gray-500 hover:text-indigo-400' : 'text-amber-900/60 hover:text-orange-500'}`}>
              Click here to login
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text', error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; error?: string;
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
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border font-medium focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-400 ring-2 ring-red-400/20' : ''} ${isDark ? 'border-[#2d2450] bg-[#13102a] text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:ring-indigo-500/10 focus:bg-[#1a1535]' : 'border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 focus:border-orange-500 focus:ring-orange-500/10 focus:bg-white'}`}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            const button = e.currentTarget.closest('.animate-in')?.querySelector('button') as HTMLButtonElement;
            if (button) button.click();
          }
        }}
      />
      {error && (
        <p className="mt-1 text-xs font-bold text-red-500">{error}</p>
      )}
    </div>
  );
}
