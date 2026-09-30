import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  Truck,
  ShieldCheck,
  CreditCard,
  Tag,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Phone,
  User,
  MapPin,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

const BD_DISTRICTS = [
  'Dhaka',
  'Gazipur',
  'Narayanganj',
  'Chittagong',
  'Cox\'s Bazar',
  'Sylhet',
  'Mymensingh',
  'Rajshahi',
  'Bogra',
  'Khulna',
  'Barisal',
  'Rangpur',
  'Comilla',
  'Brahmanbaria',
  'Noakhali',
  'Feni',
  'Tangail',
  'Faridpur',
  'Jessore',
  'Kushtia',
  'Pabna',
  'Dinajpur',
  'Other District (All BD Covered)',
];

export const CheckoutPage: React.FC = () => {
  usePageTitle('Fast 1-Page Checkout', 'Frictionless nationwide order placement');
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD'>('COD');

  // Rates & Settings
  const [dhakaRate, setDhakaRate] = useState(70);
  const [outsideRate, setOutsideRate] = useState(130);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(5000);
  const [bkashMerchant, setBkashMerchant] = useState('01711000000');
  const [nagadMerchant, setNagadMerchant] = useState('01711000000');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  // Load Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setDhakaRate(data.settings.deliveryChargeInsideDhaka);
          setOutsideRate(data.settings.deliveryChargeOutsideDhaka);
          setFreeShippingThreshold(data.settings.freeShippingThreshold);
          setBkashMerchant(data.settings.bkashMerchantNumber || '01711000000');
          setNagadMerchant(data.settings.nagadMerchantNumber || '01711000000');
        }
      } catch {
        // Fallback to defaults
      }
    };
    fetchSettings();
  }, []);

  // Update fields if user logs in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerPhone) setCustomerPhone(user.phone);
      if (!customerEmail) setCustomerEmail(user.email);

      // Default address
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setDistrict(defaultAddr.district);
        setThana(defaultAddr.thana);
        setDeliveryAddress(defaultAddr.addressLine);
      }
    }
  }, [user]);

  // Compute Dynamic Shipping Charge
  const isDhaka = district.trim().toLowerCase() === 'dhaka';
  let deliveryCharge = isDhaka ? dhakaRate : outsideRate;
  if (freeShippingThreshold && subtotal >= freeShippingThreshold) {
    deliveryCharge = 0;
  }

  const finalTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);

    try {
      const res = await fetch('/api/orders/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid coupon');

      setDiscountAmount(data.discountAmount);
      setCouponApplied(true);
      toast.success('Coupon Applied', { description: data.message });
    } catch (err: any) {
      toast.error('Coupon Error', { description: err.message });
      setDiscountAmount(0);
      setCouponApplied(false);
    } finally {
      setCouponLoading(false);
    }
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Cart Empty', { description: 'Select at least one product before checking out.' });
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(customerPhone.trim())) {
      toast.error('Invalid Phone Number', {
        description: 'Enter a valid 11-digit Bangladesh phone (e.g. 017XXXXXXXX).',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customerName,
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        district,
        thana,
        deliveryAddress,
        paymentMethod,
        couponCode: couponApplied ? couponCode : undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          chosenColor: i.chosenColor,
          chosenSize: i.chosenSize,
        })),
      };

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order placement failed');

      clearCart();
      toast.success('Order Placed Successfully!', {
        description: `Order #${data.order.orderNumber} confirmed.`,
      });
      navigate(`/order-success/${data.order.orderNumber}`);
    } catch (err: any) {
      toast.error('Checkout Error', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
        <StorefrontNavbar onOpenAuth={() => {}} />
        <main className="max-w-xl mx-auto px-6 py-20 text-center flex-1 flex flex-col items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-machined-dim mb-4" />
          <h2 className="font-orbitron font-bold text-xl text-machined-titanium uppercase mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-machined-muted font-mono mb-6">
            Explore our collection of gyro-assisted RC drift cars, high-torque crawlers, and machined room decor.
          </p>
          <Link to="/products" className="nitro-btn text-xs py-3 px-6">
            Explore ROVIN Catalog
          </Link>
        </main>
        <MobileBottomNav onOpenAuth={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar onOpenAuth={() => {}} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Checkout Header Ribbon */}
        <div className="flex items-center justify-between pb-4 border-b border-fastener-border mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-nitro-amber shadow-nitro-sm"></span>
              <h1 className="font-orbitron font-black text-xl sm:text-2xl text-machined-titanium uppercase">
                FAST 1-PAGE CHECKOUT
              </h1>
            </div>
            <p className="text-xs text-machined-muted font-mono mt-1">
              Nationwide delivery across all 64 Bangladesh districts &bull; Cash on Delivery &bull; bKash / Nagad
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 telemetry-tag text-emerald-400 border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-BIT ENCRYPTED
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer Details, Address & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer Identification */}
            <div className="chassis-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-fastener-border">
                <User className="w-4 h-4 text-nitro-amber" />
                <h2 className="font-orbitron font-bold text-xs uppercase tracking-wider text-machined-titanium">
                  1. Recipient Information
                </h2>
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                  Full Name <span className="text-nitro-amber">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Sakil Ahmed"
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3.5 py-2.5 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    BD Mobile Phone (01XXXXXXXXX) <span className="text-nitro-amber">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01711223344"
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3.5 py-2.5 text-xs font-mono text-nitro-amber focus:outline-none focus:border-nitro-amber"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="pilot@domain.com"
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3.5 py-2.5 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address & Auto Rate Calculation */}
            <div className="chassis-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-fastener-border">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-nitro-amber" />
                  <h2 className="font-orbitron font-bold text-xs uppercase tracking-wider text-machined-titanium">
                    2. Delivery Location
                  </h2>
                </div>
                <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber text-[10px]">
                  {isDhaka ? `DHAKA (৳${dhakaRate})` : `OUTSIDE DHAKA (৳${outsideRate})`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    District <span className="text-nitro-amber">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3.5 py-2.5 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d} {d === 'Dhaka' ? `(Inside Dhaka: ৳${dhakaRate})` : `(৳${outsideRate})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    Thana / Upazila / Police Station <span className="text-nitro-amber">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    placeholder="e.g. Dhanmondi, Uttara, Panchlaish"
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3.5 py-2.5 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                  Detailed Address (House, Road, Area, Landmarks) <span className="text-nitro-amber">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House 12, Road 4, Sector 7, Near North Tower"
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3.5 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="chassis-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-fastener-border">
                <CreditCard className="w-4 h-4 text-nitro-amber" />
                <h2 className="font-orbitron font-bold text-xs uppercase tracking-wider text-machined-titanium">
                  3. Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-nitro-amber bg-carbon-slate shadow-nitro-sm'
                      : 'border-fastener-border bg-carbon-card/50 hover:border-machined-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-orbitron font-bold text-xs text-machined-titanium">COD</span>
                    <Truck className="w-4 h-4 text-nitro-amber" />
                  </div>
                  <p className="text-[11px] font-mono text-machined-dim leading-snug">
                    Pay cash upon delivery to courier rider. Zero upfront charge.
                  </p>
                </div>

                {/* bKash */}
                <div
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === 'BKASH'
                      ? 'border-nitro-amber bg-carbon-slate shadow-nitro-sm'
                      : 'border-fastener-border bg-carbon-card/50 hover:border-machined-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-orbitron font-bold text-xs text-pink-400">bKash</span>
                    <span className="text-[10px] font-mono text-nitro-amber">MFS</span>
                  </div>
                  <p className="text-[11px] font-mono text-machined-dim leading-snug">
                    Send Money / Merchant payment to <code className="text-pink-400">{bkashMerchant}</code>
                  </p>
                </div>

                {/* Nagad */}
                <div
                  onClick={() => setPaymentMethod('NAGAD')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === 'NAGAD'
                      ? 'border-nitro-amber bg-carbon-slate shadow-nitro-sm'
                      : 'border-fastener-border bg-carbon-card/50 hover:border-machined-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-orbitron font-bold text-xs text-orange-400">Nagad</span>
                    <span className="text-[10px] font-mono text-nitro-amber">MFS</span>
                  </div>
                  <p className="text-[11px] font-mono text-machined-dim leading-snug">
                    Send Money / Merchant payment to <code className="text-orange-400">{nagadMerchant}</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Placement (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="chassis-card p-5 sm:p-6 sticky top-20">
              <h2 className="font-orbitron font-bold text-xs uppercase tracking-wider text-machined-titanium pb-3 border-b border-fastener-border mb-4">
                Order Manifest ({items.length} Items)
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-4 divide-y divide-fastener-border/50">
                {items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded bg-carbon-slate border border-fastener-border object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-machined-titanium truncate leading-tight">{item.title}</p>
                      <span className="text-[10px] font-mono text-machined-dim block">
                        {item.chosenColor ? `Color: ${item.chosenColor}` : item.sku}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.chosenColor)}
                          className="w-4 h-4 rounded bg-carbon-slate border border-fastener-gunmetal flex items-center justify-center font-bold text-[10px]"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold text-nitro-amber">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.chosenColor)}
                          className="w-4 h-4 rounded bg-carbon-slate border border-fastener-gunmetal flex items-center justify-center font-bold text-[10px]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="font-orbitron font-bold text-machined-titanium">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <div className="pt-3 border-t border-fastener-border mb-4">
                <label className="block text-[11px] font-mono text-machined-muted uppercase mb-1">
                  Promotional Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    disabled={couponApplied}
                    className="flex-1 bg-carbon-slate border border-fastener-border rounded px-3 py-1.5 text-xs font-mono uppercase text-nitro-amber"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || couponApplied || !couponCode.trim()}
                    className="outline-btn text-[11px] py-1.5 px-3"
                  >
                    {couponApplied ? 'Applied' : couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2 pt-3 border-t border-fastener-border text-xs font-mono">
                <div className="flex justify-between text-machined-muted">
                  <span>Subtotal</span>
                  <span className="text-machined-silver">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-machined-muted">
                  <span>Delivery ({isDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                  <span className={deliveryCharge === 0 ? 'text-emerald-400 font-bold' : 'text-machined-silver'}>
                    {deliveryCharge === 0 ? 'FREE' : `৳${deliveryCharge}`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-orbitron font-bold text-machined-titanium pt-2 border-t border-fastener-border">
                  <span>Total Payable</span>
                  <span className="text-nitro-amber text-base">৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full nitro-btn mt-6 py-3.5 text-sm flex items-center justify-center gap-2 shadow-nitro"
              >
                {loading ? (
                  'COMMITTING ORDER...'
                ) : (
                  <>
                    <span>CONFIRM & PLACE ORDER &bull; ৳{finalTotal.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-3 text-center text-[10px] font-mono text-machined-dim flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Steadfast & Pathao parcel protection included</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <footer className="border-t border-fastener-border py-6 px-6 text-center text-xs text-machined-dim bg-pitch-deep">
        <span className="font-mono">ROVIN BANGLADESH &bull; PRECISION TELEMETRY PROTOCOL</span>
      </footer>

      <MobileBottomNav onOpenAuth={() => {}} />
    </div>
  );
};
