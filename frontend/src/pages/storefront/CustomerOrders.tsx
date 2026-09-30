import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  Package,
  Truck,
  ShoppingBag,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  chosenColor?: string;
  chosenSize?: string;
  product: {
    id: string;
    title: string;
    images: string[];
    slug: string;
  };
}

interface CourierConsignment {
  id: string;
  courier: string;
  consignmentId: string;
  trackingCode?: string;
  status: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
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
  consignments: CourierConsignment[];
}

export const CustomerOrders: React.FC = () => {
  usePageTitle('My Orders', 'View and track your ROVIN orders');
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
    }
  }, [isAuthenticated, navigate]);

  const fetchMyOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch {
      toast.error('Failed to retrieve orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyOrders();
    }
  }, [token]);

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to cancel order #${orderNumber}?`)) {
      return;
    }
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Order #${orderNumber} cancelled successfully`);
        fetchMyOrders();
      } else {
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (err: any) {
      toast.error('Network error cancelling order');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="telemetry-tag border-yellow-500/40 text-yellow-500">PENDING CONFIRMATION</span>;
      case 'PROCESSING':
      case 'CONFIRMED':
      case 'PACKED':
        return <span className="telemetry-tag border-blue-500/40 text-blue-400">PROCESSING</span>;
      case 'SHIPPED':
        return <span className="telemetry-tag border-purple-500/40 text-purple-400">SHIPPED / IN TRANSIT</span>;
      case 'DELIVERED':
        return <span className="telemetry-tag border-green-500/40 text-green-400">DELIVERED</span>;
      case 'CANCELLED':
        return <span className="telemetry-tag border-red-500/40 text-red-400">CANCELLED</span>;
      default:
        return <span className="telemetry-tag">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar onOpenAuth={() => {}} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-fastener-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-machined-dim mb-1">
              <Link to="/account" className="hover:text-nitro-amber flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> My Account
              </Link>
              <span>/</span>
              <span className="text-machined-silver">Orders</span>
            </div>
            <h1 className="font-orbitron font-black text-2xl text-machined-titanium flex items-center gap-2.5">
              <Package className="w-6 h-6 text-nitro-amber" />
              MY ORDERS & TRACKING
            </h1>
          </div>

          <Link to="/products" className="outline-btn text-xs py-2 px-4 flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-nitro-amber" /> Browse Products
          </Link>
        </div>

        {/* Content */}
        {loadingOrders ? (
          <div className="chassis-card p-12 text-center text-machined-dim font-mono text-sm">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="chassis-card p-12 text-center border-dashed">
            <Package className="w-14 h-14 text-machined-dim mx-auto mb-3 opacity-40" />
            <h3 className="font-orbitron font-bold text-lg text-machined-titanium mb-2">
              No Orders Found
            </h3>
            <p className="text-xs text-machined-muted max-w-sm mx-auto mb-6">
              You haven't placed any orders yet. Check out our latest products!
            </p>
            <Link to="/products" className="nitro-btn inline-flex items-center gap-2 text-xs py-2.5 px-6">
              <ShoppingBag className="w-4 h-4" /> Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((ord) => {
              const canCancel = ord.orderStatus === 'PENDING';

              return (
                <div key={ord.id} className="chassis-card p-5 hover:border-nitro-amber/40 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fastener-border pb-4 mb-4">
                    <div>
                      <span className="font-mono text-xs text-nitro-amber font-bold block">
                        Order #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] font-mono text-machined-dim">
                        Placed: {new Date(ord.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(ord.orderStatus)}
                      <span className="font-orbitron font-black text-base text-machined-titanium">
                        ৳{ord.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Consignment Live Tracking Banner if available */}
                  {ord.consignments && ord.consignments.length > 0 && (
                    <div className="bg-carbon-elevated border border-nitro-amber/30 rounded p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-nitro-amber animate-pulse" />
                        <span className="font-mono text-xs text-machined-titanium">
                          Courier: <strong className="text-nitro-amber uppercase">{ord.consignments[0].courier}</strong>
                        </span>
                        <span className="telemetry-tag text-[10px]">
                          TRACKING: {ord.consignments[0].trackingCode || ord.consignments[0].consignmentId}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-machined-silver">
                        Status: <span className="text-nitro-amber font-bold">{ord.consignments[0].status}</span>
                      </span>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-3">
                    {ord.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product?.images?.[0] || '/brand/rovin-icon.svg'}
                            alt={item.product?.title || 'Product'}
                            className="w-12 h-12 rounded object-cover border border-fastener-border"
                          />
                          <div>
                            <Link
                              to={`/product/${item.product?.slug}`}
                              className="font-bold text-machined-titanium hover:text-nitro-amber transition-colors line-clamp-1"
                            >
                              {item.product?.title}
                            </Link>
                            <div className="text-[11px] text-machined-dim mt-0.5">
                              Qty: {item.quantity} {item.chosenColor ? `• Color: ${item.chosenColor}` : ''}
                            </div>
                          </div>
                        </div>
                        <span className="font-orbitron text-machined-silver font-semibold">
                          ৳{item.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Destination & Cancel Option */}
                  <div className="mt-4 pt-3 border-t border-fastener-border flex flex-wrap items-center justify-between gap-3 text-[11px] text-machined-dim font-mono">
                    <div>
                      <span>
                        Destination: {ord.deliveryAddress}, {ord.thana}, {ord.district}
                      </span>
                      <span className="ml-3">
                        Payment: {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(ord.id, ord.orderNumber)}
                        disabled={cancellingId === ord.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-mono text-xs transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {cancellingId === ord.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <StorefrontFooter />

      <MobileBottomNav onOpenAuth={() => {}} />
    </div>
  );
};
