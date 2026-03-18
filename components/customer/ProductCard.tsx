'use client';

import { Product } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { Plus, Minus } from 'lucide-react';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { cart, addToCart, changeQty, showToast } = useApp();
  const { isDark } = useTheme();
  const { t } = useLang();

  // Used for finding the item in the cart (keeps your original logic)
  const numericId = product._id ? parseInt(product._id.slice(-8), 16) : product.id;
  const cartItem = cart.find(c => (c._id ? parseInt(c._id.slice(-8), 16) : c.id) === numericId);
  const inCart = !!cartItem;

  // Used for modifying the cart (fixes the TypeScript string error)
  const cartItemId = product._id || String(product.id || '');

  const category = product.cat || product.category;
  const hasImage = product.image && product.image.startsWith('http');
  const isUnlimited = product.quantity === undefined || product.quantity === null;
  const isLowStock = !isUnlimited && (product.quantity!) <= 3 && (product.quantity!) > 0;
  const isOutOfStock = !product.inStock || (!isUnlimited && (product.quantity!) <= 0);
  const maxQty = isUnlimited ? 999 : product.quantity!;

  const handleAdd = () => {
    if (isOutOfStock) {
      showToast('❌ This item is out of stock');
      return;
    }
    addToCart(product);
    showToast(`✅ ${product.name.split(' ').slice(0, 3).join(' ')} added!`);
  };

  const handleIncrease = () => {
    if (!isUnlimited && cartItem && cartItem.qty >= maxQty) {
      showToast(`❌ Only ${maxQty} available`);
      return;
    }
    changeQty(cartItemId, 1);
  };

  const handleDecrease = () => {
    changeQty(cartItemId, -1);
  };

  const showNew = product.isNew;
  const showSale = product.tag === 'sale';
  const tagText = showNew ? 'NEW' : product.tag ? product.tag.toUpperCase() : null;
  const displayEmoji = product.emoji || '📦';

  // Calculate discount percentage
  const discountPct = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className={`group flex flex-col rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full relative ${isDark
      ? 'bg-[#1a1535] border-[#2d2450] hover:border-indigo-500/50'
      : 'bg-white border-orange-100/60 hover:border-orange-300'
      }`}>

      {/* Corner Badges */}
      {discountPct > 0 && (
        <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-black tracking-wide px-2 py-1 rounded-br-xl z-10 shadow-sm">
          {discountPct}% OFF
        </div>
      )}

      {tagText && (
        <div className={`absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md z-10 shadow-sm ${showNew ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
          }`}>
          {tagText}
        </div>
      )}

      {/* Image Section */}
      <div
        className="w-full flex items-center justify-center text-6xl"
        style={{
          height: 180,
          background: isDark
            ? 'linear-gradient(135deg, #13102a, #1a1535)'
            : 'linear-gradient(135deg, #fdf6e3, #fff8e7)'
        }}
      >
        {hasImage ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          displayEmoji
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 pt-2 flex flex-col flex-1">
        <h4 className={`text-[13px] font-bold leading-snug line-clamp-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
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

        {/* Bottom Row: Price & Action */}
        <div className="mt-auto pt-3 flex items-end justify-between gap-1">

          {/* Price Block */}
          <div className="flex flex-col">
            {discountPct > 0 && (
              <span className={`text-[10px] line-through font-medium leading-none mb-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                ₹{product.mrp}
              </span>
            )}
            <span className={`text-[15px] font-black leading-none ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              ₹{product.price}
            </span>
          </div>

          {/* Action Button */}
          <div className="shrink-0 h-[32px] w-[72px]">
            {isOutOfStock ? (
              <button
                disabled
                className={`w-full h-full rounded-lg text-[11px] font-bold cursor-not-allowed border ${isDark
                  ? 'bg-[#13102a] text-gray-600 border-[#2d2450]'
                  : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}
              >
                {t('outOfStock')}
              </button>
            ) : inCart && cartItem ? (
              <div className={`w-full h-full flex items-center justify-between text-white rounded-lg shadow-sm overflow-hidden ${isDark ? 'bg-indigo-600 shadow-indigo-900/20' : 'bg-orange-500 shadow-orange-200'
                }`}>
                <button
                  onClick={handleDecrease}
                  className="w-7 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:scale-95"
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span className="flex-1 text-center text-xs font-black select-none">
                  {cartItem.qty}
                </span>
                <button
                  onClick={handleIncrease}
                  className="w-7 h-full flex items-center justify-center hover:bg-black/10 transition-colors active:scale-95"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`w-full h-full rounded-lg text-xs font-black border transition-colors shadow-sm active:scale-95 uppercase tracking-wide ${isDark
                  ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-400/50'
                  : 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-400'
                  }`}
              >
                {t('add')}
              </button>
            )}
          </div>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && (
          <p className="text-[10px] font-bold text-red-500 mt-1.5 leading-none">
            {t('onlyLeft').replace('{count}', String(product.quantity))}
          </p>
        )}
      </div>
    </div>
  );
}