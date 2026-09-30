import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { ProductCard, ProductItem } from '../../components/product/ProductCard';
import { FilterModal, FilterState } from '../../components/catalog/FilterModal';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  Search,
  Filter,
  ShoppingBag,
  SlidersHorizontal,
  X,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export const ProductCatalog: React.FC = () => {
  usePageTitle('All Equipment Catalog', 'Precision RC drift cars, crawlers, and tech decor');
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Search input
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    categoryId: searchParams.get('categoryId') || '',
    inStockOnly: searchParams.get('inStock') === 'true',
    sortBy: (searchParams.get('sortBy') as any) || 'newest',
  });

  // Load Categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => d.success && setCategories(d.categories))
      .catch(() => {});
  }, []);

  // Fetch Products based on all filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (filters.categoryId) params.append('categoryId', filters.categoryId);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let prods: ProductItem[] = data.products;

        // In-memory filter for price and stock
        if (filters.minPrice) {
          const min = parseFloat(filters.minPrice);
          if (!isNaN(min)) prods = prods.filter((p) => p.priceBDT >= min);
        }
        if (filters.maxPrice) {
          const max = parseFloat(filters.maxPrice);
          if (!isNaN(max)) prods = prods.filter((p) => p.priceBDT <= max);
        }
        if (filters.inStockOnly) {
          prods = prods.filter((p) => p.stockQuantity > 0);
        }

        // Sorting
        if (filters.sortBy === 'price_asc') {
          prods.sort((a, b) => a.priceBDT - b.priceBDT);
        } else if (filters.sortBy === 'price_desc') {
          prods.sort((a, b) => b.priceBDT - a.priceBDT);
        } else if (filters.sortBy === 'name_asc') {
          prods.sort((a, b) => a.title.localeCompare(b.title));
        }

        setProducts(prods);
      }
    } catch {
      toast.error('Catalog Loading Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filters]);

  // Calculate active filter count
  let activeFilterCount = 0;
  if (filters.minPrice || filters.maxPrice) activeFilterCount++;
  if (filters.categoryId) activeFilterCount++;
  if (filters.inStockOnly) activeFilterCount++;
  if (filters.sortBy !== 'newest') activeFilterCount++;

  const handleResetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      categoryId: '',
      inStockOnly: false,
      sortBy: 'newest',
    });
    setSearchTerm('');
  };

  const selectedCategoryName = categories.find((c) => c.id === filters.categoryId)?.name;

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0 transition-colors">
      <StorefrontNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Top Header & Telemetry */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-fastener-border mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandLogo variant="icon" size="sm" />
              <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium uppercase">
                ALL EQUIPMENT CATALOG
              </h1>
            </div>
            <p className="text-xs text-machined-muted font-mono mt-1">
              Browse the complete ROVIN precision RC hangar, crawlers, desk sculptures, and telemetry accessories.
            </p>
          </div>

          {/* Search Bar & Filter Modal Trigger */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-machined-dim absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search gear, scale, motor..."
                className="w-full bg-carbon-card border border-fastener-border rounded pl-9 pr-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber font-mono"
              />
            </div>

            <button
              onClick={() => setFilterModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded border text-xs font-orbitron font-bold transition-all whitespace-nowrap ${
                activeFilterCount > 0
                  ? 'border-nitro-amber bg-nitro-amber/15 text-nitro-amber shadow-nitro-sm'
                  : 'border-fastener-border bg-carbon-card text-machined-silver hover:border-machined-titanium'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-nitro-amber text-pitch-obsidian font-mono text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Category Chips Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar font-orbitron text-xs">
          <button
            onClick={() => setFilters({ ...filters, categoryId: '' })}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all uppercase tracking-wider font-bold ${
              filters.categoryId === ''
                ? 'bg-nitro-amber text-pitch-obsidian shadow-nitro-sm'
                : 'bg-carbon-card border border-fastener-border text-machined-silver hover:border-machined-titanium'
            }`}
          >
            All Hardware
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilters({ ...filters, categoryId: c.id })}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all uppercase tracking-wider font-semibold ${
                filters.categoryId === c.id
                  ? 'bg-nitro-amber text-pitch-obsidian shadow-nitro-sm font-bold'
                  : 'bg-carbon-card border border-fastener-border text-machined-silver hover:border-machined-titanium'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Active Filters Badges Indicator */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-2.5 rounded bg-carbon-slate border border-fastener-border text-xs font-mono">
            <span className="text-machined-dim uppercase text-[10px]">Active Filters:</span>

            {selectedCategoryName && (
              <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber flex items-center gap-1">
                Cat: {selectedCategoryName}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-400"
                  onClick={() => setFilters({ ...filters, categoryId: '' })}
                />
              </span>
            )}

            {(filters.minPrice || filters.maxPrice) && (
              <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber flex items-center gap-1">
                Price: ৳{filters.minPrice || '0'} - ৳{filters.maxPrice || 'MAX'}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-400"
                  onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
                />
              </span>
            )}

            {filters.inStockOnly && (
              <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber flex items-center gap-1">
                In-Stock Only
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-400"
                  onClick={() => setFilters({ ...filters, inStockOnly: false })}
                />
              </span>
            )}

            {filters.sortBy !== 'newest' && (
              <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber flex items-center gap-1">
                Sort: {filters.sortBy.replace('_', ' ').toUpperCase()}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-400"
                  onClick={() => setFilters({ ...filters, sortBy: 'newest' })}
                />
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-machined-dim hover:text-red-400 ml-auto flex items-center gap-1 text-[11px] underline"
            >
              <RotateCcw className="w-3 h-3" /> Clear All
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6 text-xs font-mono text-machined-dim">
          <span>
            Displaying <strong className="text-machined-titanium">{products.length}</strong> equipment units
          </span>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="chassis-card p-16 text-center text-machined-dim font-mono text-sm">
            Scanning Hangar Inventory Telemetry...
          </div>
        ) : products.length === 0 ? (
          <div className="chassis-card p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-machined-dim mx-auto mb-3 opacity-50" />
            <h3 className="font-orbitron font-bold text-base text-machined-titanium uppercase mb-1">
              No Equipment Matches Found
            </h3>
            <p className="text-xs text-machined-muted font-mono mb-6">
              Try adjusting your price parameters, search terms, or category filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="outline-btn text-xs py-2 px-5"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      {/* Filter Modal Dialog */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        categories={categories}
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        totalResults={products.length}
      />

      {/* Unified Public Footer */}
      <StorefrontFooter />

      <MobileBottomNav />
    </div>
  );
};
