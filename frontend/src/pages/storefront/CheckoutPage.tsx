import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { usePageTitle } from '../../hooks/usePageTitle';
import { BrandLogo } from '../../components/brand/BrandLogo';
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
  Mail,
  KeyRound,
  CheckSquare,
  Square,
  Sparkles,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';

const BD_DISTRICTS = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Chittagong', 'Cox\'s Bazar', 'Sylhet',
  'Mymensingh', 'Rajshahi', 'Bogra', 'Khulna', 'Barisal', 'Rangpur',
  'Comilla', 'Brahmanbaria', 'Noakhali', 'Feni', 'Tangail', 'Faridpur',
  'Jessore', 'Kushtia', 'Pabna', 'Dinajpur', 'Other District (All BD Covered)'
];

export const CheckoutPage: React.FC = () => {
  usePageTitle('Fast 1-Page Checkout', 'Frictionless nationwide order placement');
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, token, isAuthenticated, login, sendRegisterOtp, verifyAndRegister } = useAuth();

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

  // Inline Auth State (when user is not yet logged in)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Inline Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGender, setRegGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [regOtp, setRegOtp] = useState('');
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [agreePolicy, setAgreePolicy] = useState(true);

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
      setCustomerName(user.name);
      setCustomerPhone(user.phone);
      setCustomerEmail(user.email);

      // Default address if available
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

  // Inline Quick Login
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    await login(authIdentifier, authPassword);
    setAuthLoading(false);
  };

  // Inline Register Step 1: Send OTP
  const handleInlineSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePolicy) {
      toast.error('Policy Agreement Required', { description: 'Please agree to terms & privacy policy.' });
      return;
    }
    if (regPassword.length < 6) {
      toast.error('Weak Password', { description: 'Password must be at least 6 characters.' });
      return;
    }
    setAuthLoading(true);
    const sent = await sendRegisterOtp(regEmail, regPhone);
    setAuthLoading(false);
    if (sent) setRegStep(2);
  };

  // Inline Register Step 2: Verify & Register
  const handleInlineVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    await verifyAndRegister({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      gender: regGender,
      otp: regOtp,
    });
    setAuthLoading(false);
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      toast.error('Authentication Required', {
        description: 'Please sign in or register above to confirm your order dispatch.',
      });
      return;
    }

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

    if (!deliveryAddress.trim() || !thana.trim()) {
      toast.error('Incomplete Coordinates', { description: 'Please provide full address and thana/area.' });
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
        <StorefrontNavbar />
        <main className="max-w-xl mx-auto px-6 py-20 text-center flex-1 flex flex-col items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-machined-dim mb-4" />
          <h2 className="font-orbitron font-bold text-xl text-machined-titanium uppercase mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-machined-muted font-mono mb-6">
            Explore our collection of gyro-assisted RC drift cars, high-torque crawlers, and machined room decor.
          </p>
          <Link to="/" className="nitro-btn flex items-center gap-2">
            Explore ROVIN Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        {/* Header Telemetry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-fastener-border gap-4">
          <div>
            <div className="flex items-center gap-3">
              <BrandLogo variant="icon" size="sm" />
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
          {/* Left Column: Customer Identification, Address & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Recipient Information & Mandatory Auth Check */}
            <div className="chassis-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-fastener-border">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-nitro-amber" />
                  <h2 className="font-orbitron font-bold text-xs uppercase tracking-wider text-machined-titanium">
                    1. Customer Information & Account
                  </h2>
                </div>
                {isAuthenticated && (
                  <span className="telemetry-tag border-emerald-500/50 text-emerald-400 flex items-center gap-1 text-[10px]">
                    <CheckCircle className="w-3 h-3" /> VERIFIED
                  </span>
                )}
              </div>

              {/* If NOT Authenticated: Show Integrated Tactical Auth Gate */}
              {!isAuthenticated ? (
                <div className="bg-carbon-elevated border border-nitro-amber/40 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded bg-nitro-amber/10 border border-nitro-amber/40 flex items-center justify-center text-nitro-amber flex-shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-sm text-machined-titanium">
                        Please Sign In to Complete Your Order
                      </h3>
                      <p className="text-xs font-mono text-machined-muted mt-0.5">
                        Please sign in or create an account with a 6-digit code. Your cart items are preserved.
                      </p>
                    </div>
                  </div>

                  {/* Tabs: Sign In / Register */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setAuthTab('login')}
                      className={`py-2 text-xs font-orbitron font-bold rounded transition-colors ${
                        authTab === 'login'
                          ? 'bg-nitro-amber text-pitch-obsidian shadow-nitro-sm'
                          : 'bg-carbon-slate text-machined-dim hover:text-machined-titanium border border-fastener-border'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthTab('register')}
                      className={`py-2 text-xs font-orbitron font-bold rounded transition-colors ${
                        authTab === 'register'
                          ? 'bg-nitro-amber text-pitch-obsidian shadow-nitro-sm'
                          : 'bg-carbon-slate text-machined-dim hover:text-machined-titanium border border-fastener-border'
                      }`}
                    >
                      New Account (Sign Up)
                    </button>
                  </div>

                  {authTab === 'login' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                          Email or BD Mobile (01XXXXXXXXX)
                        </label>
                        <input
                          type="text"
                          value={authIdentifier}
                          onChange={(e) => setAuthIdentifier(e.target.value)}
                          placeholder="you@email.com or 017XXXXXXXX"
                          className="w-full bg-carbon-card border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-carbon-card border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleInlineLogin}
                        disabled={authLoading || !authIdentifier || !authPassword}
                        className="nitro-btn w-full text-xs py-2.5 mt-2 flex items-center justify-center gap-2"
                      >
                        {authLoading ? 'Logging In...' : 'Login & Unlock Checkout'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      {regStep === 1 ? (
                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="Sakil Ahmed"
                              className="w-full bg-carbon-card border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                placeholder="you@email.com"
                                className="w-full bg-carbon-card border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                                Mobile Number
                              </label>
                              <input
                                type="tel"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                placeholder="017XXXXXXXX"
                                className="w-full bg-carbon-card border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                                Gender
                              </label>
                              <select
                                value={regGender}
                                onChange={(e) => setRegGender(e.target.value as any)}
                                className="w-full bg-carbon-card border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                              >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                                Password (Min 6)
                              </label>
                              <input
                                type="password"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-carbon-card border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                              />
                            </div>
                          </div>

                          <div
                            onClick={() => setAgreePolicy(!agreePolicy)}
                            className="flex items-center gap-2 pt-1 cursor-pointer select-none"
                          >
                            <div className="text-nitro-amber">
                              {agreePolicy ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-machined-dim" />}
                            </div>
                            <span className="text-[11px] font-mono text-machined-muted">
                              I agree to ROVIN Terms & Privacy Policy
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleInlineSendOtp}
                            disabled={authLoading || !regName || !regEmail || !regPhone || !regPassword}
                            className="nitro-btn w-full text-xs py-2.5 mt-2 flex items-center justify-center gap-2"
                          >
                            {authLoading ? 'Sending OTP...' : 'Send OTP'}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 text-center">
                          <p className="text-xs font-mono text-machined-silver">
                            Verification code sent to <strong>{regEmail}</strong>
                          </p>
                          <input
                            type="text"
                            maxLength={6}
                            value={regOtp}
                            onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full text-center tracking-[0.5em] text-xl font-mono font-bold bg-carbon-card border border-nitro-amber rounded p-2.5 text-nitro-amber outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleInlineVerifyAndRegister}
                            disabled={authLoading || regOtp.length !== 6}
                            className="nitro-btn w-full text-xs py-2.5"
                          >
                            {authLoading ? 'Verifying...' : 'Verify Code & Unlock Checkout'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegStep(1)}
                            className="text-xs font-mono text-machined-dim hover:text-machined-silver"
                          >
                            &larr; Back
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Authenticated User Status & Coordinates preloaded */
                <div className="space-y-4">
                  <div className="bg-carbon-elevated border border-fastener-border rounded p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={user?.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                        alt={user?.name}
                        className="w-9 h-9 rounded-full border border-nitro-amber/70 object-cover"
                      />
                      <div>
                        <p className="font-orbitron font-bold text-xs text-machined-titanium">{user?.name}</p>
                        <p className="text-[11px] font-mono text-machined-dim">{user?.phone} &bull; {user?.email}</p>
                      </div>
                    </div>
                    <span className="telemetry-tag border-nitro-amber/30 text-nitro-amber text-[10px]">
                      {user?.role}
                    </span>
                  </div>

                  {/* Quick Address Selector if user has saved addresses */}
                  {user?.addresses && user.addresses.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1.5">
                        Select Saved Delivery Address
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {user.addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setDistrict(addr.district);
                              setThana(addr.thana);
                              setDeliveryAddress(addr.addressLine);
                              toast.info(`Coordinates applied: ${addr.title}`);
                            }}
                            className={`px-3 py-1.5 rounded text-xs font-mono border transition-all text-left ${
                              deliveryAddress === addr.addressLine
                                ? 'border-nitro-amber bg-nitro-amber/10 text-nitro-amber font-bold'
                                : 'border-fastener-border bg-carbon-elevated text-machined-silver hover:border-machined-titanium'
                            }`}
                          >
                            {addr.title} ({addr.district})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                        Recipient Name <span className="text-nitro-amber">*</span>
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

                    <div>
                      <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                        BD Mobile Phone <span className="text-nitro-amber">*</span>
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
                  </div>
                </div>
              )}
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
                      <option key={d} value={d} className="bg-carbon-card text-machined-titanium">
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
                  required
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House 14, Road 2/A, Block C..."
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3.5 py-2.5 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="chassis-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-fastener-border">
                <CreditCard className="w-4 h-4 text-nitro-amber" />
                <h2 className="font-orbitron font-bold text-xs uppercase tracking-wider text-machined-titanium">
                  3. Payment Protocol
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-nitro-amber bg-nitro-amber/10 shadow-nitro-sm'
                      : 'border-fastener-border bg-carbon-slate hover:border-machined-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-orbitron font-bold text-xs text-machined-titanium">COD</span>
                    {paymentMethod === 'COD' && <CheckCircle className="w-4 h-4 text-nitro-amber" />}
                  </div>
                  <p className="text-[11px] font-mono text-machined-muted">Cash on Delivery</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`p-4 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'BKASH'
                      ? 'border-pink-500 bg-pink-500/10 shadow-nitro-sm'
                      : 'border-fastener-border bg-carbon-slate hover:border-machined-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-orbitron font-bold text-xs text-pink-400">bKash</span>
                    {paymentMethod === 'BKASH' && <CheckCircle className="w-4 h-4 text-pink-400" />}
                  </div>
                  <p className="text-[11px] font-mono text-machined-muted">Mobile Financial Service</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NAGAD')}
                  className={`p-4 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'NAGAD'
                      ? 'border-orange-500 bg-orange-500/10 shadow-nitro-sm'
                      : 'border-fastener-border bg-carbon-slate hover:border-machined-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-orbitron font-bold text-xs text-orange-400">Nagad</span>
                    {paymentMethod === 'NAGAD' && <CheckCircle className="w-4 h-4 text-orange-400" />}
                  </div>
                  <p className="text-[11px] font-mono text-machined-muted">Post Office Digital</p>
                </button>
              </div>

              {paymentMethod === 'COD' && (
                <div className="p-3 bg-carbon-slate border border-fastener-border rounded text-xs font-mono text-machined-silver flex items-start gap-2">
                  <Truck className="w-4 h-4 text-nitro-amber flex-shrink-0 mt-0.5" />
                  <span>
                    Pay with physical cash to the Steadfast / Pathao courier rider upon parcel inspection at your doorstep.
                  </span>
                </div>
              )}

              {paymentMethod === 'BKASH' && (
                <div className="p-3.5 bg-pink-500/5 border border-pink-500/30 rounded text-xs font-mono text-pink-200">
                  <p className="font-bold text-pink-400 mb-1">bKash Merchant Payment Guide:</p>
                  <p className="text-machined-silver">
                    Please send <strong>৳{finalTotal.toLocaleString()}</strong> to Merchant Account:{' '}
                    <span className="text-pink-400 font-bold">{bkashMerchant}</span>. Keep the TrxID handy.
                  </p>
                </div>
              )}

              {paymentMethod === 'NAGAD' && (
                <div className="p-3.5 bg-orange-500/5 border border-orange-500/30 rounded text-xs font-mono text-orange-200">
                  <p className="font-bold text-orange-400 mb-1">Nagad Merchant Payment Guide:</p>
                  <p className="text-machined-silver">
                    Please send <strong>৳{finalTotal.toLocaleString()}</strong> to Merchant Account:{' '}
                    <span className="text-orange-400 font-bold">{nagadMerchant}</span>. Keep the TrxID handy.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="chassis-card p-5 sm:p-6 sticky top-20">
              <h2 className="font-orbitron font-bold text-sm uppercase tracking-wider text-machined-titanium pb-3 border-b border-fastener-border mb-4">
                Cart Summary ({items.length} {items.length === 1 ? 'Unit' : 'Units'})
              </h2>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingBag className="w-8 h-8 text-machined-dim mx-auto mb-2" />
                  <p className="text-xs font-mono text-machined-silver mb-3">Your cart is empty.</p>
                  <Link
                    to="/products"
                    className="nitro-btn text-xs py-2 px-4 inline-flex items-center gap-1.5"
                  >
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.chosenColor || ''}`}
                      className="flex gap-3 text-xs p-2.5 rounded-lg bg-carbon-elevated/50 border border-fastener-border"
                    >
                      <img
                        src={item.image || '/brand/rovin-icon.svg'}
                        alt={item.title}
                        className="w-14 h-14 object-cover rounded border border-fastener-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-semibold text-machined-titanium line-clamp-1">{item.title}</h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId, item.chosenColor)}
                            className="text-machined-dim hover:text-red-400 p-1 -mt-1 -mr-1 rounded transition-colors"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-mono text-machined-dim text-[11px]">
                          ৳{item.price.toLocaleString()}
                          {item.chosenColor && ` • Color: ${item.chosenColor}`}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-fastener-border/60">
                          {/* Quantity Adjuster */}
                          <div className="flex items-center gap-1.5 bg-carbon-card border border-fastener-border rounded px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.chosenColor)}
                              className="text-machined-dim hover:text-machined-titanium p-0.5 transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-xs font-bold text-machined-titanium px-1.5 min-w-[1.25rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.chosenColor)}
                              disabled={item.quantity >= item.stockQuantity}
                              className="text-machined-dim hover:text-machined-titanium p-0.5 transition-colors disabled:opacity-40"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono text-nitro-amber font-bold text-xs">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Engine */}
              <div className="pt-4 mt-4 border-t border-fastener-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="COUPON CODE"
                    disabled={couponApplied}
                    className="flex-1 bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono uppercase text-machined-titanium focus:border-nitro-amber outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim() || couponApplied}
                    className="outline-btn text-xs px-4"
                  >
                    {couponLoading ? '...' : couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Coupon applied (-৳{discountAmount.toLocaleString()})
                  </p>
                )}
              </div>

              {/* Financial Calculation */}
              <div className="pt-4 mt-4 border-t border-fastener-border space-y-2 text-xs font-mono">
                <div className="flex justify-between text-machined-silver">
                  <span>Subtotal:</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-machined-silver">
                  <span>Delivery ({isDhaka ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                  <span>{deliveryCharge === 0 ? <strong className="text-emerald-400">FREE SHIPPING</strong> : `৳${deliveryCharge}`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Voucher:</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-fastener-border flex justify-between items-center text-sm font-bold">
                  <span className="font-orbitron uppercase text-machined-titanium">Total Payable:</span>
                  <span className="font-orbitron text-xl text-nitro-amber">
                    ৳{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Confirmation Button */}
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="nitro-btn w-full text-xs py-3.5 mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading
                  ? 'Processing Order...'
                  : items.length === 0
                  ? 'Cart is Empty'
                  : !isAuthenticated
                  ? 'Login / Register to Complete Order'
                  : 'Confirm Order'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-4 border-t border-fastener-border text-center text-[10px] font-mono text-machined-dim flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quality Inspected • Fast Doorstep Delivery</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <StorefrontFooter />

      <MobileBottomNav />
    </div>
  );
};
