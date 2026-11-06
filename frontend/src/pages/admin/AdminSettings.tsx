import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useFonts } from '../../context/FontContext';
import {
  Truck,
  CreditCard,
  Save,
  AlertTriangle,
  Info,
  Type,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettingsState {
  dhakaRate: number;
  outsideRate: number;
  freeShippingThreshold: number | '';
  bkashMerchant: string;
  nagadMerchant: string;
  maintenanceMode: boolean;
  fontHeading: string;
  fontBody: string;
}

export const AdminSettings: React.FC = () => {
  usePageTitle('System Settings', 'Store configuration, shipping fees, payment numbers, and typography');

  const { availableHeadingFonts, availableBodyFonts, setFonts: setGlobalFonts } = useFonts();

  const [loading, setLoading] = useState(false);
  const [initialSettings, setInitialSettings] = useState<SystemSettingsState | null>(null);

  const [dhakaRate, setDhakaRate] = useState(70);
  const [outsideRate, setOutsideRate] = useState(130);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | ''>(5000);
  const [bkashMerchant, setBkashMerchant] = useState('01711000000');
  const [nagadMerchant, setNagadMerchant] = useState('01711000000');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [fontHeading, setFontHeading] = useState('Plus Jakarta Sans');
  const [fontBody, setFontBody] = useState('Inter');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const loaded: SystemSettingsState = {
          dhakaRate: Number(data.settings.deliveryChargeInsideDhaka) || 70,
          outsideRate: Number(data.settings.deliveryChargeOutsideDhaka) || 130,
          freeShippingThreshold: data.settings.freeShippingThreshold ? Number(data.settings.freeShippingThreshold) : '',
          bkashMerchant: data.settings.bkashMerchantNumber || '',
          nagadMerchant: data.settings.nagadMerchantNumber || '',
          maintenanceMode: Boolean(data.settings.maintenanceMode),
          fontHeading: data.settings.fontHeading || 'Plus Jakarta Sans',
          fontBody: data.settings.fontBody || 'Inter',
        };
        setDhakaRate(loaded.dhakaRate);
        setOutsideRate(loaded.outsideRate);
        setFreeShippingThreshold(loaded.freeShippingThreshold);
        setBkashMerchant(loaded.bkashMerchant);
        setNagadMerchant(loaded.nagadMerchant);
        setMaintenanceMode(loaded.maintenanceMode);
        setFontHeading(loaded.fontHeading);
        setFontBody(loaded.fontBody);
        setInitialSettings(loaded);
      }
    } catch {
      toast.error('Failed to load system settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const isDirty = initialSettings !== null && (
    dhakaRate !== initialSettings.dhakaRate ||
    outsideRate !== initialSettings.outsideRate ||
    freeShippingThreshold !== initialSettings.freeShippingThreshold ||
    bkashMerchant !== initialSettings.bkashMerchant ||
    nagadMerchant !== initialSettings.nagadMerchant ||
    maintenanceMode !== initialSettings.maintenanceMode ||
    fontHeading !== initialSettings.fontHeading ||
    fontBody !== initialSettings.fontBody
  );

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    setLoading(true);
    const token = localStorage.getItem('rovin_token');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          deliveryChargeInsideDhaka: Number(dhakaRate),
          deliveryChargeOutsideDhaka: Number(outsideRate),
          freeShippingThreshold: freeShippingThreshold ? Number(freeShippingThreshold) : null,
          bkashMerchantNumber: bkashMerchant,
          nagadMerchantNumber: nagadMerchant,
          maintenanceMode,
          fontHeading,
          fontBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');

      // Update local context for instant visual change across entire site
      setGlobalFonts(fontHeading, fontBody);

      setInitialSettings({
        dhakaRate: Number(dhakaRate),
        outsideRate: Number(outsideRate),
        freeShippingThreshold,
        bkashMerchant,
        nagadMerchant,
        maintenanceMode,
        fontHeading,
        fontBody,
      });

      toast.success('Settings Saved Successfully', { description: data.message });
    } catch (err: any) {
      toast.error('Update Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="System Settings">
      <div className="max-w-4xl space-y-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Typography & Fonts Configuration */}
          <div className="chassis-card p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-fastener-border mb-4">
              <Type className="w-4 h-4 text-nitro-amber" />
              <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                Typography & Storefront Fonts
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1.5 font-bold">
                  Heading / Title Font
                </label>
                <select
                  value={fontHeading}
                  onChange={(e) => setFontHeading(e.target.value)}
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2.5 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                >
                  {availableHeadingFonts.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-machined-dim mt-1.5">
                  {availableHeadingFonts.find((f) => f.name === fontHeading)?.description}
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1.5 font-bold">
                  Body / Text Font
                </label>
                <select
                  value={fontBody}
                  onChange={(e) => setFontBody(e.target.value)}
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2.5 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                >
                  {availableBodyFonts.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-machined-dim mt-1.5">
                  {availableBodyFonts.find((f) => f.name === fontBody)?.description}
                </p>
              </div>
            </div>

            {/* Live Typography Preview Card */}
            <div className="p-4 rounded-lg bg-carbon-slate/60 border border-fastener-border/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-nitro-amber uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Live Typography Preview
              </div>
              <h3
                style={{ fontFamily: `'${fontHeading}', sans-serif` }}
                className="text-lg font-bold text-machined-titanium"
              >
                ROVIN High-Torque Precision RC Series
              </h3>
              <p
                style={{ fontFamily: `'${fontBody}', sans-serif` }}
                className="text-xs text-machined-silver leading-relaxed"
              >
                Engineered for maximum grip, responsive steering gyro, and seamless track performance across Bangladesh.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span
                  style={{ fontFamily: `'${fontHeading}', sans-serif` }}
                  className="text-sm font-bold text-nitro-amber"
                >
                  ৳18,500
                </span>
                <span
                  style={{ fontFamily: `'${fontBody}', sans-serif` }}
                  className="text-[11px] px-2.5 py-1 rounded bg-carbon-elevated text-machined-muted"
                >
                  In Stock (12 Units)
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Charges Box */}
          <div className="chassis-card p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-fastener-border mb-4">
              <Truck className="w-4 h-4 text-nitro-amber" />
              <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                Bangladesh Delivery Charges
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                  Inside Dhaka Delivery (৳)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={dhakaRate}
                  onChange={(e) => setDhakaRate(Number(e.target.value))}
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-sm font-bold text-nitro-amber focus:outline-none focus:border-nitro-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                  Outside Dhaka Delivery (৳)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={outsideRate}
                  onChange={(e) => setOutsideRate(Number(e.target.value))}
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-sm font-bold text-nitro-amber focus:outline-none focus:border-nitro-amber"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                Free Delivery Minimum Order (৳ Optional)
              </label>
              <input
                type="number"
                min={0}
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 5000"
                className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
              />
            </div>
          </div>

          {/* Personal Payment Numbers */}
          <div className="chassis-card p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-fastener-border mb-4">
              <CreditCard className="w-4 h-4 text-nitro-amber" />
              <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                bKash & Nagad Payment Numbers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                  bKash Personal Number
                </label>
                <input
                  type="text"
                  value={bkashMerchant}
                  onChange={(e) => setBkashMerchant(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                  Nagad Personal Number
                </label>
                <input
                  type="text"
                  value={nagadMerchant}
                  onChange={(e) => setNagadMerchant(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>
            </div>
          </div>

          {/* Store Status / Maintenance Controls */}
          <div className="chassis-card p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-fastener-border mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                Store Operations & Maintenance
              </h2>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-carbon-slate/50 border border-fastener-border">
              <div>
                <span className="text-sm font-semibold text-machined-titanium block">
                  Maintenance Mode
                </span>
                <span className="text-xs text-machined-dim font-mono">
                  When enabled, storefront visitors will see a maintenance notice and cannot place new orders.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-carbon-slate peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nitro-amber"></div>
              </label>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs font-mono text-machined-dim flex items-center gap-1.5">
              {isDirty ? (
                <span className="text-nitro-amber font-semibold">● Changes detected — ready to save</span>
              ) : (
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> No changes detected
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!isDirty || loading}
              className={`flex items-center gap-2 py-3 px-6 text-xs font-orbitron font-bold tracking-wider uppercase transition-all rounded ${
                isDirty && !loading
                  ? 'bg-nitro-amber text-pitch-obsidian shadow-nitro-md hover:bg-amber-400 cursor-pointer active:scale-95'
                  : 'bg-carbon-slate text-machined-dim border border-fastener-border cursor-not-allowed opacity-50'
              }`}
            >
              <Save className="w-4 h-4" />
              {loading ? 'SAVING...' : 'SAVE SETTINGS'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
