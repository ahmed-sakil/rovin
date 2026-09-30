import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Compass, ShoppingBag, User, ShieldCheck, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  onOpenAuth?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenAuth }) => {
  const { itemCount } = useCart();
  const { user, isAuthenticated, isAdmin } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-carbon-slate/95 backdrop-blur-lg border-t border-fastener-border px-3 py-2 flex items-center justify-around shadow-2xl transition-colors">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider transition-colors ${
            isActive ? 'text-nitro-amber font-bold' : 'text-machined-dim hover:text-machined-muted'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span>CATALOG</span>
      </NavLink>

      <NavLink
        to="/checkout"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider transition-colors ${
            isActive ? 'text-nitro-amber font-bold' : 'text-machined-dim hover:text-machined-muted'
          }`
        }
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-nitro-amber text-pitch-obsidian text-[9px] font-black flex items-center justify-center shadow-nitro-sm">
              {itemCount}
            </span>
          )}
        </div>
        <span>CART</span>
      </NavLink>

      {isAuthenticated && (
        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider transition-colors ${
              isActive ? 'text-nitro-amber font-bold' : 'text-machined-dim hover:text-machined-muted'
            }`
          }
        >
          <Package className="w-5 h-5" />
          <span>ORDERS</span>
        </NavLink>
      )}

      {isAdmin ? (
        <Link
          to="/admin"
          className="flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider text-cyan-400 hover:text-cyan-300"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>COMMAND</span>
        </Link>
      ) : isAuthenticated && user ? (
        <Link
          to="/account"
          className="flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider text-machined-silver hover:text-nitro-amber"
        >
          <img
            src={user.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
            alt={user.name}
            className="w-5 h-5 rounded-full border border-nitro-amber/70 object-cover"
          />
          <span>PILOT</span>
        </Link>
      ) : (
        <Link
          to="/login"
          className="flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider text-machined-dim hover:text-nitro-amber"
        >
          <User className="w-5 h-5" />
          <span>SIGN IN</span>
        </Link>
      )}
    </nav>
  );
};
