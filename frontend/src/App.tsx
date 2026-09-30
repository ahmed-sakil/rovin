import React, { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Zap, Truck, Layers, Terminal } from 'lucide-react';

export default function App() {
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testApiHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiStatus(data.status);
      toast.success('Core API Telemetry Connected', {
        description: `Service: ${data.service} • Status: ${data.status}`
      });
    } catch {
      setApiStatus('OFFLINE');
      toast.error('API Connection Offline', {
        description: 'Ensure backend server is running on port 5000'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between">
      {/* Top Telemetry Header */}
      <header className="border-b border-fastener-border bg-carbon-slate/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-carbon-card border border-nitro-amber/40 flex items-center justify-center text-nitro-amber font-orbitron font-black text-xl shadow-nitro-sm">
            R
          </div>
          <div>
            <span className="font-orbitron font-black text-lg tracking-[0.2em] text-machined-titanium">
              ROVIN
            </span>
            <span className="text-[10px] font-mono tracking-widest block text-nitro-amber">
              PRECISION RC & TECH
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 telemetry-tag">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYS: CALIBRATED
          </div>
          <button
            onClick={() => toast.info('Phase 1 Scaffolding Online', { description: 'PERN Stack + Centralized 5-Color System active.' })}
            className="outline-btn text-[11px] py-1.5 px-3"
          >
            Telemetry Ping
          </button>
        </div>
      </header>

      {/* Hero Showcase Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 telemetry-tag mb-4 border-nitro-amber/40 text-nitro-amber">
            <Zap className="w-3.5 h-3.5" />
            PERN MONOREPO • PHASE 1 ONLINE
          </div>
          <h1 className="font-orbitron font-black text-4xl sm:text-5xl lg:text-6xl text-machined-titanium tracking-tight uppercase leading-tight mb-4">
            ENGINEERED FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-nitro-amber to-nitro-orange">HIGH-TORQUE</span> COMMERCE
          </h1>
          <p className="text-machined-muted text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Precision RC Drift & Crawler Cars, Hobby Electronics, and Room Tech tailored for Bangladesh. Built on PostgreSQL, Prisma 6, Express, and React.
          </p>
        </div>

        {/* 5-Color Brand System Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
          <div className="chassis-card p-4 text-center">
            <div className="w-full h-12 rounded bg-nitro-amber mb-3 border border-pitch-obsidian flex items-center justify-center font-mono text-xs text-pitch-obsidian font-bold">
              #FFC837
            </div>
            <p className="font-orbitron text-xs font-bold text-machined-titanium">Nitro Amber</p>
            <p className="text-[11px] text-machined-dim mt-0.5">Primary Accent</p>
          </div>

          <div className="chassis-card p-4 text-center">
            <div className="w-full h-12 rounded bg-carbon-slate mb-3 border border-fastener-gunmetal flex items-center justify-center font-mono text-xs text-machined-muted">
              #0E0F14
            </div>
            <p className="font-orbitron text-xs font-bold text-machined-titanium">Carbon Slate</p>
            <p className="text-[11px] text-machined-dim mt-0.5">Surface Cards</p>
          </div>

          <div className="chassis-card p-4 text-center">
            <div className="w-full h-12 rounded bg-pitch-obsidian mb-3 border border-fastener-gunmetal flex items-center justify-center font-mono text-xs text-machined-dim">
              #07070A
            </div>
            <p className="font-orbitron text-xs font-bold text-machined-titanium">Pitch Obsidian</p>
            <p className="text-[11px] text-machined-dim mt-0.5">Base Chassis</p>
          </div>

          <div className="chassis-card p-4 text-center">
            <div className="w-full h-12 rounded bg-machined-titanium mb-3 border border-fastener-gunmetal flex items-center justify-center font-mono text-xs text-pitch-obsidian font-bold">
              #FFFFFF
            </div>
            <p className="font-orbitron text-xs font-bold text-machined-titanium">Machined White</p>
            <p className="text-[11px] text-machined-dim mt-0.5">High Contrast</p>
          </div>

          <div className="chassis-card p-4 text-center col-span-2 sm:col-span-1">
            <div className="w-full h-12 rounded bg-fastener-gunmetal mb-3 border border-fastener-border flex items-center justify-center font-mono text-xs text-machined-silver">
              #3A4054
            </div>
            <p className="font-orbitron text-xs font-bold text-machined-titanium">Gunmetal</p>
            <p className="text-[11px] text-machined-dim mt-0.5">Hardware Rivets</p>
          </div>
        </div>

        {/* Action Controls & Health Probe */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={testApiHealth}
            disabled={loading}
            className="nitro-btn flex items-center gap-2"
          >
            <Terminal className="w-4 h-4" />
            {loading ? 'Checking Telemetry...' : 'Test Backend Core API'}
          </button>
          <button
            onClick={() => toast('Steadfast & Pathao Courier Gateways Ready', {
              description: 'Unified adapter architecture configured for 1-click dispatch.',
              icon: <Truck className="w-4 h-4 text-nitro-amber" />
            })}
            className="outline-btn flex items-center gap-2"
          >
            <Truck className="w-4 h-4 text-nitro-amber" />
            Courier Gateway Probe
          </button>
        </div>

        {apiStatus && (
          <div className="mt-6 text-center">
            <span className="telemetry-tag border-emerald-500/50 text-emerald-400">
              API TELEMETRY: {apiStatus}
            </span>
          </div>
        )}
      </main>

      {/* Technical Footer */}
      <footer className="border-t border-fastener-border py-4 px-6 text-center text-xs text-machined-dim flex flex-col sm:flex-row items-center justify-between gap-2 bg-pitch-deep">
        <span className="font-mono">ROVIN TACTICAL PLATFORM • PERN MONOREPO V1.0</span>
        <span className="font-mono text-nitro-amber/80">BANGLADESH E-COMMERCE ENGINE</span>
      </footer>
    </div>
  );
}
