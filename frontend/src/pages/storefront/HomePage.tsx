import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { ProductCard, ProductItem } from '../../components/product/ProductCard';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { HeroMotionBackground } from '../../components/brand/HeroMotionBackground';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  Compass,
  ChevronRight,
  Package,
  Truck,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export const HomePage: React.FC = () => {
  usePageTitle('Precision RC & High-Torque Gear', 'Bangladesh D2C Storefront');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductItem[]>([]);
  const [bestsellers, setBestsellers] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.categories);

        // Fetch products
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        if (prodData.success) {
          const prods: ProductItem[] = prodData.products;
          // Sort for new arrivals (latest created)
          setNewArrivals(prods.slice(0, 4));
          // Most selling / featured items
          const popular = [...prods].reverse().slice(0, 4);
          setBestsellers(popular.length > 0 ? popular : prods.slice(0, 4));
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0 transition-colors">
      <StorefrontNavbar />

      <main className="flex-1 w-full">
        {/* HERO SHOWCASE SECTION WITH BRAND MOTION */}
        <section className="border-b border-fastener-border relative overflow-hidden bg-gradient-to-b from-carbon-slate via-carbon-slate/75 to-pitch-obsidian py-16 sm:py-24 px-4 sm:px-6">
          <HeroMotionBackground />

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h1 className="font-orbitron font-black text-3xl sm:text-5xl lg:text-6xl text-machined-titanium tracking-tight uppercase leading-tight max-w-4xl mx-auto mb-4">
              CHISELED HARDWARE &bull;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nitro-amber via-yellow-400 to-nitro-orange">
                BRUSHLESS SPEED
              </span>
            </h1>

            <p className="text-machined-muted text-xs sm:text-base max-w-2xl mx-auto font-normal leading-relaxed mb-8">
              Precision gyro-assisted 1:16 drift chassis, high-clearance 4x4 trail crawlers, and CNC machined mechanical engine desk sculptures. Nationwide Cash on Delivery across Bangladesh.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/products"
                className="nitro-btn text-xs py-3.5 px-7 flex items-center gap-2 shadow-nitro"
              >
                <Compass className="w-4 h-4" /> Explore Equipment Hangar
              </Link>
              <Link
                to="/checkout"
                className="outline-btn text-xs py-3.5 px-6 flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-nitro-amber" /> Fast Checkout
              </Link>
            </div>
          </div>
        </section>

        {/* CATEGORY HOP BAR */}
        {categories.length > 0 && (
          <section className="border-b border-fastener-border bg-carbon-slate/50 px-4 sm:px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-orbitron font-bold uppercase text-machined-muted whitespace-nowrap">
                <span>Quick Hop:</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar font-orbitron text-xs">
                <Link
                  to="/products"
                  className="px-3 py-1.5 rounded-lg border border-fastener-border bg-carbon-card text-machined-silver hover:border-nitro-amber whitespace-nowrap"
                >
                  All Gear
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/products?categoryId=${c.id}`}
                    className="px-3 py-1.5 rounded-lg border border-fastener-border bg-carbon-card text-machined-silver hover:border-nitro-amber whitespace-nowrap"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1: NEW ARRIVALS */}
        <section id="new-arrivals" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-fastener-border">
            <div>
              <h2 className="font-orbitron font-black text-xl sm:text-2xl text-machined-titanium uppercase tracking-wide">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/products?sortBy=newest"
              className="font-orbitron text-xs font-bold text-nitro-amber hover:underline flex items-center gap-1.5"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="chassis-card p-12 text-center text-machined-dim font-mono text-sm">
              Loading products...
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="chassis-card p-12 text-center text-machined-dim font-mono text-xs">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: MOST SELLING */}
        <section id="most-selling" className="border-t border-fastener-border bg-carbon-slate/30 py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-fastener-border">
              <div>
                <h2 className="font-orbitron font-black text-xl sm:text-2xl text-machined-titanium uppercase tracking-wide">
                  Most Selling
                </h2>
              </div>
              <Link
                to="/products"
                className="font-orbitron text-xs font-bold text-nitro-amber hover:underline flex items-center gap-1.5"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="chassis-card p-12 text-center text-machined-dim font-mono text-sm">
                Loading products...
              </div>
            ) : bestsellers.length === 0 ? (
              <div className="chassis-card p-12 text-center text-machined-dim font-mono text-xs">
                No orders registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestsellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* MECHANICAL STANDARDS / "THE BOYS" BANNER */}
        <section className="border-t border-fastener-border py-12 px-4 sm:px-6 bg-carbon-card">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="chassis-card p-6">
              <h3 className="font-orbitron font-bold text-sm text-machined-titanium mb-1">
                CNC Aluminum & Steel Gears
              </h3>
              <p className="text-xs text-machined-muted leading-relaxed font-mono">
                No fragile plastic drivecups. Aircraft grade 6061-T6 aluminum hubs and hardened steel differentials for extreme torque.
              </p>
            </div>
            <div className="chassis-card p-6">
              <h3 className="font-orbitron font-bold text-sm text-machined-titanium mb-1">
                Electronic Gyroscope Stabilization
              </h3>
              <p className="text-xs text-machined-muted leading-relaxed font-mono">
                Integrated counter-steer heading-lock gyros for razor-sharp tandem RC drifting on polished concrete and desk surfaces.
              </p>
            </div>
            <div className="chassis-card p-6">
              <h3 className="font-orbitron font-bold text-sm text-machined-titanium mb-1">
                Zero-Risk Delivery
              </h3>
              <p className="text-xs text-machined-muted leading-relaxed font-mono">
                Inspect parcel integrity at your doorstep before handing cash to the courier. Automated Steadfast & Pathao parcel tracking.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Unified Public Footer */}
      <StorefrontFooter />

      <MobileBottomNav />
    </div>
  );
};
