import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AuthModal } from './components/auth/AuthModal';
import { StorefrontNavbar } from './components/layout/StorefrontNavbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Storefront Pages
import { ProductCatalog } from './pages/storefront/ProductCatalog';
import { ProductDetail } from './pages/storefront/ProductDetail';
import { CheckoutPage } from './pages/storefront/CheckoutPage';
import { OrderSuccess } from './pages/storefront/OrderSuccess';
import { CmsPage } from './pages/storefront/CmsPage';
import { ContactPage } from './pages/storefront/ContactPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminSettings } from './pages/admin/AdminSettings';

import { usePageTitle } from './hooks/usePageTitle';
import { Zap, ShieldCheck, Truck, Layers, Terminal, ArrowRight, Boxes, Compass, Flame } from 'lucide-react';

function StorefrontHome() {
  usePageTitle('Precision RC & High-Torque Gear', 'Bangladesh D2C Storefront');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar onOpenAuth={(mode) => { setAuthMode(mode || 'login'); setAuthModalOpen(true); }} />

      {/* Hero Showcase Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 telemetry-tag mb-4 border-nitro-amber/40 text-nitro-amber">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            HIGH-TORQUE BANGLADESH D2C COMMERCE
          </div>
          <h1 className="font-orbitron font-black text-3xl sm:text-5xl lg:text-6xl text-machined-titanium tracking-tight uppercase leading-tight mb-4">
            CHISELED HARDWARE &bull; <span className="text-transparent bg-clip-text bg-gradient-to-r from-nitro-amber to-nitro-orange">BRUSHLESS SPEED</span>
          </h1>
          <p className="text-machined-muted text-sm sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Precision gyro-assisted 1:16 drift chassis, high-clearance 4x4 trail crawlers, and CNC machined engine desk sculptures. Nationwide Cash on Delivery across Bangladesh.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/products" className="nitro-btn text-xs py-3.5 px-6 flex items-center gap-2 shadow-nitro">
              <Compass className="w-4 h-4" /> Explore Equipment Hangar
            </Link>
            <Link to="/checkout" className="outline-btn text-xs py-3.5 px-6 flex items-center gap-2">
              <Truck className="w-4 h-4 text-nitro-amber" /> Fast 1-Page Checkout
            </Link>
          </div>
        </div>

        {/* Feature Matrix Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="chassis-card p-5">
            <div className="w-10 h-10 rounded bg-carbon-slate border border-nitro-amber/40 flex items-center justify-center text-nitro-amber mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-orbitron font-bold text-sm text-machined-titanium mb-1">
              Nationwide Courier Speed
            </h3>
            <p className="text-xs text-machined-muted font-mono leading-relaxed">
              Automated dispatch via Steadfast & Pathao. Inside Dhaka 24-48h (৳70), Outside Dhaka 48-72h (৳130).
            </p>
          </div>

          <div className="chassis-card p-5">
            <div className="w-10 h-10 rounded bg-carbon-slate border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-orbitron font-bold text-sm text-machined-titanium mb-1">
              Frictionless COD & MFS
            </h3>
            <p className="text-xs text-machined-muted font-mono leading-relaxed">
              Zero upfront risk with Cash on Delivery, or seamless digital payment via bKash & Nagad.
            </p>
          </div>

          <div className="chassis-card p-5">
            <div className="w-10 h-10 rounded bg-carbon-slate border border-purple-400/40 flex items-center justify-center text-purple-400 mb-3">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-orbitron font-bold text-sm text-machined-titanium mb-1">
              Tactical "The Boys" Vibe
            </h3>
            <p className="text-xs text-machined-muted font-mono leading-relaxed">
              No cheap plastic toys. Strict mechanical standards, aluminum parts, and CNC telemetry aesthetic.
            </p>
          </div>
        </div>
      </main>

      {/* Technical Footer */}
      <footer className="border-t border-fastener-border py-6 px-6 text-center text-xs text-machined-dim bg-pitch-deep">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono">ROVIN BANGLADESH &bull; PRECISION TELEMETRY PROTOCOL</span>
          <div className="flex gap-4 font-mono text-[11px]">
            <Link to="/about" className="hover:text-nitro-amber">About</Link>
            <Link to="/contact" className="hover:text-nitro-amber">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-nitro-amber">Privacy</Link>
            <Link to="/terms-conditions" className="hover:text-nitro-amber">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Bar with Hot Features */}
      <MobileBottomNav onOpenAuth={() => { setAuthMode('login'); setAuthModalOpen(true); }} />

      {/* Auth Modal with Mandatory Policy Checkbox */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Storefront Routes */}
          <Route path="/" element={<StorefrontHome />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
          <Route path="/about" element={<CmsPage slugOverride="about-us" />} />
          <Route path="/privacy-policy" element={<CmsPage slugOverride="privacy-policy" />} />
          <Route path="/terms-conditions" element={<CmsPage slugOverride="terms-conditions" />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
        />
      </CartProvider>
    </AuthProvider>
  );
}
