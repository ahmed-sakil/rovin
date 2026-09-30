import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ThermalShippingLabel } from '../../components/admin/ThermalShippingLabel';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  ShoppingBag,
  Truck,
  Printer,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  X,
  Phone,
  DollarSign,
  RefreshCw,
  Send,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  chosenColor?: string;
  product: { title: string; sku: string; images: string[] };
}

interface Consignment {
  id: string;
  courierProvider: string;
  consignmentId: string;
  trackingCode: string;
  status: string;
  labelPrinted: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  district: string;
  thana: string;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  orderItems: OrderItem[];
  consignments: Consignment[];
}

export const AdminOrders: React.FC = () => {
  usePageTitle('Orders & Courier Fulfillment', 'Dispatch parcels and manage delivery pipeline');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);

  // Dispatch Form State
  const [dispatchProvider, setDispatchProvider] = useState<'STEADFAST' | 'PATHAO' | 'MANUAL'>('STEADFAST');
  const [dispatchNote, setDispatchNote] = useState('ROVIN Precision Gear. Handle with care.');
  const [dispatchLoading, setDispatchLoading] = useState(false);

  // Admin Manual Control / Fallback State
  const [apiError, setApiError] = useState<string | null>(null);
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [manualCourier, setManualCourier] = useState('STEADFAST');
  const [manualConsignmentId, setManualConsignmentId] = useState('');
  const [manualTrackingCode, setManualTrackingCode] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('rovin_token');

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/orders?${params.toString()}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  // Open Dispatch Modal
  const openDispatchModal = (order: Order) => {
    setSelectedOrderForDispatch(order);
    setApiError(null);
    setShowManualOverride(false);
    setManualConsignmentId(`MAN-${Math.floor(100000 + Math.random() * 900000)}`);
    setManualTrackingCode(`TRACK-${order.orderNumber}`);
  };

  // Execute Dispatch via API
  const handleDispatch = async () => {
    if (!selectedOrderForDispatch) return;
    setDispatchLoading(true);
    setApiError(null);
    const token = localStorage.getItem('rovin_token');

    try {
      const res = await fetch(`/api/orders/${selectedOrderForDispatch.id}/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          provider: dispatchProvider,
          note: dispatchNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Third-party API failure! Capture error and give admin manual control
        setApiError(data.error || data.message || 'Third-Party Courier Gateway unreachable.');
        setShowManualOverride(true);
        toast.error('Third-Party API Error', {
          description: data.message || 'Courier API encountered a transmission fault. Manual override enabled.',
        });
        return;
      }

      toast.success('Courier Parcel Dispatched', {
        description: `${dispatchProvider} Consignment: ${data.consignment.consignmentId}`,
      });

      setSelectedOrderForDispatch(null);
      fetchOrders();
    } catch (err: any) {
      setApiError(`Network / Connection Error: ${err.message}`);
      setShowManualOverride(true);
      toast.error('Dispatch Network Fault', { description: 'Enable manual override to continue.' });
    } finally {
      setDispatchLoading(false);
    }
  };

  // Submit Manual Consignment Override
  const handleManualOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDispatch) return;
    setDispatchLoading(true);
    const token = localStorage.getItem('rovin_token');

    try {
      const res = await fetch(`/api/orders/${selectedOrderForDispatch.id}/manual-consignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          courierProvider: manualCourier,
          consignmentId: manualConsignmentId,
          trackingCode: manualTrackingCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Manual override failed');

      toast.success('Manual Consignment Locked', {
        description: `Order marked as SHIPPED with tracking code: ${manualTrackingCode}`,
      });

      setSelectedOrderForDispatch(null);
      fetchOrders();
    } catch (err: any) {
      toast.error('Manual Override Error', { description: err.message });
    } finally {
      setDispatchLoading(false);
    }
  };

  // Update Status Manually
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('rovin_token');
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status Calibrated: ${newStatus}`);
        fetchOrders();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout
      title="ORDERS & COURIER FULFILLMENT"
      comment="1-Click courier dispatch to Steadfast & Pathao, emergency manual API override, and 4x6 thermal shipping labels."
      action={
        <button onClick={fetchOrders} className="outline-btn text-xs py-2 px-3 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Manifest
        </button>
      }
    >
      {/* 1. Filter Tabs & Search Bar */}
      <div className="chassis-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto font-orbitron text-xs">
            {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold uppercase text-[11px] ${
                  statusFilter === st
                    ? 'bg-nitro-amber text-pitch-obsidian font-bold shadow-nitro-sm'
                    : 'bg-carbon-slate text-machined-dim hover:text-machined-silver'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-machined-dim absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order #, phone..."
              className="w-full bg-carbon-slate border border-fastener-border rounded pl-9 pr-3 py-1.5 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
            />
          </div>
        </div>
      </div>

      {/* 2. Orders Table */}
      <div className="chassis-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-carbon-slate border-b border-fastener-border text-machined-dim uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Manifest</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Total (BDT)</th>
                <th className="py-3 px-4">Status & Courier</th>
                <th className="py-3 px-4 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fastener-border/60">
              {orders.map((o) => {
                const latestConsignment = o.consignments?.[0];
                const isDispatched = o.orderStatus === 'SHIPPED' || o.orderStatus === 'DELIVERED';

                return (
                  <tr key={o.id} className="hover:bg-carbon-card/70 transition-colors">
                    {/* Order Reference */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-nitro-amber block">
                        {o.orderNumber}
                      </span>
                      <span className="text-[10px] font-mono text-machined-dim">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-machined-titanium leading-tight">{o.customerName}</p>
                      <p className="font-mono text-xs text-machined-silver mt-0.5">📞 {o.customerPhone}</p>
                      <span className="text-[11px] text-machined-dim font-mono block truncate">
                        {o.thana}, {o.district}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {o.orderItems.map((item, i) => (
                          <div key={i} className="text-xs font-mono text-machined-silver truncate max-w-xs">
                            {item.product.title} <span className="text-nitro-amber">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4">
                      <div className="font-orbitron font-bold text-sm text-machined-titanium">
                        ৳{o.totalAmount.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-mono text-machined-dim uppercase block">
                        {o.paymentMethod}
                      </span>
                    </td>

                    {/* Status & Consignment */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-carbon-slate border border-fastener-border rounded px-2 py-0.5 text-[11px] font-mono text-machined-silver focus:outline-none focus:border-nitro-amber"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PACKED">PACKED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>

                        {latestConsignment && (
                          <div className="text-[10px] font-mono text-nitro-amber block">
                            [{latestConsignment.courierProvider}] #{latestConsignment.consignmentId}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1-Click Dispatch Button */}
                        {!isDispatched ? (
                          <button
                            onClick={() => openDispatchModal(o)}
                            className="nitro-btn text-[11px] py-1.5 px-3 flex items-center gap-1.5"
                            title="Dispatch to Courier"
                          >
                            <Truck className="w-3.5 h-3.5" /> Dispatch
                          </button>
                        ) : (
                          <button
                            onClick={() => openDispatchModal(o)}
                            className="outline-btn text-[10px] py-1 px-2 text-machined-muted"
                            title="Modify Consignment / Manual Override"
                          >
                            <Edit className="w-3 h-3" /> Edit Courier
                          </button>
                        )}

                        {/* Print 4x6 Thermal Label Button */}
                        <button
                          onClick={() => setSelectedOrderForLabel(o)}
                          className="p-1.5 rounded bg-carbon-slate border border-fastener-gunmetal text-machined-silver hover:text-nitro-amber hover:border-nitro-amber transition-colors"
                          title="Print 4x6 Thermal Shipping Label"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Dispatch to Courier Modal with Third-Party Error Control & Manual Override */}
      {selectedOrderForDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-obsidian/85 backdrop-blur-md">
          <div className="bg-carbon-card border border-fastener-gunmetal rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-fastener-border mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-nitro-amber" />
                <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                  Dispatch Order #{selectedOrderForDispatch.orderNumber}
                </h2>
              </div>
              <button onClick={() => setSelectedOrderForDispatch(null)} className="text-machined-dim p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Third-Party API Failure Alert Banner */}
            {apiError && (
              <div className="mb-4 p-3 rounded bg-red-950/40 border border-red-500/60 text-xs font-mono text-red-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-400">
                  <ShieldAlert className="w-4 h-4" /> Third-Party Courier Alert:
                </div>
                <p className="leading-snug">{apiError}</p>
                <p className="text-[10px] text-machined-dim pt-1">
                  You have full admin control below to manually assign a consignment or use an in-house rider.
                </p>
              </div>
            )}

            {/* Mode A: Automated Courier API Dispatch */}
            {!showManualOverride ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1.5">
                    Select Automated Courier Provider
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDispatchProvider('STEADFAST')}
                      className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                        dispatchProvider === 'STEADFAST'
                          ? 'border-nitro-amber bg-carbon-slate text-nitro-amber font-bold shadow-nitro-sm'
                          : 'border-fastener-border bg-carbon-slate/50 text-machined-dim'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>STEADFAST</span>
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] text-machined-dim block mt-0.5">Nationwide Hub Network</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDispatchProvider('PATHAO')}
                      className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                        dispatchProvider === 'PATHAO'
                          ? 'border-nitro-amber bg-carbon-slate text-nitro-amber font-bold shadow-nitro-sm'
                          : 'border-fastener-border bg-carbon-slate/50 text-machined-dim'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>PATHAO</span>
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] text-machined-dim block mt-0.5">Metro & Express Zones</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    Courier Delivery Note / Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={dispatchNote}
                    onChange={(e) => setDispatchNote(e.target.value)}
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  />
                </div>

                <div className="bg-carbon-slate p-3 rounded border border-fastener-border text-xs font-mono space-y-1">
                  <div className="flex justify-between text-machined-muted">
                    <span>COD Collection:</span>
                    <span className="text-nitro-amber font-bold">
                      ৳{selectedOrderForDispatch.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-machined-muted">
                    <span>Delivery Location:</span>
                    <span className="text-machined-silver">
                      {selectedOrderForDispatch.thana}, {selectedOrderForDispatch.district}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-fastener-border">
                  <button
                    type="button"
                    onClick={() => setShowManualOverride(true)}
                    className="text-[11px] font-mono text-nitro-amber hover:underline flex items-center gap-1"
                  >
                    Switch to Manual Override &rarr;
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForDispatch(null)}
                      className="outline-btn text-xs py-2 px-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDispatch}
                      disabled={dispatchLoading}
                      className="nitro-btn text-xs py-2 px-5 flex items-center gap-1.5"
                    >
                      {dispatchLoading ? 'TRANSMITTING...' : 'DISPATCH TO COURIER'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Mode B: Emergency Admin Manual Consignment Override */
              <form onSubmit={handleManualOverrideSubmit} className="space-y-4">
                <div className="p-3 bg-nitro-amber/10 border border-nitro-amber/40 rounded text-xs font-mono text-nitro-amber mb-2">
                  <span className="font-bold block">Manual Consignment Mode</span>
                  Use this to input a tracking number from phone dispatch, custom rider, or during third-party courier downtime.
                </div>

                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    Courier Provider Name
                  </label>
                  <select
                    value={manualCourier}
                    onChange={(e) => setManualCourier(e.target.value)}
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium"
                  >
                    <option value="STEADFAST">Steadfast Courier</option>
                    <option value="PATHAO">Pathao Logistics</option>
                    <option value="REDX">RedX Express</option>
                    <option value="PAPERFLY">Paperfly</option>
                    <option value="IN_HOUSE">ROVIN In-House Rider</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                      Consignment ID <span className="text-nitro-amber">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={manualConsignmentId}
                      onChange={(e) => setManualConsignmentId(e.target.value)}
                      className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono text-nitro-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                      Tracking Code <span className="text-nitro-amber">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={manualTrackingCode}
                      onChange={(e) => setManualTrackingCode(e.target.value)}
                      className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono text-machined-silver"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-fastener-border">
                  <button
                    type="button"
                    onClick={() => setShowManualOverride(false)}
                    className="text-[11px] font-mono text-machined-dim hover:underline"
                  >
                    &larr; Back to Automated API
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForDispatch(null)}
                      className="outline-btn text-xs py-2 px-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={dispatchLoading}
                      className="nitro-btn text-xs py-2 px-5"
                    >
                      {dispatchLoading ? 'SAVING...' : 'SAVE MANUAL CONSIGNMENT'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. 4x6 Thermal Shipping Label Print Dialog */}
      {selectedOrderForLabel && (
        <ThermalShippingLabel
          order={selectedOrderForLabel}
          consignment={selectedOrderForLabel.consignments?.[0]}
          onClose={() => setSelectedOrderForLabel(null)}
          onMarkPrinted={() => {
            const token = localStorage.getItem('rovin_token');
            fetch(`/api/orders/${selectedOrderForLabel.id}/label-printed`, {
              method: 'POST',
              headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            }).catch(() => {});
          }}
        />
      )}
    </AdminLayout>
  );
};
