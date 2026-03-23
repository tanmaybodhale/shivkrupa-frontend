'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from '@/lib/data';
import BillModal from '@/components/shared/BillModal';
import LocationPicker from './LocationPicker';
import { Order, Product } from '@/lib/types';
import { X, ShoppingBag, Truck, Banknote, CreditCard, Minus, Plus, MapPin } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  stationery: 'Stationery',
  snacks: 'Snacks',
  gifts: 'Gifts',
  jewellery: 'Jewellery',
  cutlery: 'Cutlery',
  xerox: 'Xerox / Print',
  cosmetics: 'Cosmetics',
  bags: 'Bags & Pouches',
  toys: 'Toys',
  household: 'Household',
};

export default function CartSidebar() {
  const {
    cart, cartOpen, setCartOpen, changeQty,
    cartSubtotal, deliveryCharge, cartTotal,
    placeOrder, clearCart, showToast, currentUser,
  } = useApp();
  const { isDark } = useTheme();
  const { t } = useLang();
  const router = useRouter();

  const [billOrder, setBillOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const defaultAddress = {
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    location: undefined as { lat: number; lng: number } | undefined,
  };
  const [deliveryAddress, setDeliveryAddress] = useState(defaultAddress);

  const getProductId = (product: Product): string => {
    return product._id || String(product.id || '');
  };

  const subtotal = cartSubtotal();
  const delivery = deliveryCharge();
  const total = cartTotal();
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const freeDelivery = delivery === 0 && cart.length > 0;

  const handleCheckout = async () => {
    if (cart.length === 0) { showToast('❌ Cart is empty!'); return; }

    const hasAddress = deliveryAddress.street.trim() && deliveryAddress.area.trim() && 
      deliveryAddress.city.trim() && deliveryAddress.state.trim() && deliveryAddress.pincode.trim();
    if (!hasAddress) {
      showToast('❌ Please add delivery address!');
      setShowAddressForm(true);
      return;
    }

    if (!currentUser) {
      sessionStorage.setItem('pending_checkout', 'true');
      showToast('❌ Please login to place order');
      setCartOpen(false);
      router.push('/login');
      return;
    }

    const order = await placeOrder(paymentMethod, deliveryAddress);
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
        className={`fixed inset-0 z-[199] backdrop-blur-sm transition-opacity duration-300 ${cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          } ${isDark ? 'bg-black/50' : 'bg-slate-900/40'}`}
        onClick={() => setCartOpen(false)}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] flex flex-col shadow-2xl z-[200] transition-transform duration-300 ease-in-out ${cartOpen ? 'translate-x-0' : 'translate-x-full'
          } ${isDark ? 'bg-[#13102a]' : 'bg-slate-50'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'
          }`}>
          <div className="flex items-center gap-2">
            <h3 className={`font-black text-xl tracking-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {t('yourCart')}
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-100 text-orange-700'
              }`}>
              {cart.reduce((acc, item) => acc + item.qty, 0)} {t('items')}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border active:scale-95 ${isDark
              ? 'text-gray-500 bg-[#13102a] border-[#2d2450] hover:bg-indigo-500/10 hover:text-indigo-400'
              : 'text-gray-400 bg-gray-50 border-gray-100 hover:bg-orange-50 hover:text-orange-600'
              }`}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Delivery mini bar */}
        <div className={`px-5 py-3 shrink-0 border-b ${isDark ? 'bg-emerald-900/10 border-emerald-900/20' : 'bg-green-50/80 border-green-100/50'
          }`}>
          <div className={`flex items-center gap-3 mb-2 text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-green-800'}`}>
            <Truck size={18} className={freeDelivery ? 'animate-bounce' : ''} />
            <span className="flex-1 text-xs">
              {remaining > 0 ? t('addFreeDelivery').replace('₹{amount}', `₹${remaining}`) : t('unlockedFreeDelivery')}
            </span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-900/30' : 'bg-green-200/50'}`}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${pct}%`,
                background: freeDelivery ? 'linear-gradient(to right, #22c55e, #16a34a)' : (isDark ? 'linear-gradient(to right, #6366f1, #a78bfa)' : '#f59e0b')
              }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-indigo-500/10' : 'bg-orange-50'}`}>
                <ShoppingBag size={48} className={isDark ? 'text-indigo-400/50' : 'text-orange-300'} strokeWidth={1.5} />
              </div>
              <h4 className={`font-black text-xl mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{t('emptyCart')}</h4>
              <p className={`text-sm font-medium mb-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Looks like you haven't added anything yet. Let's find something delicious!
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className={`px-8 py-3 rounded-2xl font-bold transition-colors ${isDark ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' : 'text-orange-600 bg-orange-100 hover:bg-orange-200'
                  }`}
              >
                {t('startShopping')}
              </button>
            </div>
          ) : (
            cart.map(item => {
              const catId = item.cat || item.category;
              const catLabel = CATEGORY_LABELS[(catId || '').toLowerCase()] || item.category;
              const itemId = getProductId(item);
              const hasImage = item.image && item.image.startsWith('http');

              return (
                <div
                  key={itemId}
                  className={`flex p-3 rounded-2xl border shadow-sm ${isDark
                    ? 'bg-[#1a1535] border-[#2d2450] shadow-black/10'
                    : 'bg-white border-orange-100 shadow-orange-900/5'
                    }`}
                >
                  {/* Item Image */}
                  <div className={`w-16 h-16 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 mr-3 ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-slate-50 border-gray-100'
                    }`}>
                    {hasImage ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{item.emoji || '📦'}</span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col flex-1 justify-between min-w-0">
                    <div>
                      <h5 className={`text-sm font-bold leading-tight truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {item.name}
                      </h5>
                      <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        {catLabel}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className={`font-black text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        ₹{item.price * item.qty}
                      </div>

                      {/* Quantity pill */}
                      <div className={`flex items-center border rounded-lg p-0.5 shadow-sm ${isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-orange-50 border-orange-200'
                        }`}>
                        <button
                          onClick={() => changeQty(itemId, -1)}
                          className={`w-7 h-7 rounded-md flex items-center justify-center active:scale-95 transition-all ${isDark ? 'text-indigo-400 hover:bg-indigo-500/20' : 'text-orange-600 hover:bg-orange-200/50'
                            }`}
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className={`w-6 text-center text-xs font-bold select-none ${isDark ? 'text-indigo-300' : 'text-orange-700'
                          }`}>
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
                          className={`w-7 h-7 rounded-md flex items-center justify-center active:scale-95 transition-all ${isDark ? 'text-indigo-400 hover:bg-indigo-500/20' : 'text-orange-600 hover:bg-orange-200/50'
                            }`}
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
          <div className={`rounded-t-3xl border-t shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] shrink-0 z-10 flex flex-col ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'
            }`} style={{ maxHeight: '60vh' }}>

            {/* Scrollable checkout content */}
            <div className="overflow-y-auto p-5 pb-0 flex-1">

              {/* Payment Method Selector */}
              <div className="mb-5">
                <p className={`text-[10px] uppercase tracking-[0.15em] font-black mb-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('paymentMethod')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${paymentMethod === 'cod'
                      ? (isDark ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm' : 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm')
                      : (isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-500 hover:bg-[#1a1535]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                      }`}
                  >
                    <Banknote size={16} />
                    {t('cashOnDelivery')}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border opacity-70 cursor-not-allowed ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    disabled
                    title="Coming soon"
                  >
                    <CreditCard size={16} />
                    {t('online')} (Soon)
                  </button>
                </div>
              </div>

              {/* Bill Details */}
              <div className={`p-4 rounded-2xl mb-4 border space-y-2 ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-slate-50 border-gray-100'
                }`}>
                <Row label={t('subtotal')} value={`₹${subtotal}`} isDark={isDark} />
                <Row
                  label={t('deliveryFee')}
                  value={freeDelivery ? t('free') : `₹${DELIVERY_CHARGE}`}
                  green={freeDelivery}
                  isDark={isDark}
                />
                {freeDelivery && (
                  <Row label="Delivery Discount" value={`-₹${DELIVERY_CHARGE}`} green isDark={isDark} />
                )}
                <div className={`flex justify-between items-center pt-3 mt-1 border-t ${isDark ? 'border-[#2d2450]' : 'border-gray-200/60'}`}>
                  <span className={`text-sm font-black ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('grandTotal')}</span>
                  <span className={`text-xl font-black ${isDark ? 'text-indigo-400' : 'text-orange-600'}`}>₹{total}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <p className={`text-[10px] uppercase tracking-[0.15em] font-black mb-2 flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <MapPin size={14} />
                    {t('deliveryAddress')}
                  </p>
                  <span className={`text-xs font-bold ${isDark ? 'text-indigo-400' : 'text-orange-500'}`}>
                    {showAddressForm ? '− Hide' : '+ Add'}
                  </span>
                </button>

                {showAddressForm && (
                  <div className={`space-y-3 p-3 rounded-xl border ${isDark ? 'bg-emerald-900/10 border-emerald-900/20' : 'bg-emerald-50 border-emerald-100'
                    }`}>
                    {['street', 'area'].map(field => (
                      <input
                        key={field}
                        type="text"
                        placeholder={field === 'street' ? 'Street Address' : 'Area / Landmark'}
                        value={(deliveryAddress as any)[field]}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, [field]: e.target.value })}
                        className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none ${isDark
                          ? 'bg-[#13102a] border-[#2d2450] text-gray-200 placeholder-gray-600 focus:border-indigo-500'
                          : 'bg-white border-emerald-200 focus:border-emerald-400'
                          }`}
                      />
                    ))}
                    <div className="grid grid-cols-2 gap-2">
                      {['city', 'state'].map(field => (
                        <input
                          key={field}
                          type="text"
                          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                          value={(deliveryAddress as any)[field]}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, [field]: e.target.value })}
                          className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none ${isDark
                            ? 'bg-[#13102a] border-[#2d2450] text-gray-200 placeholder-gray-600 focus:border-indigo-500'
                            : 'bg-white border-emerald-200 focus:border-emerald-400'
                            }`}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={deliveryAddress.pincode}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none ${isDark
                        ? 'bg-[#13102a] border-[#2d2450] text-gray-200 placeholder-gray-600 focus:border-indigo-500'
                        : 'bg-white border-emerald-200 focus:border-emerald-400'
                        }`}
                    />

                    <div>
                      <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        📍 Pick Location
                      </p>
                      <LocationPicker
                        location={deliveryAddress.location || null}
                        onLocationChange={(loc) => setDeliveryAddress({ ...deliveryAddress, location: loc || undefined })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Button - always visible at bottom */}
            <div className="p-5 pt-3 shrink-0">
              <button
                onClick={handleCheckout}
                className={`w-full py-4 rounded-2xl font-black text-white text-lg shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${isDark
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-900/50'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-orange-300/50'
                  }`}
              >
                {t('swipeToOrder')}
                <div className="bg-white/20 p-1 rounded-lg ml-1">
                  <Truck size={18} />
                </div>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Bill modal after checkout */}
      {billOrder && <BillModal order={billOrder} onClose={() => setBillOrder(null)} />}
    </>
  );
}

function Row({ label, value, green, isDark }: { label: string; value: string; green?: boolean; isDark?: boolean }) {
  return (
    <div className="flex justify-between text-xs font-bold">
      <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{label}</span>
      <span className={green ? 'text-green-600' : (isDark ? 'text-gray-300' : 'text-gray-800')}>{value}</span>
    </div>
  );
}
