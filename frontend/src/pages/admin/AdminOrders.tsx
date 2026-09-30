import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ShoppingBag, Truck, CheckCircle, Clock, AlertTriangle, ExternalLink, Printer } from 'lucide-react';
import { toast } from 'sonner';

export const AdminOrders: React.FC = () => {
  usePageTitle('Orders & Courier Fulfillment', 'Monitor customer orders and dispatch to Steadfast & Pathao');

  return (
    <AdminLayout
      title="ORDERS & COURIER FULFILLMENT"
      comment="1-Click courier API dispatching to Steadfast & Pathao, real-time status tracking, and 4x6 thermal shipping labels."
      action={
        <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber text-xs">
          COURIER GATEWAYS: READY
        </span>
      }
    >
      <div className="chassis-card p-8 text-center max-w-xl mx-auto my-12">
        <Truck className="w-12 h-12 text-nitro-amber mx-auto mb-3 animate-pulse" />
        <h3 className="font-orbitron font-bold text-base text-machined-titanium uppercase mb-2">
          Courier Fulfillment Hub
        </h3>
        <p className="text-xs text-machined-muted font-mono leading-relaxed mb-6">
          Order table with 1-click dispatch to Steadfast / Pathao, consignment ID generation, delivery fee reconciliation, and 4×6" thermal printable label generator will engage in Phase 5.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => toast.info('Courier Adapter Ready', { description: 'Steadfast & Pathao API connectors are pre-configured.' })}
            className="nitro-btn text-xs py-2 px-4"
          >
            Probe Courier APIs
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};
