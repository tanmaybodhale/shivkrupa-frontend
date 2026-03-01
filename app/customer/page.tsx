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
    <main className="min-h-screen bg-[#fffbf5]">
      
      {/* Navbar handles its own sticky positioning and borders now */}
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 pb-24 space-y-8 pt-2">
        
        {/* Hero Section - Removed the outer container causing the white space */}
        <section>
          <HeroBanner />
        </section>

        {/* Quick Actions & Delivery Status - Removed redundant wrapper */}
        <section>
          <DeliveryBar />
        </section>

        {/* Discovery Section: Categories & Filters */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-amber-950 tracking-tight">
              Explore <span className="text-orange-500">Categories</span>
            </h2>
          </div>
          
          <CategoryRow />
          
          <div className="pt-2">
            <FiltersRow />
          </div>
        </section>

        {/* Main Product Display */}
        <section className="pt-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-amber-950 tracking-tight">
              Fresh for you
            </h3>
            {/* Crisp, modern divider line */}
            <div className="h-px flex-grow mx-4 bg-orange-200/50" />
          </div>
          
          <ProductGrid />
        </section>
      </div>

      {/* Overlays & Modals */}
      <CartSidebar />
      <BillModal />
      <Toast />

      {/* Sharp Accent Line at bottom (Matches the top of the HeroBanner) */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-yellow-400 z-50" />
    </main>
  );
}