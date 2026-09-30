import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Lock, Mail, ArrowRight, Eye, EyeOff, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  usePageTitle('Login', 'Secure Account Authentication');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  
  const { login, isAuthenticated } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(identifier, password);
    setLoading(false);
    if (success) {
      navigate(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-center items-center p-4 relative">
      {/* Top Bar Switcher */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand Emblem */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="font-orbitron font-black text-3xl tracking-[0.25em] text-machined-titanium">
              ROVIN
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className="chassis-card p-6 sm:p-8 border-nitro-amber/40 shadow-chassis">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-fastener-border">
            <User className="w-5 h-5 text-nitro-amber" />
            <h2 className="font-orbitron font-bold text-base text-machined-titanium uppercase">
              Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-machined-muted mb-1.5">
                Email Address or BD Mobile
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-machined-dim absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@email.com or 01XXXXXXXXX"
                  className="w-full bg-carbon-elevated border border-fastener-border rounded p-2.5 pl-9 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-mono uppercase text-machined-muted">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-machined-dim absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-carbon-elevated border border-fastener-border rounded p-2.5 pl-9 pr-9 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-machined-dim hover:text-machined-silver transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="nitro-btn w-full text-xs py-3 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? 'Logging In...' : 'Login'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-fastener-border text-center text-xs font-mono text-machined-dim">
            <span>Don't have an account? </span>
            <Link
              to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="text-nitro-amber font-bold hover:underline"
            >
              Register with OTP
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-[11px] font-mono text-machined-dim">
          <Link to="/" className="hover:text-nitro-amber transition-colors">
            &larr; Return to Equipment Hangar
          </Link>
        </div>
      </div>
    </div>
  );
};
