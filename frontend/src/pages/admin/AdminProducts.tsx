import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { FileUploadZone, FileMetadata } from '../../components/admin/FileUploadZone';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Package,
  Boxes,
  Edit2,
  Trash2,
  ArrowUpDown,
  Tag,
  DollarSign,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  priceBDT: number;
  costPriceBDT?: number;
  discountPriceBDT?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  availableColors?: Array<{ name: string; hex: string }>;
  availableSizes?: string[];
  weightGrams?: number;
  packageIncludes?: string[];
  specs?: Record<string, string>;
  images: string[];
  isActive: boolean;
  featured: boolean;
  category: { id: string; name: string; slug: string };
  subcategory?: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
}

export const AdminProducts: React.FC = () => {
  usePageTitle('Products & Stock Control', 'Manage precision catalog, variants, and stock levels');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'instock' | 'out'>('all');
  const [sort, setSort] = useState('newest');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [priceBDT, setPriceBDT] = useState<number>(0);
  const [costPriceBDT, setCostPriceBDT] = useState<number | ''>('');
  const [discountPriceBDT, setDiscountPriceBDT] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [colorInput, setColorInput] = useState('');
  const [colorHex, setColorHex] = useState('#FFC837');
  const [colors, setColors] = useState<Array<{ name: string; hex: string }>>([]);
  const [packageItem, setPackageItem] = useState('');
  const [packageIncludes, setPackageIncludes] = useState<string[]>([]);
  const [scale, setScale] = useState('1:16');
  const [motor, setMotor] = useState('Brushless');
  const [topSpeed, setTopSpeed] = useState('45 km/h');
  const [battery, setBattery] = useState('7.4V LiPo');
  const [images, setImages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Fetch Products & Categories
  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      if (catData.success) setCategories(catData.categories);

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (sort) params.append('sort', sort);

      const prodRes = await fetch(`/api/products?${params.toString()}`);
      const prodData = await prodRes.json();
      if (prodData.success) setProducts(prodData.products);
    } catch {
      toast.error('Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, sort]);

  // Handle Quick Stock Adjustments
  const adjustStock = async (productId: string, delta: number) => {
    const token = localStorage.getItem('rovin_token');
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ delta }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stockQuantity: data.product.stockQuantity } : p))
        );
        toast.success(`Stock Updated: ${data.product.sku}`, {
          description: `New quantity: ${data.product.stockQuantity} units`,
        });
      }
    } catch {
      toast.error('Stock adjustment failed');
    }
  };

  // Open Modal for Create or Edit
  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSlug('');
    setSku(`ROV-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setSubcategoryId('');
    setPriceBDT(4500);
    setCostPriceBDT(2500);
    setDiscountPriceBDT('');
    setStockQuantity(10);
    setLowStockThreshold(5);
    setColors([{ name: 'Nitro Amber', hex: '#FFC837' }, { name: 'Stealth Black', hex: '#0E0F14' }]);
    setPackageIncludes(['1x ROVIN Unit', '1x 2.4GHz Controller', '1x Battery Pack']);
    setImages(['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80']);
    setIsActive(true);
    setFeatured(false);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingProduct) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleAddColor = () => {
    if (colorInput.trim()) {
      setColors([...colors, { name: colorInput.trim(), hex: colorHex }]);
      setColorInput('');
    }
  };

  const handleAddPackageItem = () => {
    if (packageItem.trim()) {
      setPackageIncludes([...packageIncludes, packageItem.trim()]);
      setPackageItem('');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('rovin_token');

    const payload = {
      title,
      slug,
      sku,
      description,
      categoryId,
      subcategoryId: subcategoryId || null,
      priceBDT: Number(priceBDT),
      costPriceBDT: costPriceBDT ? Number(costPriceBDT) : null,
      discountPriceBDT: discountPriceBDT ? Number(discountPriceBDT) : null,
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      availableColors: colors,
      packageIncludes,
      specs: { scale, motor, topSpeed, battery },
      images,
      isActive,
      featured,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      toast.success(editingProduct ? 'Product Updated' : 'Product Added to Stock', {
        description: data.message,
      });
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Save Failed', { description: err.message });
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'low') return p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
    if (stockFilter === 'out') return p.stockQuantity <= 0;
    if (stockFilter === 'instock') return p.stockQuantity > 0;
    return true;
  });

  return (
    <AdminLayout
      title="PRODUCT & STOCK LEDGER"
      comment="Calibrate product specifications, manage inventory levels, and register new SKUs."
      action={
        <button onClick={openCreateModal} className="nitro-btn flex items-center gap-2 py-2 px-4 text-xs">
          <Plus className="w-4 h-4" />
          Add New Product SKU
        </button>
      }
    >
      {/* 1. Filter & Search Control Ribbon */}
      <div className="chassis-card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-machined-dim absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, SKU, specs..."
              className="w-full bg-carbon-slate border border-fastener-border rounded pl-9 pr-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e: any) => setStockFilter(e.target.value)}
              className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
            >
              <option value="all">All Inventory States</option>
              <option value="low">⚠️ Low Stock Warnings (≤ 5)</option>
              <option value="out">🛑 Depleted / Out of Stock</option>
              <option value="instock">✅ In Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="stock_asc">Lowest Stock First</option>
              <option value="stock_desc">Highest Stock First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Product Table */}
      <div className="chassis-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-carbon-slate border-b border-fastener-border text-machined-dim uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">SKU / Visual</th>
                <th className="py-3.5 px-4">Product Specs</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (BDT)</th>
                <th className="py-3.5 px-4 text-center">Stock Telemetry</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fastener-border/60">
              {filteredProducts.map((p) => {
                const isLow = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
                const isOut = p.stockQuantity <= 0;
                const margin = p.costPriceBDT ? Math.round(((p.priceBDT - p.costPriceBDT) / p.priceBDT) * 100) : null;

                return (
                  <tr key={p.id} className="hover:bg-carbon-card/70 transition-colors">
                    {/* Visual & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || '/assets/avatars/avatar-m1.svg'}
                          alt={p.title}
                          className="w-12 h-12 rounded bg-carbon-slate border border-fastener-border object-cover flex-shrink-0"
                        />
                        <div>
                          <span className="font-mono text-xs font-bold text-nitro-amber block">{p.sku}</span>
                          <span className="text-[10px] font-mono text-machined-dim">
                            {p.isActive ? 'ACTIVE' : 'DRAFT'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Title & Specs */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-machined-titanium leading-snug line-clamp-1">{p.title}</p>
                      <p className="text-[11px] text-machined-dim line-clamp-1 font-mono mt-0.5">{p.description}</p>
                      {p.availableColors && p.availableColors.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5">
                          {p.availableColors.map((col, idx) => (
                            <span
                              key={idx}
                              className="w-3 h-3 rounded-full border border-pitch-obsidian inline-block"
                              style={{ backgroundColor: col.hex }}
                              title={col.name}
                            />
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="telemetry-tag text-machined-silver border-fastener-gunmetal">
                        {p.category.name}
                      </span>
                    </td>

                    {/* Price & Margin */}
                    <td className="py-3.5 px-4">
                      <div className="font-orbitron font-bold text-sm text-machined-titanium">
                        ৳{p.priceBDT.toLocaleString()}
                      </div>
                      {margin && (
                        <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                          {margin}% Est. Margin
                        </span>
                      )}
                    </td>

                    {/* Stock Telemetry & Controls */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adjustStock(p.id, -1)}
                            disabled={p.stockQuantity <= 0}
                            className="w-6 h-6 rounded bg-carbon-slate border border-fastener-gunmetal text-machined-silver hover:border-nitro-amber flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="font-orbitron font-bold text-sm min-w-8 text-center text-machined-titanium">
                            {p.stockQuantity}
                          </span>
                          <button
                            onClick={() => adjustStock(p.id, 1)}
                            className="w-6 h-6 rounded bg-carbon-slate border border-fastener-gunmetal text-machined-silver hover:border-nitro-amber flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Status Alert Badge */}
                        {isOut ? (
                          <span className="telemetry-tag border-red-500/50 text-red-400 text-[9px] font-bold">
                            OUT OF STOCK
                          </span>
                        ) : isLow ? (
                          <span className="telemetry-tag border-nitro-amber/50 text-nitro-amber text-[9px] font-bold animate-pulse">
                            LOW STOCK (≤{p.lowStockThreshold})
                          </span>
                        ) : (
                          <span className="telemetry-tag border-emerald-500/30 text-emerald-400 text-[9px]">
                            HEALTHY STOCK
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setTitle(p.title);
                            setSlug(p.slug);
                            setSku(p.sku);
                            setDescription(p.description);
                            setCategoryId(p.category.id);
                            setSubcategoryId(p.subcategory?.id || '');
                            setPriceBDT(p.priceBDT);
                            setCostPriceBDT(p.costPriceBDT || '');
                            setDiscountPriceBDT(p.discountPriceBDT || '');
                            setStockQuantity(p.stockQuantity);
                            setLowStockThreshold(p.lowStockThreshold);
                            setColors(p.availableColors || []);
                            setPackageIncludes(p.packageIncludes || []);
                            setImages(p.images || []);
                            setIsActive(p.isActive);
                            setFeatured(p.featured);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-carbon-slate text-machined-dim hover:text-nitro-amber"
                          title="Edit Specifications"
                        >
                          <Edit2 className="w-4 h-4" />
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

      {/* 3. Add / Edit Product Modal with Instant Metadata File Upload */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-obsidian/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-carbon-card border border-fastener-gunmetal rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-fastener-border mb-6">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-nitro-amber"></span>
                <h2 className="font-orbitron font-bold text-base text-machined-titanium uppercase">
                  {editingProduct ? 'Recalibrate Product SKU' : 'Calibrate New Inventory SKU'}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-machined-dim hover:text-machined-titanium">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="ROVIN Apex-16 Gyro Drift Chassis"
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">SKU / Serial Mark</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono text-nitro-amber focus:outline-none focus:border-nitro-amber"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId('');
                    }}
                    required
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Subcategory (Optional)</label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  >
                    <option value="">None / General</option>
                    {categories
                      .find((c) => c.id === categoryId)
                      ?.subcategories.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Financials & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-carbon-slate/50 p-4 rounded-lg border border-fastener-border">
                <div>
                  <label className="block text-[11px] font-mono text-machined-muted uppercase mb-1">Price (BDT ৳)</label>
                  <input
                    type="number"
                    required
                    value={priceBDT}
                    onChange={(e) => setPriceBDT(Number(e.target.value))}
                    className="w-full bg-carbon-card border border-fastener-border rounded px-2.5 py-1.5 text-xs font-bold text-machined-titanium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-machined-muted uppercase mb-1">Cost Price (BDT ৳)</label>
                  <input
                    type="number"
                    value={costPriceBDT}
                    onChange={(e) => setCostPriceBDT(e.target.value ? Number(e.target.value) : '')}
                    placeholder="For margin calc"
                    className="w-full bg-carbon-card border border-fastener-border rounded px-2.5 py-1.5 text-xs text-machined-muted"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-machined-muted uppercase mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-carbon-card border border-fastener-border rounded px-2.5 py-1.5 text-xs font-bold text-nitro-amber"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-machined-muted uppercase mb-1">Low-Stock Alert</label>
                  <input
                    type="number"
                    required
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full bg-carbon-card border border-fastener-border rounded px-2.5 py-1.5 text-xs text-machined-muted"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed mechanical specs, gyro assistance, battery life..."
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>

              {/* Available Colors Configurator */}
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1.5">
                  Available Color Options
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="Color Name (e.g. Nitro Amber)"
                    className="flex-1 bg-carbon-slate border border-fastener-border rounded px-3 py-1.5 text-xs text-machined-titanium"
                  />
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-9 h-8 rounded bg-transparent border border-fastener-border cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="outline-btn text-[11px] py-1.5 px-3"
                  >
                    + Add Color
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-carbon-slate border border-fastener-gunmetal rounded px-2.5 py-1 text-xs font-mono"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      <button
                        type="button"
                        onClick={() => setColors(colors.filter((_, idx) => idx !== i))}
                        className="text-machined-dim hover:text-red-400 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* What's in the Box ("Package Includes") */}
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1.5">
                  Package Contents ("What's in the box")
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={packageItem}
                    onChange={(e) => setPackageItem(e.target.value)}
                    placeholder="e.g. 1x 2.4GHz Transmitter, 2x 7.4V Batteries"
                    className="flex-1 bg-carbon-slate border border-fastener-border rounded px-3 py-1.5 text-xs text-machined-titanium"
                  />
                  <button
                    type="button"
                    onClick={handleAddPackageItem}
                    className="outline-btn text-[11px] py-1.5 px-3"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {packageIncludes.map((item, i) => (
                    <span
                      key={i}
                      className="bg-carbon-slate border border-fastener-border rounded px-2 py-0.5 text-[11px] font-mono text-machined-silver inline-flex items-center gap-1"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => setPackageIncludes(packageIncludes.filter((_, idx) => idx !== i))}
                        className="text-machined-dim hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* File Upload Zone with Instant Metadata Telemetry */}
              <div className="pt-2 border-t border-fastener-border">
                <FileUploadZone
                  label="Upload Product Image (Instant Metadata Extraction)"
                  onUploadSuccess={(url) => {
                    setImages([url, ...images]);
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-fastener-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="outline-btn text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="nitro-btn text-xs py-2 px-6"
                >
                  {editingProduct ? 'Commit Updates' : 'Stock New SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
