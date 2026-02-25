'use client';

import { Product } from '@/lib/types';
import { CATEGORIES } from '@/lib/data';
import { useApp } from '@/context/AppContext';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { cart, addToCart, showToast } = useApp();
  const inCart = cart.some(c => c.id === product.id);
  const catLabel = CATEGORIES.find(c => c.id === product.cat);

  const handleAdd = () => {
    addToCart(product);
    showToast(`✅ ${product.name.split(' ').slice(0, 3).join(' ')} added to cart!`);
  };

  // Tag logic
  const showNew  = product.isNew;
  const showSale = product.tag === 'sale';
  const tagText  = showNew ? 'NEW' : product.tag ? product.tag.toUpperCase() : null;

  return (
    <div className="card overflow-hidden relative flex flex-col">
      {/* Image / emoji area */}
      <div
        className="w-full flex items-center justify-center text-6xl"
        style={{ height: 180, background: 'linear-gradient(135deg, #fdf6e3, #fff8e7)' }}
      >
        {product.emoji}
      </div>

      {/* Tag badge */}
      {tagText && (
        <span
          className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full tag-badge ${showNew ? 'new-tag' : showSale ? 'sale-tag' : ''}`}
          style={!showNew && !showSale ? { background: 'var(--gold)', color: 'var(--dark)' } : {}}
        >
          {tagText}
        </span>
      )}

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-bold leading-snug" style={{ color: 'var(--dark)' }}>
          {product.name}
        </h4>
        <p className="text-xs mt-1 mb-3" style={{ color: 'var(--muted)' }}>
          {catLabel?.emoji} {catLabel?.label}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-display font-bold text-xl" style={{ color: 'var(--dark)' }}>
            <span className="text-sm">₹</span>{product.price}
          </span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${inCart ? '' : 'btn-gold'}`}
            style={inCart
              ? { background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: '#fff' }
              : {}}
          >
            {inCart ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
