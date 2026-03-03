'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { ShoppingCart, LogOut, LayoutDashboard, Phone, Package, User, Sun, Moon } from 'lucide-react';

export default function Navbar({ showAuthButtons = false }: { showAuthButtons?: boolean }) {
  const { currentUser, logout, cart, setCartOpen } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const [animating, setAnimating] = useState(false);

  const handleToggle = () => {
    setAnimating(true);
    toggleTheme();
    setTimeout(() => setAnimating(false), 500);
  };

  const handleLogout = () => {
    logout();
    router.replace('/customer');
  };

  return (
    <nav className={`sticky top-0 z-50 w-full border-b shadow-[0_4px_20px_-10px_rgba(249,115,22,0.3)] transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-r from-[#13102a] via-[#1a1535] to-[#13102a] border-[#2d2450] shadow-[0_4px_20px_-10px_rgba(99,80,180,0.3)]'
        : 'bg-gradient-to-r from-orange-200 via-orange-100 to-yellow-100 border-orange-300'
      }`}>
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Brand Section */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => router.push('/customer')}
        >
          <span className={`text-2xl group-hover:rotate-12 transition-transform duration-300 ${isDark ? 'text-indigo-400' : 'text-orange-600'}`}>
            ✿
          </span>
          <div className="flex flex-col justify-center leading-none">
            <span className={`font-display font-bold text-[1.35rem] tracking-tight ${isDark ? 'text-gray-100' : 'text-amber-950'}`}>
              Shivkrupa
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 ${isDark ? 'text-indigo-400' : 'text-orange-700'}`}>
              Emporium
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Phone - Minimal Text Link */}
          <a
            href="tel:9975636622"
            className={`hidden lg:flex items-center gap-1.5 text-sm font-semibold transition-colors ${isDark ? 'text-gray-400 hover:text-indigo-400' : 'text-amber-900/70 hover:text-orange-700'
              }`}
          >
            <Phone size={14} />
            9975636622
          </a>

          <div className={`h-5 w-px hidden lg:block mx-1 ${isDark ? 'bg-[#2d2450]' : 'bg-orange-300'}`} />

          {/* ═══ Dark Mode Toggle Button ═══ */}
          <button
            onClick={handleToggle}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border active:scale-90 ${isDark
                ? 'bg-indigo-500/20 border-indigo-500/40 text-amber-300 hover:bg-indigo-500/30 hover:border-indigo-400/60 shadow-[0_0_12px_rgba(129,140,248,0.15)]'
                : 'bg-amber-100/80 border-amber-300/50 text-amber-700 hover:bg-amber-200 hover:border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className={animating ? 'theme-toggle-spin' : 'transition-transform duration-300'}>
              {isDark ? (
                <Sun size={18} strokeWidth={2.5} />
              ) : (
                <Moon size={18} strokeWidth={2.5} />
              )}
            </div>
          </button>

          <div className={`h-5 w-px hidden sm:block mx-0.5 ${isDark ? 'bg-[#2d2450]' : 'bg-orange-300'}`} />

          {/* User Section / Login */}
          {!currentUser ? (
            <button
              onClick={() => router.push('/login')}
              className={`px-3.5 py-1.5 rounded-md text-sm font-semibold border transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:shadow-none flex items-center gap-2 ${isDark
                  ? 'text-gray-200 bg-[#1a1535] border-[#2d2450] hover:bg-[#251e40] hover:border-indigo-500/50'
                  : 'text-orange-900 bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                }`}
            >
              <User size={16} />
              <span className="hidden sm:inline">Login</span>
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-2 py-1">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-amber-900/70'}`}>
                Hi, <strong className={`font-bold ${isDark ? 'text-gray-100' : 'text-amber-950'}`}>{currentUser.name.split(' ')[0]}</strong>
              </span>
            </div>
          )}

          {/* Customer Orders Button */}
          {currentUser?.role === 'customer' && (
            <button
              onClick={() => router.push('/customer/orders')}
              className={`px-3.5 py-1.5 rounded-md text-sm font-semibold border transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:shadow-none flex items-center gap-2 ${isDark
                  ? 'text-gray-200 bg-[#1a1535] border-[#2d2450] hover:bg-[#251e40] hover:border-indigo-500/50'
                  : 'text-orange-900 bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                }`}
            >
              <Package size={16} />
              <span className="hidden md:inline">Orders</span>
            </button>
          )}

          {/* Admin Dashboard Link */}
          {currentUser?.role === 'shopkeeper' && (
            <button
              onClick={() => router.push('/admin')}
              className={`px-3.5 py-1.5 rounded-md text-sm font-semibold border transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:shadow-none flex items-center gap-2 ${isDark
                  ? 'text-gray-200 bg-[#1a1535] border-[#2d2450] hover:bg-[#251e40] hover:border-indigo-500/50'
                  : 'text-orange-900 bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                }`}
            >
              <LayoutDashboard size={16} />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold border border-transparent transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 active:shadow-none ml-1 sm:ml-0 ${isDark
                ? 'text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,80,180,0.3)]'
                : 'text-white bg-orange-600 hover:bg-orange-700 hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)]'
              }`}
          >
            <ShoppingCart size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded flex items-center justify-center text-white text-[10px] font-bold border border-white shadow-sm ${isDark ? 'bg-indigo-900' : 'bg-amber-950'
                }`}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Logout - Ghost Icon Button */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-md transition-colors ml-1 ${isDark
                  ? 'text-gray-500 hover:text-red-400 hover:bg-white/5'
                  : 'text-amber-900/50 hover:text-red-600 hover:bg-white/60'
                }`}
              title="Sign Out"
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}