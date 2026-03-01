'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShoppingCart, LogOut, LayoutDashboard, Phone, Package, User } from 'lucide-react';

export default function Navbar({ showAuthButtons = false }: { showAuthButtons?: boolean }) {
  const { currentUser, logout, cart, setCartOpen } = useApp();
  const router = useRouter();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleLogout = () => {
    logout();
    router.replace('/customer');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-orange-200 via-orange-100 to-yellow-100 border-b border-orange-300 shadow-[0_4px_20px_-10px_rgba(249,115,22,0.3)]">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Section - Dark brown text for high contrast against the colored background */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => router.push('/customer')}
        >
          <span className="text-2xl text-orange-600 group-hover:rotate-12 transition-transform duration-300">
            ✿
          </span>
          <div className="flex flex-col justify-center leading-none">
            <span className="font-display font-bold text-[1.35rem] text-amber-950 tracking-tight">
              Shivkrupa
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-orange-700 mt-0.5">
              Emporium
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Phone - Minimal Text Link */}
          <a 
            href="tel:9975636622"
            className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-amber-900/70 hover:text-orange-700 transition-colors"
          >
            <Phone size={14} />
            9975636622
          </a>

          <div className="h-5 w-px bg-orange-300 hidden lg:block mx-1" />

          {/* User Section / Login */}
          {!currentUser ? (
            <button
              onClick={() => router.push('/login')}
              className="px-3.5 py-1.5 rounded-md text-sm font-semibold text-orange-900 bg-white border border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:shadow-none flex items-center gap-2"
            >
              <User size={16} />
              <span className="hidden sm:inline">Login</span>
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-2 py-1">
              <span className="text-sm font-medium text-amber-900/70">
                Hi, <strong className="text-amber-950 font-bold">{currentUser.name.split(' ')[0]}</strong>
              </span>
            </div>
          )}

          {/* Customer Orders Button (Solid White Render-Style Button) */}
          {currentUser?.role === 'customer' && (
            <button
              onClick={() => router.push('/customer/orders')}
              className="px-3.5 py-1.5 rounded-md text-sm font-semibold text-orange-900 bg-white border border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:shadow-none flex items-center gap-2"
            >
              <Package size={16} />
              <span className="hidden md:inline">Orders</span>
            </button>
          )}

          {/* Admin Dashboard Link (Solid White Render-Style Button) */}
          {currentUser?.role === 'shopkeeper' && (
            <button
              onClick={() => router.push('/admin')}
              className="px-3.5 py-1.5 rounded-md text-sm font-semibold text-orange-900 bg-white border border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:shadow-none flex items-center gap-2"
            >
              <LayoutDashboard size={16} />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          )}

          {/* Cart Button - Primary Render-Style Button (Solid Dark Orange) */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold text-white bg-orange-600 border border-transparent hover:bg-orange-700 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)] active:translate-y-0 active:shadow-none ml-1 sm:ml-0"
          >
            <ShoppingCart size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded flex items-center justify-center bg-amber-950 text-white text-[10px] font-bold border border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Logout - Ghost Icon Button */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-amber-900/50 hover:text-red-600 hover:bg-white/60 transition-colors ml-1"
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