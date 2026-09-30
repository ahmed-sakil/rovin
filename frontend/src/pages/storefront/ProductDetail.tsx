import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
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
  Star,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<{ total: number; averageRating: number }>({
    total: 0,
    averageRating: 5.0,
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  usePageTitle(product?.title || 'Product Specifications', 'ROVIN Hangar');

  const fetchReviews = async (productIdOrSlug: string) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/products/${productIdOrSlug}/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) setReviewStats(data.stats);
      }
    } catch {
      // quiet fail for reviews
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetch(`/api/products/${slug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.product) {
            setProduct(d.product);
            if (d.product.availableColors?.[0]) {
              setSelectedColor(d.product.availableColors[0].name);
              if (d.product.availableColors[0].image) {
                setSelectedImage(d.product.availableColors[0].image);
              } else {
                setSelectedImage(d.product.images[0] || '/assets/avatars/avatar-m1.svg');
              }
            } else {
              setSelectedImage(d.product.images[0] || '/assets/avatars/avatar-m1.svg');
            }
            fetchReviews(d.product.id);
          }
        })
        .catch(() => toast.error('Could not load product specs'))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !product) {
      toast.error('Authentication Required', { description: 'Please login to submit field reports.' });
      return;
    }
    if (!newReviewComment.trim()) {
      toast.error('Review Required', { description: 'Please provide detailed telemetry feedback.' });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: newRating,
          title: newReviewTitle.trim() || undefined,
          comment: newReviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');

      toast.success('Field Report Transmitted', {
        description: 'Thank you for calibrating telemetry for the pilot crew!',
      });
      setShowReviewModal(false);
      setNewReviewTitle('');
      setNewReviewComment('');
      setNewRating(5);
      fetchReviews(product.id);
    } catch (err: any) {
      toast.error('Review Submission Failed', { description: err.message });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
        <StorefrontNavbar />
        <main className="max-w-4xl mx-auto px-6 py-20 text-center flex-1 text-xs font-mono text-machined-muted">
          CALIBRATING PRODUCT TELEMETRY...
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
        <StorefrontNavbar />
        <main className="max-w-4xl mx-auto px-6 py-20 text-center flex-1">
          <h2 className="font-orbitron font-bold text-xl text-machined-titanium mb-4">PRODUCT NOT LOCATED</h2>
          <Link to="/products" className="nitro-btn text-xs py-2 px-4">Return to Catalog</Link>
        </main>
        <MobileBottomNav />
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
      <StorefrontNavbar />

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
                  Select Color
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {product.availableColors.map((col: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedColor(col.name);
                        if (col.image) {
                          setSelectedImage(col.image);
                        }
                      }}
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
                  <ShoppingBag className="w-4 h-4 text-nitro-amber" /> Add to Cart
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full nitro-btn py-3.5 text-xs font-bold tracking-widest"
              >
                PROCEED TO CHECKOUT (৳{(displayPrice * quantity).toLocaleString()})
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
                  Technical Specifications
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

        {/* SECTION: CUSTOMER REVIEWS & RATINGS */}
        <div className="mt-12 pt-8 border-t border-fastener-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-nitro-amber" />
                <h2 className="font-orbitron font-black text-xl text-machined-titanium uppercase tracking-wider">
                  Customer Reviews & Ratings
                </h2>
              </div>
              <p className="text-xs font-mono text-machined-dim">
                Real feedback, quality ratings, and impressions from verified buyers.
              </p>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate(`/login?redirect=/product/${slug}`);
                } else {
                  setShowReviewModal(true);
                }
              }}
              className="nitro-btn text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <Star className="w-4 h-4" /> Write a Review
            </button>
          </div>

          {/* Rating Summary Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="chassis-card p-6 flex flex-col items-center justify-center text-center border-nitro-amber/30">
              <span className="font-orbitron font-black text-4xl text-nitro-amber mb-1">
                {reviewStats.total > 0 ? reviewStats.averageRating.toFixed(1) : '5.0'}
              </span>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(reviewStats.averageRating || 5)
                        ? 'text-nitro-amber fill-nitro-amber'
                        : 'text-machined-dim'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-machined-muted">
                Based on {reviewStats.total} {reviewStats.total === 1 ? 'customer review' : 'customer reviews'}
              </span>
            </div>

            <div className="chassis-card p-6 md:col-span-2 flex flex-col justify-center space-y-2">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="w-20 text-machined-silver">Performance</span>
                <div className="flex-1 h-2 bg-carbon-slate rounded-full overflow-hidden">
                  <div className="h-full bg-nitro-amber rounded-full" style={{ width: '96%' }} />
                </div>
                <span className="text-nitro-amber font-bold">4.9</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="w-20 text-machined-silver">Durability</span>
                <div className="flex-1 h-2 bg-carbon-slate rounded-full overflow-hidden">
                  <div className="h-full bg-nitro-amber rounded-full" style={{ width: '92%' }} />
                </div>
                <span className="text-nitro-amber font-bold">4.8</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="w-20 text-machined-silver">Build Quality</span>
                <div className="flex-1 h-2 bg-carbon-slate rounded-full overflow-hidden">
                  <div className="h-full bg-nitro-amber rounded-full" style={{ width: '98%' }} />
                </div>
                <span className="text-nitro-amber font-bold">5.0</span>
              </div>
            </div>
          </div>

          {/* Reviews Stream */}
          {loadingReviews ? (
            <div className="chassis-card p-8 text-center text-xs font-mono text-machined-dim">
              Loading customer reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="chassis-card p-8 text-center">
              <MessageSquare className="w-8 h-8 text-machined-dim mx-auto mb-2 opacity-50" />
              <p className="text-xs font-mono text-machined-muted mb-3">
                No customer reviews for this product yet.
              </p>
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate(`/login?redirect=/product/${slug}`);
                  else setShowReviewModal(true);
                }}
                className="outline-btn text-xs py-2 px-4"
              >
                Be the first to review this product
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev: any) => (
                <div key={rev.id} className="chassis-card p-5 border-fastener-border">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.user?.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                        alt={rev.user?.name || 'Pilot'}
                        className="w-8 h-8 rounded-full border border-nitro-amber/50 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-orbitron font-bold text-xs text-machined-titanium">
                            {rev.user?.name || 'Pilot'}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span className="telemetry-tag border-emerald-500/40 text-emerald-400 text-[9px] py-0.5 px-1.5 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> VERIFIED OWNER
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-machined-dim">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'text-nitro-amber fill-nitro-amber' : 'text-machined-dim'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.title && (
                    <h4 className="font-orbitron font-semibold text-xs text-machined-titanium mb-1">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-xs text-machined-muted leading-relaxed font-mono">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Write a Review */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-obsidian/85 backdrop-blur-md">
            <div className="bg-carbon-card border border-nitro-amber/40 rounded-xl max-w-md w-full p-6 relative shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-fastener-border mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-nitro-amber" />
                  <h3 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                    Submit Field Report
                  </h3>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-machined-dim hover:text-machined-titanium text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1.5">
                    Rating Evaluation
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating
                              ? 'text-nitro-amber fill-nitro-amber'
                              : 'text-machined-dim'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="font-orbitron text-xs text-nitro-amber font-bold ml-2">
                      {newRating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1.5">
                    Headline / Summary (Optional)
                  </label>
                  <input
                    type="text"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    placeholder="e.g. Unbelievable counter-steer control on carpet"
                    className="w-full bg-carbon-slate border border-fastener-border rounded p-2.5 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1.5">
                    Your Review / Feedback
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Share your experience regarding performance, build quality, and durability..."
                    className="w-full bg-carbon-slate border border-fastener-border rounded p-2.5 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 outline-btn text-xs py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 nitro-btn text-xs py-2.5"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <StorefrontFooter />

      <MobileBottomNav />
    </div>
  );
};
