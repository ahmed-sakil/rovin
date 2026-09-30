import React from 'react';
import { X, Filter, RotateCcw, Check } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  categoryId: string;
  inStockOnly: boolean;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  categories,
  filters,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  if (!isOpen) return null;

  const setField = (field: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-obsidian/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="chassis-card w-full max-w-lg p-6 bg-carbon-card border-nitro-amber/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-fastener-border mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-nitro-amber" />
            <h2 className="font-orbitron font-bold text-base text-machined-titanium uppercase">
              Filter Equipment Hangar
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-machined-dim hover:text-machined-titanium p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-machined-muted mb-2">
              Price Range (BDT)
            </label>
            <div className="grid grid-cols-2 gap-3 mb-2.5">
              <div>
                <span className="text-[10px] font-mono text-machined-dim block mb-1">MIN PRICE</span>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-machined-dim">৳</span>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setField('minPrice', e.target.value)}
                    placeholder="0"
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 pl-7 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-machined-dim block mb-1">MAX PRICE</span>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-machined-dim">৳</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setField('maxPrice', e.target.value)}
                    placeholder="25000"
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 pl-7 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Price Presets */}
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => { setField('minPrice', ''); setField('maxPrice', '3000'); }}
                className="px-2.5 py-1 rounded bg-carbon-elevated border border-fastener-border hover:border-nitro-amber text-machined-silver"
              >
                &lt; ৳3,000
              </button>
              <button
                type="button"
                onClick={() => { setField('minPrice', '3000'); setField('maxPrice', '6000'); }}
                className="px-2.5 py-1 rounded bg-carbon-elevated border border-fastener-border hover:border-nitro-amber text-machined-silver"
              >
                ৳3,000 - ৳6,000
              </button>
              <button
                type="button"
                onClick={() => { setField('minPrice', '6000'); setField('maxPrice', ''); }}
                className="px-2.5 py-1 rounded bg-carbon-elevated border border-fastener-border hover:border-nitro-amber text-machined-silver"
              >
                &gt; ৳6,000
              </button>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-machined-muted mb-2">
              Chassis & Hardware Category
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setField('categoryId', '')}
                className={`flex items-center justify-between p-2 rounded border text-xs font-orbitron text-left transition-colors ${
                  filters.categoryId === ''
                    ? 'border-nitro-amber bg-nitro-amber/10 text-nitro-amber font-bold'
                    : 'border-fastener-border bg-carbon-elevated text-machined-silver hover:border-machined-titanium'
                }`}
              >
                <span>All Categories</span>
                {filters.categoryId === '' && <Check className="w-3.5 h-3.5" />}
              </button>

              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setField('categoryId', c.id)}
                  className={`flex items-center justify-between p-2 rounded border text-xs font-orbitron text-left transition-colors truncate ${
                    filters.categoryId === c.id
                      ? 'border-nitro-amber bg-nitro-amber/10 text-nitro-amber font-bold'
                      : 'border-fastener-border bg-carbon-elevated text-machined-silver hover:border-machined-titanium'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {filters.categoryId === c.id && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-machined-muted mb-2">
              Telemetry Sort Order
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {[
                { value: 'newest', label: 'Newest Arrivals' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'name_asc', label: 'Alphabetical A-Z' },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setField('sortBy', s.value)}
                  className={`p-2.5 rounded border text-left flex items-center justify-between transition-colors ${
                    filters.sortBy === s.value
                      ? 'border-nitro-amber bg-nitro-amber/10 text-nitro-amber font-bold'
                      : 'border-fastener-border bg-carbon-elevated text-machined-silver hover:border-machined-titanium'
                  }`}
                >
                  <span>{s.label}</span>
                  {filters.sortBy === s.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* In-Stock Only */}
          <div className="pt-2">
            <label
              onClick={() => setField('inStockOnly', !filters.inStockOnly)}
              className="flex items-center gap-3 p-3 rounded-lg border border-fastener-border bg-carbon-elevated cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => setField('inStockOnly', e.target.checked)}
                className="w-4 h-4 text-nitro-amber rounded border-fastener-border bg-carbon-card focus:ring-nitro-amber"
              />
              <div>
                <span className="font-orbitron font-bold text-xs text-machined-titanium block">
                  Show In-Stock Hardware Only
                </span>
                <span className="text-[11px] font-mono text-machined-dim">
                  Exclude depleted chassis awaiting next shipment
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-fastener-border">
          <button
            type="button"
            onClick={onReset}
            className="outline-btn text-xs py-2.5 px-4 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>

          <button
            type="button"
            onClick={onClose}
            className="nitro-btn text-xs py-2.5 px-6 shadow-nitro"
          >
            Apply ({totalResults} Units Available)
          </button>
        </div>
      </div>
    </div>
  );
};
