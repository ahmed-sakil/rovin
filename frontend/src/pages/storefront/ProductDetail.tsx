import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { useCart } from '../../context/CartContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  CheckCircle,
  Package,
  Layers,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  usePageTitle(product?.title || 'Product Specifications', 'ROVIN Hangar');

  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetch(`/api/products/${slug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.product) {
            setProduct(d.product);
            setSelectedImage(d.product.images[0] || '/assets/avatars/avatar-m1.svg');
            if (d.product.availableColors?.[0]) {
              setSelectedColor(d.product.availableColors[0].name);
            }
          }
        })
        .catch(() => toast.error('Could not load product specs'))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
        <StorefrontNavbar onOpenAuth={() => {}} />
        <main className="max-w-4xl mx-auto px-6 py-20 text-center flex-1 text-xs font-mono text-machined-muted">
          CALIBRATING PRODUCT TELEMETRY...
        </main>
        <MobileBottomNav onOpenAuth={() => {}} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
        <StorefrontNavbar onOpenAuth={() => {}} />
        <main className="max-w-4xl mx-auto px-6 py-20 text-center flex-1">
          <h2 className="font-orbitron font-bold text-xl text-machined-titanium mb-4">PRODUCT NOT LOCATED</h2>
          <Link to="/products" className="nitro-btn text-xs py-2 px-4">Return to Catalog</Link>
        </main>
        <MobileBottomNav onOpenAuth={() => {}} />
      </div>
    );
  }

  const displayPrice = product.discountPriceBDT || product.priceBDT;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar onOpenAuth={() => {}} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-machined-dim hover:text-nitro-amber mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-carbon-slate border border-fastener-border rounded-xl overflow-hidden relative shadow-chassis">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 telemetry-tag border-pitch-obsidian/80 bg-pitch-obsidian/90 text-nitro-amber text-[10px] font-bold">
                {product.category?.name}
              </span>
            </div>

            {/* Thumbnail row */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-lg bg-carbon-card border overflow-hidden flex-shrink-0 transition-all ${
                      selectedImage === img ? 'border-nitro-amber ring-1 ring-nitro-amber' : 'border-fastener-border opacity-70'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Specifications & CTA */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-mono text-xs text-nitro-amber font-bold tracking-wider">{product.sku}</span>
                {isLowStock ? (
                  <span className="telemetry-tag border-red-500/50 text-red-400 text-[10px] font-bold animate-pulse">
                    CRITICAL: ONLY {product.stockQuantity} UNITS IN WAREHOUSE
                  </span>
                ) : (
                  <span className="telemetry-tag border-emerald-500/40 text-emerald-400 text-[10px]">
                    IN STOCK ({product.stockQuantity} UNITS)
                  </span>
                )}
              </div>

              <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium uppercase leading-tight mb-3">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-orbitron font-black text-3xl text-nitro-amber">
                  ৳{displayPrice.toLocaleString()}
                </span>
                {product.discountPriceBDT && (
                  <span className="font-mono text-sm text-machined-dim line-through">
                    ৳{product.priceBDT.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-machined-muted font-mono leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Variant Selector */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="p-4 rounded-lg bg-carbon-card border border-fastener-border space-y-2">
                <span className="text-xs font-mono text-machined-dim uppercase tracking-wider block">
                  Select Color Finishes
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {product.availableColors.map((col: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(col.name)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-all ${
                        selectedColor === col.name
                          ? 'border-nitro-amber bg-carbon-slate text-nitro-amber font-bold shadow-nitro-sm'
                          : 'border-fastener-border bg-carbon-slate/50 text-machined-silver hover:border-machined-muted'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.hex }} />
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-fastener-gunmetal rounded bg-carbon-card">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 text-machined-silver hover:text-nitro-amber flex items-center justify-center font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-orbitron font-bold text-sm text-machined-titanium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="w-9 h-9 text-machined-silver hover:text-nitro-amber flex items-center justify-center font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, quantity, selectedColor)}
                  className="flex-1 outline-btn py-3 text-xs flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-nitro-amber" /> Add to Manifest
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full nitro-btn py-3.5 text-xs font-bold tracking-widest shadow-nitro"
              >
                PROCEED TO 1-PAGE CHECKOUT (৳{(displayPrice * quantity).toLocaleString()})
              </button>
            </div>

            {/* What's in the Box */}
            {product.packageIncludes && product.packageIncludes.length > 0 && (
              <div className="chassis-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-machined-titanium uppercase">
                  <Package className="w-4 h-4 text-nitro-amber" />
                  What's in the Box (Standard Kit)
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono text-machined-muted pt-1">
                  {product.packageIncludes.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-nitro-amber flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Specs Grid */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="chassis-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-machined-titanium uppercase">
                  <Layers className="w-4 h-4 text-nitro-amber" />
                  Telemetry Specifications
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  {Object.entries(product.specs).map(([key, val]: any, idx) => (
                    <div key={idx} className="bg-carbon-slate/60 p-2 rounded border border-fastener-border">
                      <span className="text-[10px] text-machined-dim uppercase block">{key}</span>
                      <span className="text-machined-silver font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-fastener-border py-6 px-6 text-center text-xs text-machined-dim bg-pitch-deep">
        <span className="font-mono">ROVIN BANGLADESH &bull; PRECISION TELEMETRY PROTOCOL</span>
      </footer>

      <MobileBottomNav onOpenAuth={() => {}} />
    </div>
  );
};
