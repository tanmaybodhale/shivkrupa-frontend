'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

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
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1208 0%, #3a2008 40%, #6b3a1f 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 60% 20%, rgba(201,148,26,.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(201,148,26,.10) 0%, transparent 50%)',
        }}
      />

      <div className="text-center mb-8 relative z-10">
        <span className="block text-6xl mb-3">✿</span>
        <h1 className="font-display text-4xl font-black" style={{ color: '#f0c040', letterSpacing: '2px' }}>
          Shivkrupa Admin
        </h1>
        <p className="italic mt-2" style={{ color: 'rgba(240,192,64,.7)' }}>
          Admin Dashboard Login
        </p>
      </div>

      <div
        className="w-full rounded-3xl p-8 relative z-10"
        style={{
          background: 'rgba(255,255,255,.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(201,148,26,.25)',
          boxShadow: '0 24px 80px rgba(0,0,0,.4)',
          maxWidth: 400,
        }}
      >
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--gold-light)' }}>
          🔐 Admin Login
        </h2>

        <div className="mb-4">
          <label className="block mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.55)' }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter admin username"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.55)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-base transition-all"
          style={{
            background: 'var(--gold)',
            color: 'var(--dark)',
          }}
        >
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm font-semibold"
            style={{ color: 'var(--gold-light)' }}
          >
            ← Back to Customer Login
          </button>
        </div>
      </div>
    </main>
  );
}
