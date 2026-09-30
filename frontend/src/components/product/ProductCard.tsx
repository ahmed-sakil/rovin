import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  priceBDT: number;
  discountPriceBDT?: number | null;
  stockQuantity: number;
  availableColors?: Array<{ name: string; hex: string }> | null;
  images: string[];
  category: { id: string; name: string; slug: string };
  isSpecial?: boolean;
}

interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const isOutOfStock = product.stockQuantity <= 0;

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div
      onClick={handleCardClick}
      className={`chassis-card flex flex-col justify-between overflow-hidden group cursor-pointer hover:border-nitro-amber/60 hover:shadow-nitro-sm transition-all select-none min-w-[270px] ${className}`}
    >
      <div>
        {/* Product Visual Surface */}
        <div className="relative aspect-video sm:aspect-square bg-carbon-slate overflow-hidden border-b border-fastener-border">
          <img
            src={product.images[0] || '/brand/rovin-icon.svg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
            {product.isSpecial && (
              <span className="telemetry-tag border-nitro-amber/60 bg-pitch-obsidian/90 text-nitro-amber font-bold shadow-nitro-sm">
                SPECIAL
              </span>
            )}
            {isOutOfStock && (
              <span className="telemetry-tag border-red-500/50 bg-red-950/80 text-red-400 font-bold">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Category Tag */}
          <div className="absolute top-2.5 right-2.5">
            <span className="telemetry-tag bg-carbon-slate/90 text-machined-silver font-mono text-[10px]">
              {product.category?.name || 'Hardware'}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4">
          <span className="font-mono text-[10px] text-machined-dim uppercase tracking-wider block mb-1">
            SKU: {product.sku}
          </span>
          <h3 className="font-orbitron font-bold text-sm text-machined-titanium group-hover:text-nitro-amber transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Color Indicators */}
          {product.availableColors && product.availableColors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {product.availableColors.map((c, idx) => (
                <span
                  key={idx}
                  className="w-3 h-3 rounded-full border border-fastener-border"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Buy CTA */}
      <div className="p-4 pt-0 mt-auto">
        <div className="flex items-baseline justify-between mb-3 border-t border-fastener-border pt-3">
          <div>
            <span className="font-orbitron font-black text-lg text-machined-titanium block leading-none">
              ৳{product.priceBDT.toLocaleString()}
            </span>
            {product.discountPriceBDT && (
              <span className="font-mono text-[11px] text-machined-dim line-through">
                ৳{product.discountPriceBDT.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-machined-dim">
            BDT incl. VAT
          </span>
        </div>

        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="nitro-btn w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
        >
          {isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};
