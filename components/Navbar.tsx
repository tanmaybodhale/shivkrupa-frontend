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
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-orange-100 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-20 flex items-center justify-between py-2">
        
        {/* Brand Section */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => router.push('/customer')}
        >
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 via-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <span className="text-3xl text-white drop-shadow-sm">✿</span>
          </div>
          <div className="hidden sm:block">
            <h2 className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 leading-none pb-0.5">
              Shivkrupa
            </h2>
            <span className="block text-[10px] uppercase tracking-[0.2em] font-black text-orange-400 mt-0.5">
              Emporium
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Phone - Subtle Pill */}
          <a 
            href="tel:9975636622"
            className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-100"
          >
            <Phone size={16} />
            9975636622
          </a>

          <div className="h-6 w-[1px] bg-gray-200 hidden lg:block mx-1" />

          {/* User Section / Login */}
          {!currentUser ? (
            <button
              onClick={() => router.push('/login')}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-100 flex items-center gap-2"
            >
              <User size={18} />
              <span className="hidden sm:inline">Login</span>
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center text-white font-black text-xs shadow-inner">
                {currentUser.name[0].toUpperCase()}
              </div>
              <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">
                {currentUser.name.split(' ')[0]}
              </span>
            </div>
          )}

          {/* Customer Orders Button (NEW) */}
          {currentUser?.role === 'customer' && (
            <button
              onClick={() => router.push('/customer/orders')}
              className="px-3 py-2.5 rounded-2xl text-sm font-bold text-gray-700 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-100 flex items-center gap-2 active:scale-95"
            >
              <Package size={20} />
              <span className="hidden md:inline">Orders</span>
            </button>
          )}

          {/* Admin Dashboard Link */}
          {currentUser?.role === 'shopkeeper' && (
            <button
              onClick={() => router.push('/admin')}
              className="px-3 py-2.5 rounded-2xl text-sm font-bold text-gray-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-100 flex items-center gap-2 active:scale-95"
            >
              <LayoutDashboard size={20} />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          )}

          {/* Cart Button - Maximum Blinkit Vibrancy */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white shadow-lg shadow-orange-300/50 transition-all active:scale-95 border border-orange-400/50"
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
            <span className="font-bold text-sm hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* Logout */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-2xl text-gray-400 bg-slate-50 hover:text-red-600 hover:bg-red-50 transition-all border border-gray-100 hover:border-red-100 ml-1 active:scale-95"
              title="Sign Out"
            >
              <LogOut size={20} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}