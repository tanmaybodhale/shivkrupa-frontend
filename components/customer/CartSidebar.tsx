'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from '@/lib/data';
import BillModal from '@/components/shared/BillModal';
import { Order, Product } from '@/lib/types';
import { X, ShoppingBag, Truck, Banknote, CreditCard, Minus, Plus } from 'lucide-react';

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
      <div
        className={`fixed inset-0 z-[199] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setCartOpen(false)}
      />

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-slate-50 flex flex-col shadow-2xl z-[200] transition-transform duration-300 ease-in-out ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-orange-100 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-xl text-gray-900 tracking-tight">
              My Cart
            </h3>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((acc, item) => acc + item.qty, 0)} Items
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-100 active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Delivery mini bar */}
        <div className="bg-green-50/80 px-5 py-3 shrink-0 border-b border-green-100/50">
          <div className="flex items-center gap-3 mb-2 text-sm font-bold text-green-800">
            <Truck size={18} className={freeDelivery ? 'animate-bounce' : ''} />
            <span className="flex-1 text-xs">
              {remaining > 0 ? `Add ₹${remaining} more for FREE delivery` : '🎉 YAY! FREE Delivery Unlocked!'}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-green-200/50">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${pct}%`, 
                background: freeDelivery ? 'linear-gradient(to right, #22c55e, #16a34a)' : '#f59e0b' 
              }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={48} className="text-orange-300" strokeWidth={1.5} />
              </div>
              <h4 className="font-black text-xl text-gray-900 mb-2">Your cart is empty</h4>
              <p className="text-sm font-medium text-gray-500 mb-8">
                Looks like you haven't added anything yet. Let's find something delicious!
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="px-8 py-3 rounded-2xl font-bold text-orange-600 bg-orange-100 hover:bg-orange-200 transition-colors"
              >
                Start Shopping
              </button>
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
                  className="flex p-3 rounded-2xl bg-white border border-orange-100 shadow-sm shadow-orange-900/5"
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 mr-3">
                    {hasImage ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{item.emoji || '📦'}</span>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex flex-col flex-1 justify-between min-w-0">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 leading-tight truncate">
                        {item.name}
                      </h5>
                      <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                        {cat?.label || item.category}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-black text-sm text-gray-900">
                        ₹{item.price * item.qty}
                      </div>
                      
                      {/* Blinkit-style unified quantity pill */}
                      <div className="flex items-center bg-orange-50 border border-orange-200 rounded-lg p-0.5 shadow-sm">
                        <button
                          onClick={() => changeQty(itemId, -1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-orange-600 hover:bg-orange-200/50 active:scale-95 transition-all"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-orange-700 select-none">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => {
                            const isUnlimited = item.quantity === undefined || item.quantity === null;
                            const maxQty = isUnlimited ? 999 : item.quantity!;
                            if (!isUnlimited && item.qty >= maxQty) {
                              showToast(`❌ Only ${maxQty} available`);
                              return;
                            }
                            changeQty(itemId, 1);
                          }}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-orange-600 hover:bg-orange-200/50 active:scale-95 transition-all"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Bottom Sheet (Checkout) */}
        {cart.length > 0 && (
          <div className="bg-white rounded-t-3xl border-t border-orange-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] p-5 shrink-0 z-10">
            
            {/* Payment Method Selector */}
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-[0.15em] font-black text-gray-400 mb-2.5">
                Payment Method
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    paymentMethod === 'cod' 
                      ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Banknote size={16} />
                  Cash on Delivery
                </button>
                <button
                  onClick={() => setPaymentMethod('online')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-gray-50 border border-gray-200 text-gray-400 opacity-70 cursor-not-allowed"
                  disabled
                  title="Coming soon"
                >
                  <CreditCard size={16} />
                  Online (Soon)
                </button>
              </div>
            </div>

            {/* Bill Details */}
            <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-gray-100 space-y-2">
              <Row label="Item Total" value={`₹${subtotal}`} />
              <Row
                label="Delivery Fee"
                value={freeDelivery ? 'FREE' : `₹${DELIVERY_CHARGE}`}
                green={freeDelivery}
              />
              {freeDelivery && (
                <Row label="Delivery Discount" value={`-₹${DELIVERY_CHARGE}`} green />
              )}
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200/60">
                <span className="text-sm font-black text-gray-900">Grand Total</span>
                <span className="text-xl font-black text-orange-600">₹{total}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-xl shadow-orange-300/50 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              Swipe to Order
              <div className="bg-white/20 p-1 rounded-lg ml-1">
                <Truck size={18} />
              </div>
            </button>
          </div>
        )}
      </aside>

      {/* Bill modal after checkout */}
      {billOrder && <BillModal order={billOrder} onClose={() => setBillOrder(null)} />}
    </>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between text-xs font-bold">
      <span className="text-gray-500">{label}</span>
      <span className={green ? 'text-green-600' : 'text-gray-800'}>{value}</span>
    </div>
  );
}