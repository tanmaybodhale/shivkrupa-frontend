'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const { currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) router.replace('/');
    else if (currentUser.role === 'shopkeeper') router.replace('/shopkeeper');
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'customer') return null;

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
