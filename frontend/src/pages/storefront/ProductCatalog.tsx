import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { useCart } from '../../context/CartContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Search, Filter, ShoppingBag, Zap, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  priceBDT: number;
  discountPriceBDT?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  availableColors?: Array<{ name: string; hex: string }>;
  images: string[];
  category: { id: string; name: string; slug: string };
}

export const ProductCatalog: React.FC = () => {
  usePageTitle('Precision Catalog & Gear Hangar', 'Explore high-torque RC drift cars, crawlers, and tech decor');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => d.success && setCategories(d.categories))
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCat) params.append('categoryId', selectedCat);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch {
      toast.error('Catalog Loading Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCat]);

  const handleInstantBuy = (product: Product) => {
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar onOpenAuth={() => {}} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Top Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-fastener-border mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-nitro-amber shadow-nitro-sm"></span>
              <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium uppercase">
                EQUIPMENT CATALOG
              </h1>
            </div>
            <p className="text-xs text-machined-muted font-mono mt-1">
              Engineered RC drift buggies, crawlers, ambient tech sculptures, and high-discharge LiPo accessories.
            </p>
          </div>

          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-machined-dim absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gear, motor, scale..."
              className="w-full bg-carbon-card border border-fastener-border rounded pl-9 pr-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
            />
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scrolling on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar font-orbitron text-xs">
          <button
            onClick={() => setSelectedCat('')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all uppercase tracking-wider font-bold ${
              selectedCat === ''
                ? 'bg-nitro-amber text-pitch-obsidian shadow-nitro-sm'
                : 'bg-carbon-card border border-fastener-border text-machined-silver hover:border-machined-titanium'
            }`}
          >
            All Hardware
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all uppercase tracking-wider font-bold ${
                selectedCat === cat.id
                  ? 'bg-nitro-amber text-pitch-obsidian shadow-nitro-sm'
                  : 'bg-carbon-card border border-fastener-border text-machined-silver hover:border-machined-titanium'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="text-center py-20 font-mono text-xs text-machined-muted">
            SCANNING HANGAR INVENTORY...
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const displayPrice = product.discountPriceBDT || product.priceBDT;
              const hasDiscount = Boolean(product.discountPriceBDT);
              const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

              return (
                <div
                  key={product.id}
                  className="chassis-card flex flex-col justify-between overflow-hidden group hover:border-nitro-amber/60"
                >
                  <div>
                    {/* Visual Media & Badges */}
                    <Link to={`/product/${product.slug}`} className="block relative aspect-video bg-carbon-slate overflow-hidden">
                      <img
                        src={product.images[0] || '/assets/avatars/avatar-m1.svg'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <span className="telemetry-tag border-pitch-obsidian/80 bg-pitch-obsidian/90 text-nitro-amber text-[10px] font-bold">
                          {product.category.name}
                        </span>
                        {isLowStock && (
                          <span className="telemetry-tag border-red-500/80 bg-pitch-obsidian/90 text-red-400 text-[9px] font-bold">
                            ONLY {product.stockQuantity} LEFT
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Content Details */}
                    <div className="p-4 sm:p-5">
                      <span className="text-[10px] font-mono text-machined-dim uppercase tracking-wider block mb-1">
                        {product.sku}
                      </span>
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-bold text-sm text-machined-titanium hover:text-nitro-amber transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-machined-muted font-mono mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Color dots */}
                      {product.availableColors && product.availableColors.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-3">
                          <span className="text-[10px] font-mono text-machined-dim">Colors:</span>
                          {product.availableColors.map((col, idx) => (
                            <span
                              key={idx}
                              className="w-3 h-3 rounded-full border border-pitch-obsidian"
                              style={{ backgroundColor: col.hex }}
                              title={col.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & CTA Controls */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-fastener-border/60 mt-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-orbitron font-bold text-base text-machined-titanium">
                        ৳{displayPrice.toLocaleString()}
                      </div>
                      {hasDiscount && (
                        <span className="text-[11px] font-mono text-machined-dim line-through block">
                          ৳{product.priceBDT.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="p-2 rounded bg-carbon-slate border border-fastener-gunmetal hover:border-nitro-amber text-machined-silver hover:text-nitro-amber transition-colors"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleInstantBuy(product)}
                        className="nitro-btn text-[11px] py-2 px-3 font-bold"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="chassis-card p-12 text-center max-w-md mx-auto my-10">
            <p className="text-sm font-mono text-machined-muted mb-4">No gear matched your filter parameters.</p>
            <button onClick={() => { setSearch(''); setSelectedCat(''); }} className="outline-btn text-xs py-2 px-4">
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-fastener-border py-6 px-6 text-center text-xs text-machined-dim bg-pitch-deep">
        <span className="font-mono">ROVIN BANGLADESH &bull; PRECISION TELEMETRY PROTOCOL</span>
      </footer>

      <MobileBottomNav onOpenAuth={() => {}} />
    </div>
  );
};
