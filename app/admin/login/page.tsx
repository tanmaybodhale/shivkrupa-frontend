'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { ShieldCheck } from 'lucide-react'; // Added a nice security icon for the admin vibe

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLoginPage() {
  const { showToast, setCurrentUser } = useApp();
  const { isDark } = useTheme();
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
    <main className={`min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0f0d1a]' : 'bg-gradient-to-br from-orange-50 via-white to-yellow-50'}`}>

      {/* Decorative Background Blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-indigo-900/20' : 'bg-orange-200/40'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-purple-900/20' : 'bg-yellow-200/40'}`} />

      {/* Header / Logo */}
      <div className="text-center mb-8 relative z-10 flex flex-col items-center">
        <div className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-6 transition-transform duration-300 ${isDark ? 'bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-indigo-900/30' : 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-orange-200'}`}>
          <ShieldCheck size={40} className="text-white drop-shadow-sm" strokeWidth={2} />
        </div>
        <h1 className={`font-extrabold text-4xl sm:text-5xl tracking-tight text-transparent bg-clip-text leading-tight ${isDark ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-gradient-to-r from-orange-600 to-amber-700'}`}>
          Shivkrupa Admin
        </h1>
        <div className={`mt-3 px-4 py-1.5 rounded-full border inline-flex items-center gap-2 ${isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-orange-100/50 border-orange-200'}`}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className={`font-bold text-xs tracking-[0.15em] uppercase ${isDark ? 'text-indigo-400' : 'text-amber-900'}`}>
            Secure Portal
          </p>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className={`w-full max-w-md backdrop-blur-xl border shadow-2xl rounded-[2rem] p-8 sm:p-10 relative z-10 overflow-hidden ${isDark ? 'bg-[#1a1535]/90 border-[#2d2450] shadow-black/20' : 'bg-white/90 border-orange-100 shadow-orange-900/10'}`}>

        <div className={`absolute top-0 left-0 w-full h-1.5 ${isDark ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600' : 'bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700'}`} />

        <div className="text-center mb-8">
          <h2 className={`text-xl font-black ${isDark ? 'text-gray-100' : 'text-amber-950'}`}>
            Authorized Access Only
          </h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-gray-500' : 'text-amber-900/60'}`}>
            Enter your credentials to manage the store
          </p>
        </div>

        {/* Form Fields */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-4 text-left">
            <label className={`block mb-1.5 text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-amber-950/60'}`}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className={`w-full px-4 py-3 rounded-xl border font-medium focus:outline-none focus:ring-4 transition-all ${isDark ? 'border-[#2d2450] bg-[#13102a] text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:ring-indigo-500/10 focus:bg-[#1a1535]' : 'border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 focus:border-orange-500 focus:ring-orange-500/10 focus:bg-white'}`}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="mb-6 text-left">
            <label className={`block mb-1.5 text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-amber-950/60'}`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className={`w-full px-4 py-3 rounded-xl border font-medium focus:outline-none focus:ring-4 transition-all ${isDark ? 'border-[#2d2450] bg-[#13102a] text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:ring-indigo-500/10 focus:bg-[#1a1535]' : 'border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 focus:border-orange-500 focus:ring-orange-500/10 focus:bg-white'}`}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3.5 mt-2 text-base font-bold text-white rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-900/50' : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 shadow-orange-200'}`}
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
        <div className={`mt-8 pt-4 border-t text-center ${isDark ? 'border-[#2d2450]' : 'border-orange-50'}`}>
          <button
            onClick={() => router.push('/')}
            className={`text-sm font-bold transition-colors flex items-center justify-center gap-2 w-full ${isDark ? 'text-gray-500 hover:text-indigo-400' : 'text-amber-900/60 hover:text-orange-500'}`}
          >
            ← Back to Customer Login
          </button>
        </div>
      </div>
    </main>
  );
}