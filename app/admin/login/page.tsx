'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShieldCheck } from 'lucide-react'; // Added a nice security icon for the admin vibe

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLoginPage() {
  const { showToast, setCurrentUser } = useApp();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showToast('❌ Please enter username and password');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await res.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('sk_session', JSON.stringify(data.user));
        showToast('✅ Welcome Admin!');
        router.push('/admin');
      } else {
        showToast('❌ ' + data.message);
      }
    } catch (error) {
      showToast('❌ Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Logo */}
      <div className="text-center mb-8 relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 mb-4 bg-gradient-to-tr from-amber-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200 rotate-3 hover:rotate-6 transition-transform duration-300">
          <ShieldCheck size={40} className="text-white drop-shadow-sm" strokeWidth={2} />
        </div>
        <h1 className="font-extrabold text-4xl sm:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-700 leading-tight">
          Shivkrupa Admin
        </h1>
        <div className="mt-3 px-4 py-1.5 bg-orange-100/50 rounded-full border border-orange-200 inline-flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="font-bold text-amber-900 text-xs tracking-[0.15em] uppercase">
            Secure Portal
          </p>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-orange-100 shadow-2xl shadow-orange-900/10 rounded-[2rem] p-8 sm:p-10 relative z-10 overflow-hidden">
        
        {/* Decorative top gradient line - slightly darker amber to indicate admin */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700" />

        <div className="text-center mb-8">
          <h2 className="text-xl font-black text-amber-950">
            Authorized Access Only
          </h2>
          <p className="text-sm font-medium text-amber-900/60 mt-1">
            Enter your credentials to manage the store
          </p>
        </div>

        {/* Form Fields */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-4 text-left">
            <label className="block mb-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-amber-950/60">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="mb-6 text-left">
            <label className="block mb-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-amber-950/60">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 mt-2 text-base font-bold text-white rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              'Access Dashboard →'
            )}
          </button>
        </div>

        {/* Back link */}
        <div className="mt-8 pt-4 border-t border-orange-50 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm font-bold text-amber-900/60 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 w-full"
          >
            ← Back to Customer Login
          </button>
        </div>
      </div>
    </main>
  );
}