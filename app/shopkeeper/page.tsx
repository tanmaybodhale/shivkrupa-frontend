'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import StatsGrid from '@/components/shopkeeper/StatsGrid';
import OrdersTable from '@/components/shopkeeper/OrdersTable';
import Toast from '@/components/shared/Toast';

export default function ShopkeeperPage() {
  const { currentUser, refreshOrders } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) router.replace('/');
    else if (currentUser.role === 'customer') router.replace('/customer');
    else refreshOrders();
  }, [currentUser, router, refreshOrders]);

  if (!currentUser || currentUser.role !== 'shopkeeper') return null;

  return (
    <>
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mt-8 mb-6 gap-4 flex-wrap">
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--dark)' }}>
            🏪 Shop Dashboard —{' '}
            <span style={{ color: 'var(--gold)' }}>Shivkrupa</span>
          </h2>
          <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            📞 9975636622 &nbsp;|&nbsp; Shopkeeper View
          </span>
        </div>

        <StatsGrid />
        <OrdersTable />
      </div>
      <Toast />
    </>
  );
}
