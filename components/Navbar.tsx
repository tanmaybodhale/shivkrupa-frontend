'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { LANGUAGES } from '@/lib/translations';
import ProfileModal from '@/components/customer/ProfileModal';
import { User as AppUser } from '@/lib/types';
import {
  ShoppingCart, LogOut, LayoutDashboard, Phone, Package,
  User, Sun, Moon, Globe, Menu, X, ChevronRight,
} from 'lucide-react';

export default function Navbar({ showAuthButtons = false }: { showAuthButtons?: boolean }) {
  const { currentUser, logout, cart, setCartOpen, updateProfile, showToast } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const [animating, setAnimating] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close hamburger on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close on route change
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const handleToggle = () => {
    setAnimating(true);
    toggleTheme();
    setTimeout(() => setAnimating(false), 500);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.replace('/customer');
  };

  const handleProfileSave = async (name: string, address: AppUser['address']) => {
    const err = await updateProfile(name, address);
    if (err) { showToast(`❌ ${err}`); return; }
    showToast('✅ Profile updated');
    setProfileOpen(false);
  };

  // ── Shared button style ──
  const btnBase = `px-3.5 py-1.5 rounded-md text-sm font-semibold border transition-all duration-200
    hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:shadow-none flex items-center gap-2`;
  const btnStyle = isDark
    ? `${btnBase} text-gray-200 bg-[#1a1535] border-[#2d2450] hover:bg-[#251e40] hover:border-indigo-500/50`
    : `${btnBase} text-orange-900 bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-300`;

  const iconBtnStyle = `relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border active:scale-90 ${isDark
    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-400/60'
    : 'bg-amber-100/80 border-amber-300/50 text-amber-700 hover:bg-amber-200 hover:border-amber-400/60'}`;

  const divider = <div className={`h-px my-1 ${isDark ? 'bg-[#2d2450]' : 'bg-orange-100'}`} />;

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full border-b shadow-[0_4px_20px_-10px_rgba(249,115,22,0.3)] transition-colors duration-300 ${isDark
        ? 'bg-gradient-to-r from-[#13102a] via-[#1a1535] to-[#13102a] border-[#2d2450] shadow-[0_4px_20px_-10px_rgba(99,80,180,0.3)]'
        : 'bg-gradient-to-r from-orange-200 via-orange-100 to-yellow-100 border-orange-300'
        }`}>
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* ─── Brand ─── */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => router.push('/customer')}
          >
            <span className={`text-2xl group-hover:rotate-12 transition-transform duration-300 ${isDark ? 'text-indigo-400' : 'text-orange-600'}`}>✿</span>
            <div className="flex flex-col justify-center leading-none">
              <span className={`font-display font-bold text-[1.35rem] tracking-tight ${isDark ? 'text-gray-100' : 'text-amber-950'}`}>Shivkrupa</span>
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 ${isDark ? 'text-indigo-400' : 'text-orange-700'}`}>Emporium</span>
            </div>
          </div>

          {/* ─── Right Actions ─── */}
          <div className="flex items-center gap-2">

            {/* ══════════════════════════════════════════
                DESKTOP-ONLY extras (hidden on mobile)
            ══════════════════════════════════════════ */}

            {/* Phone — desktop, logged in */}
            {currentUser && (
              <>
                <a
                  href="tel:9975636622"
                  className={`hidden lg:flex items-center gap-1.5 text-sm font-semibold transition-colors ${isDark ? 'text-gray-400 hover:text-indigo-400' : 'text-amber-900/70 hover:text-orange-700'}`}
                >
                  <Phone size={14} />
                  9975636622
                </a>
                <div className={`h-5 w-px hidden lg:block mx-1 ${isDark ? 'bg-[#2d2450]' : 'bg-orange-300'}`} />
              </>
            )}

            {/* Language — desktop only */}
            <div className="relative hidden md:block">
              <button onClick={() => setLangOpen(!langOpen)} className={iconBtnStyle} title="Change Language">
                <Globe size={16} strokeWidth={2.5} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className={`absolute right-0 top-full mt-2 z-50 rounded-xl border shadow-xl overflow-hidden min-w-[140px] ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-bold flex items-center justify-between gap-3 transition-colors ${lang === l.code
                          ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-50 text-orange-600')
                          : (isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-orange-50')}`}
                      >
                        <span>{l.nativeLabel}</span>
                        {lang === l.code && <span className="text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme toggle — desktop only */}
            <button
              onClick={handleToggle}
              className={`hidden md:flex relative w-9 h-9 rounded-full items-center justify-center transition-all duration-300 border active:scale-90 ${isDark
                ? 'bg-indigo-500/20 border-indigo-500/40 text-amber-300 hover:bg-indigo-500/30 hover:border-indigo-400/60 shadow-[0_0_12px_rgba(129,140,248,0.15)]'
                : 'bg-amber-100/80 border-amber-300/50 text-amber-700 hover:bg-amber-200 hover:border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]'}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className={animating ? 'theme-toggle-spin' : 'transition-transform duration-300'}>
                {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
              </div>
            </button>

            <div className={`h-5 w-px hidden md:block mx-0.5 ${isDark ? 'bg-[#2d2450]' : 'bg-orange-300'}`} />

            {/* User greeting — desktop */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 px-2 py-1">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-amber-900/70'}`}>
                  {t('hi')}, <strong className={`font-bold ${isDark ? 'text-gray-100' : 'text-amber-950'}`}>{currentUser.name.split(' ')[0]}</strong>
                </span>
              </div>
            )}

            {/* Orders & Profile — desktop, customer */}
            {currentUser?.role === 'customer' && (
              <>
                <button onClick={() => router.push('/customer/orders')} className={`${btnStyle} hidden md:flex`}>
                  <Package size={16} />
                  <span>{t('orders')}</span>
                </button>
                <button onClick={() => setProfileOpen(true)} className={`${btnStyle} hidden md:flex`}>
                  <User size={16} />
                  <span>{t('profile')}</span>
                </button>
              </>
            )}

            {/* Dashboard — desktop, shopkeeper */}
            {currentUser?.role === 'shopkeeper' && (
              <button onClick={() => router.push('/admin')} className={`${btnStyle} hidden md:flex`}>
                <LayoutDashboard size={16} />
                <span>{t('dashboard')}</span>
              </button>
            )}

            {/* Login — desktop (hidden if logged in) */}
            {!currentUser && (
              <button
                onClick={() => router.push('/login')}
                className={`${btnStyle} hidden md:flex`}
              >
                <User size={16} />
                {t('login')}
              </button>
            )}

            {/* ══════════════════════════════════════════
                ALWAYS VISIBLE: Cart + Login (if logged out)
            ══════════════════════════════════════════ */}

            {/* Login — mobile, logged out */}
            {!currentUser && (
              <button
                onClick={() => router.push('/login')}
                className={`${btnStyle} md:hidden`}
              >
                <User size={16} />
                <span>{t('login')}</span>
              </button>
            )}

            {/* Cart — always visible */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold border border-transparent transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 active:shadow-none ${isDark
                ? 'text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,80,180,0.3)]'
                : 'text-white bg-orange-600 hover:bg-orange-700 hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)]'}`}
            >
              <ShoppingCart size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">{t('cart')}</span>
              {cartCount > 0 && (
                <span className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded flex items-center justify-center text-white text-[10px] font-bold border border-white shadow-sm ${isDark ? 'bg-indigo-900' : 'bg-amber-950'}`}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Logout — desktop only */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className={`hidden md:flex p-1.5 rounded-md transition-colors ml-1 ${isDark
                  ? 'text-gray-500 hover:text-red-400 hover:bg-white/5'
                  : 'text-amber-900/50 hover:text-red-600 hover:bg-white/60'}`}
                title="Sign Out"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
            )}

            {/* ══════════════════════════════════════════
                HAMBURGER — mobile only (always shown)
            ══════════════════════════════════════════ */}
            <div className="relative md:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className={`p-2 rounded-md transition-all duration-200 border ${isDark
                  ? 'border-[#2d2450] bg-[#1a1535] text-gray-300 hover:bg-[#251e40]'
                  : 'border-orange-200 bg-white text-amber-900 hover:bg-orange-50'}`}
                aria-label="Menu"
              >
                {menuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className={`absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-2xl overflow-hidden w-64 ${isDark
                  ? 'bg-[#1a1535] border-[#2d2450]'
                  : 'bg-white border-orange-100'}`}>

                  {/* User info */}
                  {currentUser && (
                    <>
                      <div className={`px-4 py-3 ${isDark ? 'bg-[#13102a]' : 'bg-orange-50'}`}>
                        <p className={`text-[11px] uppercase tracking-widest font-bold mb-0.5 ${isDark ? 'text-gray-500' : 'text-orange-400'}`}>Signed in as</p>
                        <p className={`text-sm font-black ${isDark ? 'text-gray-100' : 'text-amber-950'}`}>{currentUser.name.split(' ')[0]}</p>
                      </div>
                      {divider}
                    </>
                  )}

                  {/* Theme toggle */}
                  <button
                    onClick={() => { handleToggle(); }}
                    className={`w-full px-4 py-3 flex items-center justify-between text-sm font-semibold transition-colors ${isDark
                      ? 'text-gray-300 hover:bg-white/5'
                      : 'text-gray-700 hover:bg-orange-50'}`}
                  >
                    <span className="flex items-center gap-3">
                      {isDark ? <Sun size={16} /> : <Moon size={16} />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </span>
                    <ChevronRight size={14} className="opacity-40" />
                  </button>

                  {/* Language */}
                  <div>
                    <button
                      onClick={() => setLangOpen(prev => !prev)}
                      className={`w-full px-4 py-3 flex items-center justify-between text-sm font-semibold transition-colors ${isDark
                        ? 'text-gray-300 hover:bg-white/5'
                        : 'text-gray-700 hover:bg-orange-50'}`}
                    >
                      <span className="flex items-center gap-3">
                        <Globe size={16} />
                        Language
                      </span>
                      <ChevronRight size={14} className={`transition-transform duration-200 opacity-40 ${langOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {langOpen && (
                      <div className={`px-2 pb-1 ${isDark ? 'bg-[#13102a]' : 'bg-orange-50/60'}`}>
                        {LANGUAGES.map(l => (
                          <button
                            key={l.code}
                            onClick={() => { setLang(l.code); setLangOpen(false); }}
                            className={`w-full px-3 py-2 text-left text-sm font-bold rounded-lg flex items-center justify-between gap-3 transition-colors ${lang === l.code
                              ? (isDark ? 'text-indigo-400' : 'text-orange-600')
                              : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-orange-700')}`}
                          >
                            {l.nativeLabel}
                            {lang === l.code && <span className="text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {divider}

                  {/* Customer links */}
                  {currentUser?.role === 'customer' && (
                    <>
                      <button
                        onClick={() => navigate('/customer/orders')}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-colors ${isDark
                          ? 'text-gray-300 hover:bg-white/5'
                          : 'text-gray-700 hover:bg-orange-50'}`}
                      >
                        <Package size={16} /> {t('orders')}
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); setProfileOpen(true); }}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-colors ${isDark
                          ? 'text-gray-300 hover:bg-white/5'
                          : 'text-gray-700 hover:bg-orange-50'}`}
                      >
                        <User size={16} /> {t('profile')}
                      </button>
                    </>
                  )}

                  {/* Shopkeeper dashboard */}
                  {currentUser?.role === 'shopkeeper' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-colors ${isDark
                        ? 'text-gray-300 hover:bg-white/5'
                        : 'text-gray-700 hover:bg-orange-50'}`}
                    >
                      <LayoutDashboard size={16} /> {t('dashboard')}
                    </button>
                  )}

                  {/* Phone */}
                  {currentUser && (
                    <a
                      href="tel:9975636622"
                      className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-colors ${isDark
                        ? 'text-gray-300 hover:bg-white/5'
                        : 'text-gray-700 hover:bg-orange-50'}`}
                    >
                      <Phone size={16} /> 9975636622
                    </a>
                  )}

                  {/* Logout */}
                  {currentUser && (
                    <>
                      {divider}
                      <button
                        onClick={handleLogout}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-colors rounded-b-2xl ${isDark
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-red-600 hover:bg-red-50'}`}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  )}

                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      <ProfileModal
        open={profileOpen}
        user={currentUser}
        onClose={() => setProfileOpen(false)}
        onSave={handleProfileSave}
      />
    </>
  );
}
