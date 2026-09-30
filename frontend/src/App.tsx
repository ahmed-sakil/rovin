import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { toast } from 'sonner';
import { ShieldCheck, Zap, Truck, Layers, Terminal, User, LogOut, CheckCircle, Flame } from 'lucide-react';

function PlatformContent() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testApiHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiStatus(data.status);
      toast.success('Core API Telemetry Online', {
        description: `Service: ${data.service} • Status: ${data.status}`
      });
    } catch {
      setApiStatus('OFFLINE');
      toast.error('API Connection Offline', {
        description: 'Ensure backend server is running on port 5050'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between">
      {/* Top Telemetry Header */}
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
              PRECISION RC &bull; TECH NOVELTIES &bull; DECOR
            </span>
          </div>
        </div>

        {/* User Status / Auth Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 bg-carbon-card border border-fastener-gunmetal rounded-lg p-1.5 pr-3">
              <img
                src={user.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-nitro-amber/60 bg-carbon-slate"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-machined-titanium leading-tight">{user.name}</p>
                <span className="inline-block text-[10px] font-mono text-nitro-amber tracking-wider">
                  [{user.role}]
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="text-machined-dim hover:text-red-400 p-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
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

      {/* Main Showcase Hero */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 telemetry-tag mb-4 border-nitro-amber/40 text-nitro-amber">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            PHASE 2 &bull; POSTGRESQL + PRISMA 6 + BCRYPT + 6-DIGIT OTP ACTIVE
          </div>
          <h1 className="font-orbitron font-black text-4xl sm:text-5xl lg:text-6xl text-machined-titanium tracking-tight uppercase leading-tight mb-4">
            CHISELED <span className="text-transparent bg-clip-text bg-gradient-to-r from-nitro-amber to-nitro-orange">HIGH-TORQUE</span> COMMERCE
          </h1>
          <p className="text-machined-muted text-base sm:text-lg max-w-2xl mx-auto font-normal">
            PostgreSQL database synchronized on port 5432. Dual authentication system featuring 6-digit OTP verification, bcrypt password hashing, and 6 tactical operator avatars.
          </p>
        </div>

        {/* Tactical Telemetry Status Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="chassis-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="telemetry-tag text-nitro-amber border-nitro-amber/30">DATABASE: POSTGRESQL 16</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-orbitron text-sm font-bold text-machined-titanium mb-1">
              Prisma 6.x Synchronized
            </h3>
            <p className="text-xs text-machined-muted leading-relaxed">
              13 relational models created in <code className="text-nitro-amber font-mono">rovin_db</code>. Includes Users, Saved Addresses, OTPs, Activity Logs, and Taxonomies.
            </p>
          </div>

          <div className="chassis-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="telemetry-tag text-nitro-amber border-nitro-amber/30">SECURITY: BCRYPT & OTP</span>
              <ShieldCheck className="w-4 h-4 text-nitro-amber" />
            </div>
            <h3 className="font-orbitron text-sm font-bold text-machined-titanium mb-1">
              6-Digit Verification Gateway
            </h3>
            <p className="text-xs text-machined-muted leading-relaxed">
              Pluggable OTP architecture (Console &bull; Free SMTP Email &bull; Ready for BD SMS). Rate-limited to 60s cooldown and 5-minute expiry.
            </p>
          </div>

          <div className="chassis-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="telemetry-tag text-nitro-amber border-nitro-amber/30">IDENTITY: AVATARS</span>
              <User className="w-4 h-4 text-machined-silver" />
            </div>
            <h3 className="font-orbitron text-sm font-bold text-machined-titanium mb-1">
              6 Tactical Vector Avatars
            </h3>
            <p className="text-xs text-machined-muted leading-relaxed">
              Assigned automatically by gender during signup (Drift Pilots & Tech Navigators). Replaceable via Cloudinary profile uploads.
            </p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
            className="nitro-btn flex items-center gap-2 py-3 px-6"
          >
            <User className="w-4 h-4" />
            {isAuthenticated ? 'Manage Crew Session' : 'Test Login (Admin or Customer)'}
          </button>

          <button
            onClick={testApiHealth}
            disabled={loading}
            className="outline-btn flex items-center gap-2 py-3 px-6"
          >
            <Terminal className="w-4 h-4 text-nitro-amber" />
            {loading ? 'Pinging Telemetry...' : 'Ping Backend API (Port 5050)'}
          </button>
        </div>

        {apiStatus && (
          <div className="mt-6 text-center">
            <span className="telemetry-tag border-emerald-500/50 text-emerald-400">
              API TELEMETRY STATUS: {apiStatus} (POSTGRESQL 16 SYNCED)
            </span>
          </div>
        )}
      </main>

      {/* Technical Footer */}
      <footer className="border-t border-fastener-border py-4 px-6 text-center text-xs text-machined-dim flex flex-col sm:flex-row items-center justify-between gap-2 bg-pitch-deep">
        <span className="font-mono">ROVIN TACTICAL PLATFORM &bull; BANGLADESH E-COMMERCE CORE</span>
        <span className="font-mono text-nitro-amber/80">PHASE 2 DEPLOYED &bull; POSTGRESQL 16</span>
      </footer>

      {/* Authentication Modal */}
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
      <PlatformContent />
    </AuthProvider>
  );
}
