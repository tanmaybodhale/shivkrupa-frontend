'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function Navbar({ showAuthButtons = false }: { showAuthButtons?: boolean }) {
  const { currentUser, logout, cart, setCartOpen } = useApp();
  const router = useRouter();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleLogout = () => {
    logout();
    router.replace('/customer');
  };

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 border-b-2"
      style={{
        background: 'var(--dark)',
        borderColor: 'var(--gold)',
        boxShadow: '0 4px 20px rgba(0,0,0,.3)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/customer')}>
        <span className="text-3xl">✿</span>
        <div>
          <h2
            className="font-display leading-none"
            style={{ color: 'var(--gold-light)', fontSize: 20 }}
          >
            Shivkrupa Emporium
          </h2>
          <span
            className="block text-xs tracking-widest mt-0.5"
            style={{ color: 'rgba(255,255,255,.4)' }}
          >
            YOUR NEIGHBOURHOOD STORE
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span
          className="text-sm font-semibold hidden sm:block"
          style={{ color: 'var(--gold-light)' }}
        >
          📞 9975636622
        </span>

        {/* Login/Signup buttons for unauthenticated users */}
        {!currentUser && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/login')}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}
            >
              Login
            </button>
          </div>
        )}

        {/* User avatar + name */}
        {currentUser && (
          <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,.7)' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--brown))' }}
            >
              {currentUser.name[0].toUpperCase()}
            </div>
            <span className="text-sm hidden sm:block">{currentUser.name}</span>
          </div>
        )}

        {/* Cart button - visible for everyone */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative rounded-xl px-3 py-2 text-lg transition-colors"
          style={{
            background: 'rgba(201,148,26,.15)',
            border: '1px solid rgba(201,148,26,.4)',
            color: 'var(--gold-light)',
          }}
        >
          🛒
          {cartCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
              style={{ background: '#e53935' }}
            >
              {cartCount}
            </span>
          )}
        </button>

        {/* Admin Dashboard Link */}
        {currentUser?.role === 'shopkeeper' && (
          <button
            onClick={() => router.push('/admin')}
            className="text-sm font-semibold rounded-xl px-3 py-2 transition-all"
            style={{
              background: 'rgba(201,148,26,.15)',
              border: '1px solid rgba(201,148,26,.4)',
              color: 'var(--gold-light)',
            }}
          >
            🛠️ Admin
          </button>
        )}

        <button
          onClick={handleLogout}
          className="text-sm font-semibold rounded-xl px-3 py-2 transition-all"
          style={{
            background: 'rgba(255,255,255,.08)',
            color: 'rgba(255,255,255,.6)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.15)';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.08)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.6)';
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
