import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { useCart } from '../../context/CartContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { BrandLogo } from '../../components/brand/BrandLogo';
import {
  Search,
  ShoppingBag,
  Zap,
  ArrowRight,
  Truck,
  ShieldCheck,
  Flame,
  Filter,
} from 'lucide-react';
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
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0 transition-colors">
      <StorefrontNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        {/* Top Hero Banner */}
        <div className="chassis-card p-6 sm:p-10 mb-8 border-nitro-amber/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-nitro-amber/10 to-transparent pointer-events-none rounded-bl-full" />
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 telemetry-tag mb-3 border-nitro-amber/40 text-nitro-amber">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              HIGH-TORQUE BANGLADESH D2C COMMERCE
            </div>
            <h1 className="font-orbitron font-black text-2xl sm:text-4xl text-machined-titanium tracking-tight uppercase leading-tight mb-3">
              CHISELED HARDWARE &bull; <span className="text-transparent bg-clip-text bg-gradient-to-r from-nitro-amber to-nitro-orange">BRUSHLESS SPEED</span>
            </h1>
            <p className="text-machined-muted text-xs sm:text-sm font-normal leading-relaxed mb-6">
              Precision gyro-assisted 1:16 drift chassis, high-clearance 4x4 trail crawlers, and CNC machined engine desk sculptures. Nationwide Cash on Delivery across Bangladesh.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 telemetry-tag border-emerald-500/40 text-emerald-400">
                <Truck className="w-3.5 h-3.5" /> Nationwide COD (৳70/৳130)
              </span>
              <span className="flex items-center gap-1.5 telemetry-tag border-cyan-400/40 text-cyan-400">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Tested Pre-Dispatch
              </span>
              <span className="flex items-center gap-1.5 telemetry-tag border-purple-400/40 text-purple-400">
                <Flame className="w-3.5 h-3.5" /> 2.4GHz Gyro Assisted
              </span>
            </div>
          </div>
        </div>

        {/* Top Header & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-fastener-border mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandLogo variant="icon" size="sm" />
              <h2 className="font-orbitron font-black text-xl sm:text-2xl text-machined-titanium uppercase">
                EQUIPMENT HANGAR
              </h2>
            </div>
            <p className="text-xs text-machined-muted font-mono mt-1">
              Select your chassis specification, review telemetry, and order with 1-page checkout.
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-machined-dim absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gear, motor, scale, crawler..."
              className="w-full bg-carbon-card border border-fastener-border rounded pl-9 pr-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber font-mono"
            />
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scrolling on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 font-orbitron text-xs">
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
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all uppercase tracking-wider font-semibold ${
                selectedCat === c.id
                  ? 'bg-nitro-amber text-pitch-obsidian shadow-nitro-sm font-bold'
                  : 'bg-carbon-card border border-fastener-border text-machined-silver hover:border-machined-titanium'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="chassis-card p-16 text-center text-machined-dim font-mono text-sm">
            Scanning Hangar Inventory...
          </div>
        ) : products.length === 0 ? (
          <div className="chassis-card p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-machined-dim mx-auto mb-3 opacity-50" />
            <h3 className="font-orbitron font-bold text-base text-machined-titanium uppercase mb-1">
              No Equipment Matches Found
            </h3>
            <p className="text-xs text-machined-muted font-mono mb-4">
              Try adjusting your telemetry search filters or browse other categories.
            </p>
            <button
              onClick={() => { setSelectedCat(''); setSearch(''); }}
              className="outline-btn text-xs py-2 px-4"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => {
              const isOutOfStock = p.stockQuantity <= 0;
              const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;

              return (
                <div
                  key={p.id}
                  className="chassis-card flex flex-col justify-between overflow-hidden group hover:border-nitro-amber/60 hover:shadow-nitro-sm transition-all"
                >
                  <div>
                    {/* Image Surface */}
                    <div className="relative aspect-video sm:aspect-square bg-carbon-slate overflow-hidden border-b border-fastener-border">
                      <img
                        src={p.images[0] || '/brand/rovin-icon.svg'}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Stock Telemetry Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {isOutOfStock ? (
                          <span className="telemetry-tag border-red-500/50 bg-red-950/80 text-red-400">
                            DEPLETED
                          </span>
                        ) : isLowStock ? (
                          <span className="telemetry-tag border-amber-500/50 bg-amber-950/80 text-amber-400">
                            ONLY {p.stockQuantity} LEFT
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <span className="telemetry-tag bg-carbon-slate/90 text-machined-silver">
                          {p.category.name}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="p-4">
                      <span className="font-mono text-[10px] text-machined-dim uppercase tracking-wider block mb-1">
                        SKU: {p.sku}
                      </span>
                      <h3 className="font-orbitron font-bold text-sm text-machined-titanium group-hover:text-nitro-amber transition-colors line-clamp-2 leading-snug">
                        <Link to={`/product/${p.slug}`}>
                          {p.title}
                        </Link>
                      </h3>

                      {/* Color dots */}
                      {p.availableColors && p.availableColors.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2.5">
                          {p.availableColors.map((c, idx) => (
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

                  {/* Pricing & CTA */}
                  <div className="p-4 pt-0 mt-auto">
                    <div className="flex items-baseline justify-between mb-3 border-t border-fastener-border pt-3">
                      <div>
                        <span className="font-orbitron font-black text-lg text-machined-titanium block leading-none">
                          ৳{p.priceBDT.toLocaleString()}
                        </span>
                        {p.discountPriceBDT && (
                          <span className="font-mono text-[11px] text-machined-dim line-through">
                            ৳{p.discountPriceBDT.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-machined-dim">
                        BDT incl. VAT
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/product/${p.slug}`}
                        className="outline-btn text-[11px] py-2 text-center"
                      >
                        Specs
                      </Link>
                      <button
                        onClick={() => handleInstantBuy(p)}
                        disabled={isOutOfStock}
                        className="nitro-btn text-[11px] py-2"
                      >
                        {isOutOfStock ? 'Sold Out' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Technical Footer */}
      <footer className="border-t border-fastener-border py-6 px-6 text-center text-xs text-machined-dim bg-pitch-deep">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono">ROVIN BANGLADESH &bull; PRECISION TELEMETRY PROTOCOL</span>
          <div className="flex gap-4 font-mono text-[11px]">
            <Link to="/about" className="hover:text-nitro-amber">About</Link>
            <Link to="/contact" className="hover:text-nitro-amber">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-nitro-amber">Privacy</Link>
            <Link to="/terms-conditions" className="hover:text-nitro-amber">Terms</Link>
          </div>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
};
