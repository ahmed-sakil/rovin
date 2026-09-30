import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { FileUploadZone } from '../../components/admin/FileUploadZone';
import {
  Sliders,
  Truck,
  CreditCard,
  Save,
  CheckCircle,
  User as UserIcon,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminSettings: React.FC = () => {
  usePageTitle('System Settings & Delivery Rates', 'Configure shipping charges, payment credentials, and operator profile');
  const { user, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(false);
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
        setDhakaRate(data.settings.deliveryChargeInsideDhaka);
        setOutsideRate(data.settings.deliveryChargeOutsideDhaka);
        setFreeShippingThreshold(data.settings.freeShippingThreshold || '');
        setBkashMerchant(data.settings.bkashMerchantNumber || '');
        setNagadMerchant(data.settings.nagadMerchantNumber || '');
        setMaintenanceMode(data.settings.maintenanceMode);
      }
    } catch {
      toast.error('Failed to load system settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
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

      toast.success('System Settings Calibrated', { description: data.message });
    } catch (err: any) {
      toast.error('Update Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="SYSTEM SETTINGS & DELIVERY CHARGES"
      comment="Configure dynamic delivery rates for Bangladesh districts, payment gateway numbers, and operator preferences."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Delivery Charges Box */}
            <div className="chassis-card p-6">
              <div className="flex items-center gap-2 pb-3 border-b border-fastener-border mb-4">
                <Truck className="w-4 h-4 text-nitro-amber" />
                <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                  Bangladesh Delivery Charges (Editable)
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
                    value={dhakaRate}
                    onChange={(e) => setDhakaRate(Number(e.target.value))}
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-sm font-bold text-nitro-amber focus:outline-none focus:border-nitro-amber"
                  />
                  <span className="text-[11px] font-mono text-machined-dim mt-1 block">
                    Applies automatically to Dhaka district addresses
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    Outside Dhaka Delivery (৳)
                  </label>
                  <input
                    type="number"
                    required
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
                  Free Delivery Threshold (৳ Optional)
                </label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 5000 for free shipping on ৳5,000+ orders"
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>
            </div>

            {/* Merchant Payment Numbers */}
            <div className="chassis-card p-6">
              <div className="flex items-center gap-2 pb-3 border-b border-fastener-border mb-4">
                <CreditCard className="w-4 h-4 text-nitro-amber" />
                <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                  MFS Payment Routing
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    bKash Merchant / Personal No.
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
                    Nagad Merchant / Personal No.
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="nitro-btn flex items-center gap-2 py-3 px-6 text-xs"
              >
                <Save className="w-4 h-4" />
                {loading ? 'CALIBRATING...' : 'SAVE SETTINGS & RATES'}
              </button>
            </div>
          </form>
        </div>

        {/* Operator Profile Telemetry Card (1 Col) */}
        <div className="space-y-6">
          <div className="chassis-card p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-fastener-border mb-4">
              <UserIcon className="w-4 h-4 text-nitro-amber" />
              <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                Active Operator Profile
              </h2>
            </div>

            <div className="flex flex-col items-center text-center pb-4 border-b border-fastener-border">
              <img
                src={user?.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                alt={user?.name || 'Operator'}
                className="w-20 h-20 rounded-full border-2 border-nitro-amber bg-carbon-slate p-0.5 object-cover shadow-nitro-sm mb-3"
              />
              <h3 className="font-bold text-base text-machined-titanium">{user?.name || 'ROVIN Commander'}</h3>
              <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber mt-1 text-[10px]">
                CLEARANCE: {user?.role || 'ADMIN'}
              </span>
            </div>

            <div className="space-y-3 pt-4 font-mono text-xs">
              <div className="flex items-center justify-between text-machined-muted">
                <span className="flex items-center gap-1.5 text-machined-dim">
                  <Mail className="w-3.5 h-3.5" /> Email:
                </span>
                <span className="text-machined-silver">{user?.email || 'admin@rovin.com.bd'}</span>
              </div>
              <div className="flex items-center justify-between text-machined-muted">
                <span className="flex items-center gap-1.5 text-machined-dim">
                  <Phone className="w-3.5 h-3.5" /> Phone:
                </span>
                <span className="text-machined-silver">{user?.phone || '01711000000'}</span>
              </div>
            </div>

            {/* Avatar Update via FileUploadZone */}
            <div className="pt-4 mt-4 border-t border-fastener-border">
              <FileUploadZone
                label="Replace Operator Avatar (Instant Metadata)"
                onUploadSuccess={async (url) => {
                  toast.success('Avatar Asset Received', { description: 'Profile image updated.' });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
