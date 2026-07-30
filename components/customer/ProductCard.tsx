'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { Plus, Minus, EyeOff, Share2, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { cart, addToCart, changeQty, showToast, currentUser, toggleWishlist, isInWishlist } = useApp();
  const { isDark } = useTheme();
  const { t } = useLang();
  const router = useRouter();
  const [hidden, setHidden] = useState(!!product.hidden);
  const [loadingHide, setLoadingHide] = useState(false);

  const isAdmin = currentUser?.role === 'shopkeeper';
  const productId = product._id || String(product.id || '');
  const wished = isInWishlist(productId);

  // Cart helpers
  const numericId = product._id ? parseInt(product._id.slice(-8), 16) : product.id;
  const cartItem = cart.find(c => (c._id ? parseInt(c._id.slice(-8), 16) : c.id) === numericId);
  const inCart = !!cartItem;
  const cartItemId = product._id || String(product.id || '');

  const category = product.cat || product.category;
  const hasImage = product.image && product.image.startsWith('http');
  const isUnlimited = product.quantity === undefined || product.quantity === null;
  const isLowStock = !isUnlimited && (product.quantity!) <= 3 && (product.quantity!) > 0;
  const isOutOfStock = !product.inStock || (!isUnlimited && (product.quantity!) <= 0);
  const maxQty = isUnlimited ? 999 : product.quantity!;

  const productUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/product/${productId}`;

  const handleAdd = () => {
    if (isOutOfStock) { showToast('❌ This item is out of stock'); return; }
    addToCart(product);
    showToast(`✅ ${product.name.split(' ').slice(0, 3).join(' ')} added!`);
  };

  const handleIncrease = () => {
    if (!isUnlimited && cartItem && cartItem.qty >= maxQty) { showToast(`❌ Only ${maxQty} available`); return; }
    changeQty(cartItemId, 1);
  };
  const handleDecrease = () => changeQty(cartItemId, -1);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = { title: product.name, text: `Check out ${product.name} for ₹${product.price} at Shivkrupa!`, url: productUrl };
    if (navigator.share) {
      try { await navigator.share(shareData); }
      catch { copyLink(); }
    } else { copyLink(); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl)
      .then(() => showToast('🔗 Link copied!'))
      .catch(() => showToast('🔗 ' + productUrl));
  };

  // Admin-only: persist hide to backend
  const handleToggleHide = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    const newHidden = !hidden;
    setLoadingHide(true);
    try {
      const res = await fetch(`${API_URL}/catalog/${productId}/hidden`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: newHidden }),
      });
      const data = await res.json();
      if (data.success) {
        setHidden(newHidden);
        showToast(newHidden ? `🙈 "${product.name.split(' ')[0]}" hidden from customers` : `👁️ "${product.name.split(' ')[0]}" visible again`);
      } else {
        showToast('❌ Failed to update visibility');
      }
    } catch {
      showToast('❌ Network error');
    } finally {
      setLoadingHide(false);
    }
  };

  const openDetail = () => router.push(`/product/${productId}`);

  const showNew = product.isNew;
  const tagText = showNew ? 'NEW' : product.tag ? product.tag.toUpperCase() : null;
  const displayEmoji = product.emoji || '📦';
  const discountPct = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className={`group flex flex-col rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full relative ${
      isDark
        ? `bg-[#1a1535] border-[#2d2450] hover:border-indigo-500/50 ${hidden ? 'opacity-50' : ''}`
        : `bg-white border-orange-100/60 hover:border-orange-300 ${hidden ? 'opacity-50' : ''}`
    }`}>

      {/* Discount badge */}
      {discountPct > 0 && (
        <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-black tracking-wide px-2 py-1 rounded-br-xl z-10 shadow-sm">
          {discountPct}% OFF
        </div>
      )}

      {/* Tag badge */}
      {tagText && (
        <div className={`absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md z-10 shadow-sm ${
          showNew ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
        }`}>
          {tagText}
        </div>
      )}

      {/* Admin-only hidden badge overlay */}
      {isAdmin && hidden && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${isDark ? 'bg-red-900/60 text-red-300 border border-red-700/40' : 'bg-red-100 text-red-600 border border-red-200'}`}>
            Hidden from customers
          </span>
        </div>
      )}

      {/* Admin hide button — top-left, only for shopkeeper */}
      {isAdmin && (
        <div className="absolute top-1.5 z-30 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-all duration-200"
          style={{ left: discountPct > 0 ? '52px' : '6px' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleToggleHide}
            disabled={loadingHide}
            title={hidden ? 'Make visible to customers' : 'Hide from customers'}
            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 disabled:opacity-50 ${
              hidden
                ? isDark
                  ? 'bg-red-500/30 border border-red-500/60 text-red-400'
                  : 'bg-red-100 border border-red-300 text-red-500'
                : isDark
                  ? 'bg-[#13102a]/90 border border-[#2d2450] text-gray-500 hover:text-red-400 hover:border-red-500/40'
                  : 'bg-white/90 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300'
            }`}
          >
            <EyeOff size={11} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Image — clicking goes to product page */}
      <div
        className="w-full flex items-center justify-center text-6xl cursor-pointer"
        style={{
          height: 'clamp(120px, 35vw, 180px)',
          background: isDark
            ? 'linear-gradient(135deg, #13102a, #1a1535)'
            : 'linear-gradient(135deg, #fdf6e3, #fff8e7)'
        }}
        onClick={openDetail}
      >
        {hasImage ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : displayEmoji}
      </div>

      {/* Content */}
      <div className="p-3 pt-2 flex flex-col flex-1">
        <h4
          className={`text-[13px] font-bold leading-snug line-clamp-2 cursor-pointer hover:underline decoration-dotted underline-offset-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
          onClick={openDetail}
        >
          {product.name}
        </h4>
        <p className={`text-[11px] font-medium mt-1 capitalize ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {category}{product.weight ? ` · ${product.weight}` : ''}
        </p>
        {product.description && (
          <p className={`text-[10px] mt-1 leading-snug line-clamp-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            {product.description}
          </p>
        )}

        {/* Bottom Row: Price & Actions */}
        <div className="mt-auto pt-2 flex items-end justify-between gap-1 min-w-0">

          {/* Price — flex-1 lets it take available space without overflowing */}
          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
            {discountPct > 0 && (
              <span className={`text-[9px] line-through font-medium leading-none mb-0.5 truncate ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                ₹{product.mrp}
              </span>
            )}
            <span className={`text-[12px] font-black leading-none truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              ₹{product.price}
            </span>
          </div>

          {/* Add/Qty + Share + Wishlist row — always stays right, never wraps */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* ❤ Wishlist button */}
            <button
              onClick={async (e) => { e.stopPropagation(); await toggleWishlist(productId); showToast(wished ? '💔 Removed from wishlist' : '❤️ Added to wishlist!'); }}
              title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all active:scale-90 flex-shrink-0 ${
                wished
                  ? 'bg-red-500/15 border-red-500/40 text-red-500'
                  : isDark
                    ? 'bg-[#1a1535] border-[#2d2450] text-gray-600 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10'
                    : 'bg-orange-50 border-orange-200 text-gray-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
              }`}
            >
              <Heart size={11} strokeWidth={2.5} fill={wished ? 'currentColor' : 'none'} />
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              title="Share product"
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all active:scale-90 flex-shrink-0 ${
                isDark
                  ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20'
                  : 'bg-orange-50 border-orange-200 text-orange-500 hover:bg-orange-100'
              }`}
            >
              <Share2 size={11} strokeWidth={2.5} />
            </button>

            {/* Add / Qty */}
            <div className="h-[30px] w-[58px] flex-shrink-0">
              {isOutOfStock ? (
                <button
                  disabled
                  className={`w-full h-full rounded-lg text-[9px] font-bold cursor-not-allowed border ${isDark
                    ? 'bg-[#13102a] text-gray-600 border-[#2d2450]'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}
                >
                  {t('outOfStock')}
                </button>
              ) : inCart && cartItem ? (
                <div
                  className={`w-full h-full flex items-center justify-between text-white rounded-lg shadow-sm overflow-hidden ${
                    isDark ? 'bg-indigo-600 shadow-indigo-900/20' : 'bg-orange-500 shadow-orange-200'
                  }`}
                  onClick={e => e.stopPropagation()}
                >
                  <button onClick={handleDecrease} className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:scale-95">
                    <Minus size={12} strokeWidth={3} />
                  </button>
                  <span className="flex-1 text-center text-[11px] font-black select-none">{cartItem.qty}</span>
                  <button onClick={handleIncrease} className="flex-1 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:scale-95">
                    <Plus size={12} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); handleAdd(); }}
                  className={`w-full h-full rounded-lg text-[10px] font-black border transition-colors shadow-sm active:scale-95 uppercase tracking-wide ${isDark
                    ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-400/50'
                    : 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-400'
                  }`}
                >
                  {t('add')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Low stock */}
        {isLowStock && (
          <p className="text-[10px] font-bold text-red-500 mt-1.5 leading-none">
            {t('onlyLeft').replace('{count}', String(product.quantity))}
          </p>
        )}
      </div>
    </div>
  );
}