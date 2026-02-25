'use client';

import { Product } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { Plus, Minus } from 'lucide-react';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { cart, addToCart, changeQty, showToast } = useApp();
  
  // Used for finding the item in the cart (keeps your original logic)
  const numericId = product._id ? parseInt(product._id.slice(-8), 16) : product.id;
  const cartItem = cart.find(c => (c._id ? parseInt(c._id.slice(-8), 16) : c.id) === numericId);
  const inCart = !!cartItem;
  
  // Used for modifying the cart (fixes the TypeScript string error)
  const cartItemId = product._id || String(product.id || '');
  
  const category = product.cat || product.category;
  const hasImage = product.image && product.image.startsWith('http');
  const isUnlimited = product.quantity === undefined || product.quantity === null;
  const isLowStock = !isUnlimited && product.quantity <= 3 && product.quantity > 0;
  const isOutOfStock = !product.inStock || (!isUnlimited && product.quantity <= 0);
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
    changeQty(cartItemId, 1); // Now safely passing a string
  };

  const handleDecrease = () => {
    changeQty(cartItemId, -1); // Now safely passing a string
  };

  const showNew  = product.isNew;
  const showSale = product.tag === 'sale';
  const tagText  = showNew ? 'NEW' : product.tag ? product.tag.toUpperCase() : null;
  const displayEmoji = product.emoji || '📦';
  
  // Calculate discount percentage
  const discountPct = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-orange-100/60 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300 overflow-hidden h-full relative">
      
      {/* Corner Badges */}
      {discountPct > 0 && (
        <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-black tracking-wide px-2 py-1 rounded-br-xl z-10 shadow-sm">
          {discountPct}% OFF
        </div>
      )}
      
      {tagText && (
        <div className={`absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md z-10 shadow-sm ${
          showNew ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
        }`}>
          {tagText}
        </div>
      )}

      {/* --- EXACT Image Section You Requested --- */}
      <div
        className="w-full flex items-center justify-center text-6xl"
        style={{ height: 180, background: 'linear-gradient(135deg, #fdf6e3, #fff8e7)' }}
      >
        {hasImage ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          displayEmoji
        )}
      </div>
      {/* ----------------------------------------- */}

      {/* Content Section */}
      <div className="p-3 pt-2 flex flex-col flex-1">
        <h4 className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2">
          {product.name}
        </h4>
        <p className="text-[11px] font-medium text-gray-500 mt-1 capitalize">
          {category}
        </p>

        {/* Bottom Row: Price & Action */}
        <div className="mt-auto pt-3 flex items-end justify-between gap-1">
          
          {/* Price Block */}
          <div className="flex flex-col">
            {discountPct > 0 && (
              <span className="text-[10px] text-gray-400 line-through font-medium leading-none mb-0.5">
                ₹{product.mrp}
              </span>
            )}
            <span className="text-[15px] font-black text-gray-900 leading-none">
              ₹{product.price}
            </span>
          </div>

          {/* Action Button */}
          <div className="shrink-0 h-[32px] w-[72px]">
            {isOutOfStock ? (
              <button 
                disabled 
                className="w-full h-full rounded-lg text-[11px] font-bold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              >
                Out
              </button>
            ) : inCart && cartItem ? (
              <div className="w-full h-full flex items-center justify-between bg-orange-500 text-white rounded-lg shadow-sm shadow-orange-200 overflow-hidden">
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
                className="w-full h-full rounded-lg text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-400 transition-colors shadow-sm active:scale-95 uppercase tracking-wide"
              >
                Add
              </button>
            )}
          </div>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && (
          <p className="text-[10px] font-bold text-red-500 mt-1.5 leading-none">
            Only {product.quantity} left!
          </p>
        )}
      </div>
    </div>
  );
}