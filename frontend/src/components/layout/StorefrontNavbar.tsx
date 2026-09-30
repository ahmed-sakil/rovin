import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { BrandLogo } from '../brand/BrandLogo';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
  Boxes,
  Compass,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface StorefrontNavbarProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const StorefrontNavbar: React.FC<StorefrontNavbarProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [burgerOpen, setBurgerOpen] = useState(false);

  return (
    <>
      <header className="border-b border-fastener-border bg-carbon-slate/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
        {/* Brand Mark & Mobile Burger Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBurgerOpen(!burgerOpen)}
            className="md:hidden text-machined-dim hover:text-machined-titanium p-1.5 rounded transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {burgerOpen ? <X className="w-6 h-6 text-nitro-amber" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex items-center hover:opacity-95 transition-opacity">
            <BrandLogo variant="horizontal" size="md" />
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-orbitron font-semibold tracking-wider uppercase">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'text-nitro-amber font-bold' : 'text-machined-muted hover:text-machined-titanium transition-colors'
            }
          >
            Catalog Hangar
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? 'text-nitro-amber font-bold' : 'text-machined-muted hover:text-machined-titanium transition-colors'
            }
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? 'text-nitro-amber font-bold' : 'text-machined-muted hover:text-machined-titanium transition-colors'
            }
          >
            Contact
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/account"
              className={({ isActive }) =>
                isActive ? 'text-nitro-amber font-bold' : 'text-machined-muted hover:text-machined-titanium transition-colors'
              }
            >
              My Orders
            </NavLink>
          )}
        </nav>

        {/* Right Action Icons: Theme, Cart, Profile / Admin */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* Cart Button with Counter */}
          <Link
            to="/checkout"
            className="relative p-2 rounded-lg bg-carbon-card border border-fastener-border hover:border-nitro-amber text-machined-silver hover:text-nitro-amber transition-colors"
            title="Cart & 1-Page Checkout"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-nitro-amber text-pitch-obsidian font-mono text-[9px] font-black flex items-center justify-center shadow-nitro-sm">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Admin Switcher */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 nitro-btn text-xs py-1.5 px-3"
            >
              <Boxes className="w-3.5 h-3.5" />
              Command
            </Link>
          )}

          {/* User Profile / Access */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/account"
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border border-fastener-border bg-carbon-card hover:border-nitro-amber transition-all"
                title="Pilot Station"
              >
                <img
                  src={user.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-nitro-amber/70 object-cover"
                />
                <span className="hidden sm:inline font-orbitron text-xs font-bold text-machined-titanium max-w-[90px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="text-machined-dim hover:text-red-400 p-1.5 hidden sm:block transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="outline-btn text-xs py-1.5 px-3 hidden sm:inline-flex"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="nitro-btn text-xs py-1.5 px-3 hidden sm:inline-flex shadow-nitro-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Burger Menu Sliding Drawer */}
      {burgerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-pitch-obsidian/80 backdrop-blur-md">
          <div className="w-72 max-w-[85vw] h-full bg-carbon-slate border-r border-fastener-border p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-fastener-border mb-4">
                <BrandLogo variant="horizontal" size="sm" />
                <button onClick={() => setBurgerOpen(false)} className="text-machined-dim p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Toggle within Drawer */}
              <div className="mb-4">
                <ThemeToggle showLabel className="w-full justify-between px-3" />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 font-orbitron text-xs">
                <NavLink
                  to="/"
                  end
                  onClick={() => setBurgerOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded text-machined-silver hover:bg-carbon-card hover:text-nitro-amber"
                >
                  <span>Catalog Hangar</span>
                  <ChevronRight className="w-4 h-4 text-machined-dim" />
                </NavLink>

                <NavLink
                  to="/about"
                  onClick={() => setBurgerOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded text-machined-silver hover:bg-carbon-card hover:text-nitro-amber"
                >
                  <span>About ROVIN</span>
                  <ChevronRight className="w-4 h-4 text-machined-dim" />
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setBurgerOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded text-machined-silver hover:bg-carbon-card hover:text-nitro-amber"
                >
                  <span>Contact & Support</span>
                  <ChevronRight className="w-4 h-4 text-machined-dim" />
                </NavLink>

                {isAuthenticated && (
                  <NavLink
                    to="/account"
                    onClick={() => setBurgerOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded text-nitro-amber font-bold hover:bg-carbon-card"
                  >
                    <span>Pilot Command Station</span>
                    <ChevronRight className="w-4 h-4 text-nitro-amber" />
                  </NavLink>
                )}

                <div className="pt-3 mt-3 border-t border-fastener-border text-[11px] font-mono">
                  <span className="text-machined-dim uppercase tracking-wider block px-3 mb-1">Policies</span>
                  <Link
                    to="/privacy-policy"
                    onClick={() => setBurgerOpen(false)}
                    className="block px-3 py-1.5 text-machined-muted hover:text-nitro-amber"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms-conditions"
                    onClick={() => setBurgerOpen(false)}
                    className="block px-3 py-1.5 text-machined-muted hover:text-nitro-amber"
                  >
                    Terms & Warranty
                  </Link>
                </div>

                {isAdmin && (
                  <div className="pt-3 mt-3 border-t border-fastener-border">
                    <Link
                      to="/admin"
                      onClick={() => setBurgerOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-cyan-400 font-bold hover:bg-carbon-card"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Command Center
                    </Link>
                  </div>
                )}
              </nav>
            </div>

            {/* Bottom: Auth Actions in Drawer */}
            <div className="pt-4 border-t border-fastener-border">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <Link
                    to="/account"
                    onClick={() => setBurgerOpen(false)}
                    className="flex items-center gap-2 overflow-hidden flex-1"
                  >
                    <img
                      src={user.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-nitro-amber"
                    />
                    <div className="text-left truncate">
                      <p className="text-xs font-bold text-machined-titanium truncate">{user.name}</p>
                      <span className="text-[10px] font-mono text-nitro-amber">[{user.role}]</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => { logout(); setBurgerOpen(false); }}
                    className="text-red-400 p-1"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setBurgerOpen(false)}
                    className="outline-btn text-xs py-2 text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setBurgerOpen(false)}
                    className="nitro-btn text-xs py-2 text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
