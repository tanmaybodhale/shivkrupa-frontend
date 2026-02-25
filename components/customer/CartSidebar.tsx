'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from '@/lib/data';
import BillModal from '@/components/shared/BillModal';
import { Order, Product } from '@/lib/types';

export default function CartSidebar() {
  const {
    cart, cartOpen, setCartOpen, changeQty,
    cartSubtotal, deliveryCharge, cartTotal,
    placeOrder, clearCart, showToast, currentUser,
  } = useApp();
  const router = useRouter();
  
  const [billOrder, setBillOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  const getProductId = (product: Product): string => {
    return product._id || String(product.id || '');
  };

  const subtotal   = cartSubtotal();
  const delivery   = deliveryCharge();
  const total      = cartTotal();
  const remaining  = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct        = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const freeDelivery = delivery === 0 && cart.length > 0;

  const handleCheckout = async () => {
    if (cart.length === 0) { showToast('❌ Cart is empty!'); return; }
    
    if (!currentUser) {
      sessionStorage.setItem('pending_checkout', 'true');
      showToast('❌ Please login to place order');
      setCartOpen(false);
      router.push('/login');
      return;
    }
    
    const order = await placeOrder(paymentMethod);
    if (order) {
      setBillOrder(order);
      clearCart();
      setCartOpen(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-[199]"
          style={{ background: 'rgba(0,0,0,.5)' }}
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ background: 'var(--dark)', borderBottom: '1px solid rgba(201,148,26,.2)' }}
        >
          <h3 className="font-display text-xl" style={{ color: 'var(--gold-light)' }}>
            🛒 Your Cart
          </h3>
          <button
            onClick={() => setCartOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-colors"
            style={{ background: 'rgba(255,255,255,.1)' }}
          >
            ✕
          </button>
        </div>

        {/* Delivery mini bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold"
          style={{ background: 'var(--green-light)', borderBottom: '1px solid #c8e6c9', color: 'var(--green)' }}
        >
          <span>🚚</span>
          <span className="flex-1 text-xs">
            {remaining > 0 ? `Add ₹${remaining} more for FREE delivery` : '🎉 FREE Delivery Unlocked!'}
          </span>
          <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(46,125,50,.15)' }}>
            <div
              className="h-full rounded-full delivery-fill"
              style={{ width: `${pct}%`, background: 'linear-gradient(to right, #81c784, #2e7d32)' }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
              <div className="text-5xl mb-3">🛒</div>
              <h4 className="font-bold text-base" style={{ color: 'var(--dark)' }}>Cart is empty</h4>
              <p className="text-sm mt-1">Add some items to get started!</p>
            </div>
          ) : (
            cart.map(item => {
              const catId = item.cat || item.category;
              const cat = CATEGORIES.find(c => c.id === catId);
              const itemId = getProductId(item);
              const hasImage = item.image && item.image.startsWith('http');
              
              return (
                <div
                  key={itemId}
                  className="flex items-center gap-3 p-3 rounded-xl mb-2 border transition-colors"
                  style={{ border: '1px solid #e0e0e0', background: '#f5f5f5' }}
                >
                  {hasImage ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <span className="text-3xl">{item.emoji || '📦'}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold truncate" style={{ color: 'var(--dark)' }}>{item.name}</h5>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{cat?.label || item.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold text-sm" style={{ color: 'var(--dark)' }}>
                      ₹{item.price * item.qty}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => changeQty(itemId, -1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border transition-colors"
                        style={{ background: '#fff', border: '1px solid #e0e0e0' }}
                      >
                        −
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => {
                          const isUnlimited = item.quantity === undefined || item.quantity === null;
                          const maxQty = isUnlimited ? 999 : item.quantity!;
                          if (!isUnlimited && item.qty >= maxQty) {
                            showToast(`❌ Only ${maxQty} available in stock`);
                            return;
                          }
                          changeQty(itemId, 1);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border transition-colors"
                        style={{ background: '#fff', border: '1px solid #e0e0e0' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t-2" style={{ borderColor: '#e0e0e0' }}>
          {/* Payment Method */}
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--muted)' }}>
              Payment Method
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('cod')}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: paymentMethod === 'cod' ? 'var(--gold)' : '#f5f5f5',
                  color: paymentMethod === 'cod' ? 'var(--dark)' : 'var(--muted)',
                  border: paymentMethod === 'cod' ? 'none' : '1px solid #e0e0e0',
                }}
              >
                💵 Cash on Delivery
              </button>
              <button
                onClick={() => setPaymentMethod('online')}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: paymentMethod === 'online' ? 'var(--gold)' : '#f5f5f5',
                  color: paymentMethod === 'online' ? 'var(--dark)' : 'var(--muted)',
                  border: paymentMethod === 'online' ? 'none' : '1px solid #e0e0e0',
                }}
                disabled
                title="Coming soon"
              >
                💳 Online (Soon)
              </button>
            </div>
          </div>

          <div className="mb-4 space-y-1.5">
            <Row label="Subtotal" value={`₹${subtotal}`} />
            <Row
              label="Delivery"
              value={freeDelivery ? 'FREE 🎉' : `₹${DELIVERY_CHARGE}`}
              green={freeDelivery}
            />
            {freeDelivery && (
              <Row label="You Saved" value={`-₹${DELIVERY_CHARGE}`} green />
            )}
            <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: '#e0e0e0' }}>
              <span className="text-base font-bold" style={{ color: 'var(--dark)' }}>Total</span>
              <span className="font-display text-xl font-bold" style={{ color: 'var(--dark)' }}>₹{total}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="btn-gold w-full py-4 text-base"
          >
            {paymentMethod === 'cod' ? 'Order Now (Cash on Delivery) 💵' : 'Pay & Order ✨'}
          </button>
        </div>
      </aside>

      {/* Bill modal after checkout */}
      {billOrder && <BillModal order={billOrder} onClose={() => setBillOrder(null)} />}
    </>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between text-sm" style={{ color: 'var(--muted)' }}>
      <span>{label}</span>
      <span style={green ? { color: 'var(--green)', fontWeight: 700 } : {}}>{value}</span>
    </div>
  );
}
