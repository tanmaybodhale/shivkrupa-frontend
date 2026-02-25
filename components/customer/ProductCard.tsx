'use client';

import { Product } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { cart, addToCart, showToast } = useApp();
  
  const productId = product._id ? parseInt(product._id.slice(-8), 16) : product.id;
  const cartItem = cart.find(c => (c._id ? parseInt(c._id.slice(-8), 16) : c.id) === productId);
  const inCart = !!cartItem;
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
    if (!isUnlimited && cartItem && cartItem.qty >= maxQty) {
      showToast(`❌ Only ${maxQty} available in stock`);
      return;
    }
    addToCart(product);
    showToast(`✅ ${product.name.split(' ').slice(0, 3).join(' ')} added to cart!`);
  };

  const showNew  = product.isNew;
  const showSale = product.tag === 'sale';
  const tagText  = showNew ? 'NEW' : product.tag ? product.tag.toUpperCase() : null;

  const displayEmoji = product.emoji || '📦';

  return (
    <div className="card overflow-hidden relative flex flex-col">
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

      {tagText && (
        <span
          className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full tag-badge ${showNew ? 'new-tag' : showSale ? 'sale-tag' : ''}`}
          style={!showNew && !showSale ? { background: 'var(--gold)', color: 'var(--dark)' } : {}}
        >
          {tagText}
        </span>
      )}

      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-bold leading-snug" style={{ color: 'var(--dark)' }}>
          {product.name}
        </h4>
        <p className="text-xs mt-1 mb-3" style={{ color: 'var(--muted)' }}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="font-display font-bold text-xl" style={{ color: 'var(--dark)' }}>
              <span className="text-sm">₹</span>{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${inCart ? '' : 'btn-gold'}`}
            style={inCart
              ? { background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: '#fff' }
              : isOutOfStock
                ? { background: '#dc2626', color: '#fff', cursor: 'not-allowed' }
                : {}}
            disabled={isOutOfStock}
          >
            {!product.inStock ? 'Out of Stock' : inCart ? '✓ Added' : '+ Cart'}
          </button>
        </div>
        
        {isLowStock && (
          <p className="text-xs mt-2 font-semibold" style={{ color: '#dc2626' }}>
            Only {product.quantity} left!
          </p>
        )}
      </div>
    </div>
  );
}
