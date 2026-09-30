import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { ProductCard, ProductItem } from '../../components/product/ProductCard';
import { HeroMotionBackground } from '../../components/brand/HeroMotionBackground';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  Compass,
  ChevronRight,
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
  const [specialProducts, setSpecialProducts] = useState<ProductItem[]>([]);
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
          // Filter special products (up to 6 items)
          const specials = prods.filter((p) => p.isSpecial).slice(0, 6);
          setSpecialProducts(specials);

          // Segregate: Only non-special products for New Arrivals and Most Selling
          const nonSpecials = prods.filter((p) => !p.isSpecial);

          // New Arrivals: latest non-special products (up to 6 items)
          const latest = nonSpecials.slice(0, 6);
          setNewArrivals(latest);

          // Most Selling: non-special products, prioritizing items outside latest arrivals (up to 6 items)
          const remaining = nonSpecials.filter((p) => !latest.some((l) => l.id === p.id));
          const popular =
            remaining.length >= 6
              ? remaining.slice(0, 6)
              : [...remaining, ...latest].slice(0, 6);
          setBestsellers(popular);
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
        {/* HERO SHOWCASE SECTION WITH BRAND MOTION (Always dark tactical stage) */}
        <section className="border-b border-[#242836] relative overflow-hidden bg-gradient-to-b from-[#141721] via-[#0E1017] to-[#07080C] py-16 sm:py-24 px-4 sm:px-6">
          <HeroMotionBackground />

          <div className="max-w-6xl mx-auto text-left relative z-10">
            <h1 className="font-orbitron font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight uppercase leading-tight max-w-4xl mb-8">
              CHISELED HARDWARE &bull;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nitro-amber via-yellow-400 to-nitro-orange">
                BRUSHLESS SPEED
              </span>
            </h1>

            <div className="flex flex-wrap items-center justify-start gap-4">
              <Link
                to="/products"
                className="nitro-btn !text-pitch-deep text-xs py-3.5 px-7 flex items-center gap-2"
              >
                <Compass className="w-4 h-4" /> Explore Products
              </Link>
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center font-orbitron font-semibold tracking-wider uppercase text-xs px-6 py-3.5 rounded border border-[#343C52] bg-[#1A1E2B]/90 text-[#EEF2F8] hover:border-white hover:bg-[#222738] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-nitro-amber" /> Fast Checkout
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 1: SPECIAL ITEMS */}
        {specialProducts.length > 0 && (
          <section id="special-items" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-fastener-border">
              <div>
                <h2 className="font-orbitron font-black text-xl sm:text-2xl text-machined-titanium uppercase tracking-wide flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-nitro-amber" />
                  Special Items
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {specialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Mobile-Only Section Bottom Action */}
            <div className="mt-6 sm:hidden text-center">
              <Link
                to="/products"
                className="nitro-btn w-full text-xs py-3 flex items-center justify-center gap-2"
              >
                <span>View All Special Items</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* SECTION 2: NEW ARRIVALS */}
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
            <div className="chassis-card min-h-[320px] flex items-center justify-center p-12 text-center text-machined-dim font-mono text-sm">
              Loading products...
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="chassis-card p-12 text-center text-machined-dim font-mono text-xs">
              No products found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Mobile-Only Section Bottom Action */}
              <div className="mt-6 sm:hidden text-center">
                <Link
                  to="/products?sortBy=newest"
                  className="nitro-btn w-full text-xs py-3 flex items-center justify-center gap-2"
                >
                  <span>View All New Arrivals</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </section>

        {/* SECTION 3: MOST SELLING */}
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
              <div className="chassis-card min-h-[320px] flex items-center justify-center p-12 text-center text-machined-dim font-mono text-sm">
                Loading products...
              </div>
            ) : bestsellers.length === 0 ? (
              <div className="chassis-card p-12 text-center text-machined-dim font-mono text-xs">
                No orders registered yet.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  {bestsellers.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Mobile-Only Section Bottom Action */}
                <div className="mt-6 sm:hidden text-center">
                  <Link
                    to="/products"
                    className="nitro-btn w-full text-xs py-3 flex items-center justify-center gap-2"
                  >
                    <span>View All Most Selling</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
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
