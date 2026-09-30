import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../brand/BrandLogo';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  LayoutDashboard,
  Boxes,
  FolderTree,
  ShoppingBag,
  Sliders,
  ShieldAlert,
  Store,
  LogOut,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface AdminLayoutProps {
  title: string;
  comment: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  comment,
  action,
  children,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products & Stock', to: '/admin/products', icon: Boxes },
    { label: 'Dynamic Categories', to: '/admin/categories', icon: FolderTree },
    { label: 'Orders & Courier', to: '/admin/orders', icon: ShoppingBag },
    { label: 'Security & Pilots', to: '/admin/users', icon: ShieldAlert },
    { label: 'System Settings', to: '/admin/settings', icon: Sliders },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col md:flex-row text-machined-titanium font-inter">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-carbon-slate border-b border-fastener-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BrandLogo variant="icon" size="sm" />
          <span className="font-orbitron font-black text-sm tracking-wider">ROVIN ADMIN</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="text-machined-dim p-2 hover:text-machined-titanium"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Unified Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-carbon-slate border-r border-fastener-border flex flex-col justify-between z-40 transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Brand Chassis */}
        <div>
          <div className="p-5 border-b border-fastener-border">
            <Link to="/admin" className="flex items-center gap-3">
              <BrandLogo variant="icon" size="md" />
              <div>
                <span className="font-orbitron font-black text-lg tracking-[0.2em] text-machined-titanium block leading-none">
                  ROVIN
                </span>
                <span className="text-[10px] font-mono tracking-widest block text-nitro-amber mt-1">
                  COMMAND CENTER
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-orbitron font-semibold tracking-wider uppercase transition-all duration-150 ${
                    isActive
                      ? 'bg-nitro-amber text-pitch-obsidian shadow-nitro-sm font-bold'
                      : 'text-machined-muted hover:bg-carbon-card hover:text-machined-titanium'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}

            <div className="pt-4 mt-4 border-t border-fastener-border/60">
              <Link
                to="/"
                className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-mono text-machined-dim hover:text-nitro-amber hover:bg-carbon-card transition-all"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Live Storefront
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom: User Profile Telemetry Card */}
        <div className="p-3 border-t border-fastener-border bg-carbon-card/50 relative">
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-carbon-card transition-colors border border-transparent hover:border-fastener-gunmetal"
          >
            <div className="flex items-center gap-3">
              <img
                src={user?.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                alt={user?.name || 'Admin'}
                className="w-9 h-9 rounded-full border border-nitro-amber/60 bg-carbon-slate object-cover"
              />
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-machined-titanium truncate leading-tight">
                  {user?.name || 'ROVIN Commander'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] font-mono text-nitro-amber uppercase">
                    [{user?.role || 'ADMIN'}]
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-machined-dim transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-carbon-card border border-fastener-gunmetal rounded-lg shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2">
              <div className="px-3 py-2 border-b border-fastener-border text-xs">
                <p className="font-mono text-[10px] text-machined-dim uppercase">Signed in as</p>
                <p className="font-mono text-machined-silver truncate">{user?.email || 'admin@rovin.com.bd'}</p>
              </div>

              <Link
                to="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-xs text-machined-muted hover:text-machined-titanium hover:bg-carbon-slate transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-nitro-amber" />
                Go to Profile & Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Conclude Session (Logout)
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Banner on All Pages */}
        <header className="border-b border-fastener-border bg-carbon-slate/80 backdrop-blur-md px-6 py-5 sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nitro-amber shadow-nitro-sm"></span>
              <h1 className="font-orbitron font-black text-xl text-machined-titanium uppercase tracking-wider">
                {title}
              </h1>
            </div>
            <p className="text-xs text-machined-muted font-mono mt-1">
              {comment}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {action && (
              <div className="flex items-center gap-3">
                {action}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-6 flex-1 bg-pitch-obsidian">
          {children}
        </main>
      </div>
    </div>
  );
};
