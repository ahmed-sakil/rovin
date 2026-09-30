import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  Truck,
  CreditCard,
  Save,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettingsState {
  dhakaRate: number;
  outsideRate: number;
  freeShippingThreshold: number | '';
  bkashMerchant: string;
  nagadMerchant: string;
  maintenanceMode: boolean;
}

export const AdminSettings: React.FC = () => {
  usePageTitle('System Settings & Delivery Rates', 'Configure shipping charges, payment credentials, and store controls');

  const [loading, setLoading] = useState(false);
  const [initialSettings, setInitialSettings] = useState<SystemSettingsState | null>(null);

  const [dhakaRate, setDhakaRate] = useState(70);
  const [outsideRate, setOutsideRate] = useState(130);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | ''>(5000);
  const [bkashMerchant, setBkashMerchant] = useState('01711000000');
  const [nagadMerchant, setNagadMerchant] = useState('01711000000');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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
        };
        setDhakaRate(loaded.dhakaRate);
        setOutsideRate(loaded.outsideRate);
        setFreeShippingThreshold(loaded.freeShippingThreshold);
        setBkashMerchant(loaded.bkashMerchant);
        setNagadMerchant(loaded.nagadMerchant);
        setMaintenanceMode(loaded.maintenanceMode);
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
    maintenanceMode !== initialSettings.maintenanceMode
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');

      setInitialSettings({
        dhakaRate: Number(dhakaRate),
        outsideRate: Number(outsideRate),
        freeShippingThreshold,
        bkashMerchant,
        nagadMerchant,
        maintenanceMode,
      });

      toast.success('Settings Saved Successfully', { description: data.message });
    } catch (err: any) {
      toast.error('Update Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="SYSTEM SETTINGS & DELIVERY CHARGES"
      comment="Configure delivery fees across Bangladesh districts, MFS merchant numbers, and store controls."
    >
      <div className="max-w-4xl space-y-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
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
                <span className="text-[11px] font-mono text-machined-dim mt-1 block">
                  Applies automatically to Dhaka city & district
                </span>
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
                <span className="text-[11px] font-mono text-machined-dim mt-1 block">
                  Applies to all other 63 Bangladesh districts
                </span>
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
                placeholder="e.g. 5000 for free delivery on orders ৳5,000+"
                className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
              />
              <span className="text-[11px] font-mono text-machined-dim mt-1 block">
                Leave empty or 0 to charge delivery on all orders
              </span>
            </div>
          </div>

          {/* Merchant Payment Numbers */}
          <div className="chassis-card p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-fastener-border mb-4">
              <CreditCard className="w-4 h-4 text-nitro-amber" />
              <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                bKash & Nagad Payment Numbers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                  bKash Merchant / Personal Number
                </label>
                <input
                  type="text"
                  value={bkashMerchant}
                  onChange={(e) => setBkashMerchant(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
                <span className="text-[11px] font-mono text-machined-dim mt-1 block">
                  Shown to customers during bKash manual checkout
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                  Nagad Merchant / Personal Number
                </label>
                <input
                  type="text"
                  value={nagadMerchant}
                  onChange={(e) => setNagadMerchant(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
                <span className="text-[11px] font-mono text-machined-dim mt-1 block">
                  Shown to customers during Nagad manual checkout
                </span>
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
              {loading ? 'SAVING...' : 'SAVE SETTINGS & RATES'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
