'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/customer/HeroBanner';
import DeliveryBar from '@/components/customer/DeliveryBar';
import CategoryRow from '@/components/customer/CategoryRow';
import FiltersRow from '@/components/customer/FiltersRow';
import ProductGrid from '@/components/customer/ProductGrid';
import CartSidebar from '@/components/customer/CartSidebar';
import BillModal from '@/components/shared/BillModal';
import Toast from '@/components/shared/Toast';

export default function CustomerPage() {
  const { currentUser, setCartOpen } = useApp();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Maintain existing logic: Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Maintain existing logic: Handle checkout redirect and URL cleanup
  useEffect(() => {
    if (mounted && searchParams.get('checkout') === 'true') {
      setCartOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url);
    }
  }, [mounted, searchParams, setCartOpen]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Navbar with a subtle bottom shadow for depth */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <Navbar />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 pb-20 space-y-8">
        {/* Featured Image Section - Enhanced with a themed glow */}
        <section className="relative pt-6">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl -z-10" />
          <div className="absolute top-20 -right-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl -z-10" />
          
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-orange-200/50 border border-orange-100">
            <HeroBanner />
          </div>
        </section>

        {/* Quick Actions & Delivery Status */}
        <section className="bg-white rounded-2xl p-2 shadow-sm border border-orange-50">
          <DeliveryBar />
        </section>

        {/* Discovery Section: Categories & Filters grouped together */}
        <section className="space-y-6 bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Explore <span className="text-orange-500">Categories</span>
              </h2>
            </div>
            <CategoryRow />
          </div>
          
          <div className="pt-4 border-t border-orange-100">
            <FiltersRow />
          </div>
        </section>

        {/* Main Product Display */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Fresh for you</h3>
            <span className="h-1 flex-grow mx-4 bg-gradient-to-r from-orange-200 to-transparent rounded-full" />
          </div>
          <ProductGrid />
        </section>
      </div>

      {/* Overlays & Modals */}
      <CartSidebar />
      <BillModal />
      <Toast />

      {/* Floating Decorative Elements (Optional) */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400" />
    </main>
  );
}