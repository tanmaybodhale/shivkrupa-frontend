'use client';

import { useEffect, useState, useMemo } from 'react';
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

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <>
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 pb-20">
        <HeroBanner />
        <DeliveryBar />
        <CategoryRow />
        <FiltersRow />
        <ProductGrid />
      </div>
      <CartSidebar />
      <BillModal />
      <Toast />
    </>
  );
}
