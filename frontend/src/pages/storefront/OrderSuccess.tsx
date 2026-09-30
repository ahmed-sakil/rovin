import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { usePageTitle } from '../../hooks/usePageTitle';
import { CheckCircle, Truck, Package, Phone, ArrowRight, ShieldCheck, Home } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  usePageTitle(`Order #${orderNumber || ''} Confirmed`, 'ROVIN Order Telemetry');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderNumber) {
      fetch(`/api/orders/track/${orderNumber}`)
        .then((r) => r.json())
        .then((d) => d.success && setOrder(d.order))
        .catch(() => {});
    }
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full text-center">
        <div className="chassis-card p-6 sm:p-10 border-nitro-amber/50">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>

          <span className="telemetry-tag border-emerald-500/40 text-emerald-400 text-xs mb-2">
            TELEMETRY CONFIRMED &bull; ORDER LOCKED
          </span>

          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium uppercase mb-2">
            ORDER TRANSMISSION RECEIVED
          </h1>

          <p className="text-xs text-machined-muted font-mono mb-6">
            Your high-torque gear has been assigned to our logistics dispatch queue.
          </p>

          <div className="bg-carbon-slate rounded-lg p-5 border border-fastener-border text-left font-mono text-xs space-y-3 mb-6">
            <div className="flex justify-between pb-2 border-b border-fastener-border">
              <span className="text-machined-dim uppercase">Order Reference:</span>
              <span className="font-bold text-nitro-amber text-sm">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-machined-dim">Recipient:</span>
              <span className="text-machined-silver font-semibold">{order?.customerName || 'Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-machined-dim">Contact Phone:</span>
              <span className="text-machined-silver">{order?.customerPhone || '01XXXXXXXXX'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-machined-dim">Destination:</span>
              <span className="text-machined-silver">{order?.district || 'Bangladesh'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-fastener-border text-sm">
              <span className="text-machined-dim">Amount to Collect:</span>
              <span className="font-orbitron font-bold text-nitro-amber">
                ৳{(order?.totalAmount || 0).toLocaleString()} (COD)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/products" className="outline-btn text-xs py-3 flex items-center justify-center gap-2">
              <Package className="w-4 h-4" /> Explore More Gear
            </Link>
            <Link to="/" className="nitro-btn text-xs py-3 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Return to Hangar
            </Link>
          </div>
        </div>
      </main>

      <StorefrontFooter />

      <MobileBottomNav />
    </div>
  );
};
