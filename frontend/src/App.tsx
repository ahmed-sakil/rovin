import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminSettings } from './pages/admin/AdminSettings';
import { usePageTitle } from './hooks/usePageTitle';
import { toast } from 'sonner';
import { ShieldCheck, Zap, Truck, Layers, Terminal, User, LogOut, ArrowRight, Boxes, Sliders, ExternalLink } from 'lucide-react';

function StorefrontHome() {
  usePageTitle('Precision RC & High-Torque Gear', 'Bangladesh D2C Storefront');
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-fastener-border bg-carbon-slate/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-carbon-card border border-nitro-amber/50 flex items-center justify-center text-nitro-amber font-orbitron font-black text-2xl shadow-nitro-sm">
            R
          </div>
          <div>
            <span className="font-orbitron font-black text-xl tracking-[0.2em] text-machined-titanium block leading-none">
              ROVIN
            </span>
            <span className="text-[10px] font-mono tracking-widest block text-nitro-amber mt-1">
              PRECISION RC • TECH NOVELTIES • DECOR
            </span>
          </div>
        </div>

        {/* User Navigation / Admin Link */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="nitro-btn text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-nitro-sm"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}
              <div className="flex items-center gap-2 bg-carbon-card border border-fastener-gunmetal rounded-lg p-1.5 pr-3">
                <img
                  src={user.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-nitro-amber/60 bg-carbon-slate object-cover"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-machined-titanium leading-tight">{user.name}</p>
                  <span className="text-[10px] font-mono text-nitro-amber">[{user.role}]</span>
                </div>
                <button onClick={logout} title="Sign Out" className="text-machined-dim hover:text-red-400 p-1 ml-1">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                className="outline-btn text-xs py-2 px-3.5"
              >
                Access Terminal
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                className="nitro-btn text-xs py-2 px-3.5"
              >
                Join Crew
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Showcase Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 telemetry-tag mb-4 border-nitro-amber/40 text-nitro-amber">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            PHASE 3 ACTIVE &bull; ADMIN PANEL &bull; INSTANT METADATA FILE UPLOAD &bull; DATA VIZ
          </div>
          <h1 className="font-orbitron font-black text-4xl sm:text-5xl lg:text-6xl text-machined-titanium tracking-tight uppercase leading-tight mb-4">
            PRECISION ENGINEERING <span className="text-transparent bg-clip-text bg-gradient-to-r from-nitro-amber to-nitro-orange">MEETS COMMERCE</span>
          </h1>
          <p className="text-machined-muted text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Admin command center deployed with dynamic category taxonomies, instant media metadata extraction, stock velocity charts, and user-friendly inventory management.
          </p>
        </div>

        {/* Quick Access Portals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            to="/admin"
            className="chassis-card p-5 group flex flex-col justify-between hover:border-nitro-amber/60"
          >
            <div>
              <div className="w-10 h-10 rounded bg-carbon-slate border border-nitro-amber/40 flex items-center justify-center text-nitro-amber mb-3 group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-orbitron font-bold text-sm text-machined-titanium group-hover:text-nitro-amber transition-colors">
                Command Dashboard
              </h3>
              <p className="text-xs text-machined-muted mt-1 font-mono">
                Interactive revenue trend charts, inventory health meters, and courier pipeline.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-nitro-amber mt-4">
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="chassis-card p-5 group flex flex-col justify-between hover:border-nitro-amber/60"
          >
            <div>
              <div className="w-10 h-10 rounded bg-carbon-slate border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="font-orbitron font-bold text-sm text-machined-titanium group-hover:text-cyan-400 transition-colors">
                Products & Stock Ledger
              </h3>
              <p className="text-xs text-machined-muted mt-1 font-mono">
                Add SKUs with colors, sizes, specs, and upload media with instant metadata telemetry.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 mt-4">
              <span>Manage Products</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/categories"
            className="chassis-card p-5 group flex flex-col justify-between hover:border-nitro-amber/60"
          >
            <div>
              <div className="w-10 h-10 rounded bg-carbon-slate border border-purple-400/40 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-orbitron font-bold text-sm text-machined-titanium group-hover:text-purple-400 transition-colors">
                Dynamic Taxonomies
              </h3>
              <p className="text-xs text-machined-muted mt-1 font-mono">
                Create and organize non-hardcoded categories and child subcategories.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-purple-400 mt-4">
              <span>Configure Categories</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>

      {/* Technical Footer */}
      <footer className="border-t border-fastener-border py-4 px-6 text-center text-xs text-machined-dim flex flex-col sm:flex-row items-center justify-between gap-2 bg-pitch-deep">
        <span className="font-mono">ROVIN TACTICAL PLATFORM &bull; BANGLADESH E-COMMERCE CORE</span>
        <span className="font-mono text-nitro-amber/80">ADMIN COMMAND CENTER V1.0</span>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<StorefrontHome />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </AuthProvider>
  );
}
