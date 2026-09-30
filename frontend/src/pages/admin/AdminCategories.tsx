import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import { FileUploadZone } from '../../components/admin/FileUploadZone';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Layers,
  CheckCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  subcategories: Array<{ id: string; name: string; slug: string; isActive: boolean }>;
  _count?: { products: number };
}

export const AdminCategories: React.FC = () => {
  usePageTitle('Dynamic Taxonomies', 'Configure categories, subcategories, and hierarchy');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Subcategory Modal
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setCatName(val);
    setCatSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSubNameChange = (val: string) => {
    setSubName(val);
    setSubSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('rovin_token');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: catName,
          slug: catSlug,
          description: catDesc,
          imageUrl: catImage || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create category');

      toast.success('Category Added to Database', { description: `${data.category.name}` });
      setCatModalOpen(false);
      setCatName('');
      setCatSlug('');
      setCatDesc('');
      setCatImage('');
      fetchCategories();
    } catch (err: any) {
      toast.error('Creation Failed', { description: err.message });
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('rovin_token');

    try {
      const res = await fetch('/api/categories/subcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          categoryId: selectedParentId,
          name: subName,
          slug: subSlug,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create subcategory');

      toast.success('Subcategory Created', { description: `${data.subcategory.name}` });
      setSubModalOpen(false);
      setSubName('');
      setSubSlug('');
      fetchCategories();
    } catch (err: any) {
      toast.error('Creation Failed', { description: err.message });
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove '${name}' and its subcategories?`)) return;
    const token = localStorage.getItem('rovin_token');

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success) {
        toast.info('Category Removed', { description: name });
        fetchCategories();
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleDeleteSubcategory = async (id: string, name: string) => {
    const token = localStorage.getItem('rovin_token');
    try {
      const res = await fetch(`/api/categories/subcategories/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success) {
        toast.info('Subcategory Removed', { description: name });
        fetchCategories();
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminLayout
      title="DYNAMIC TAXONOMY & CATEGORIES"
      comment="Non-hardcoded category architecture with subcategories, metadata, and product counts."
      action={
        <button
          onClick={() => setCatModalOpen(true)}
          className="nitro-btn flex items-center gap-2 py-2 px-4 text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Root Category
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="chassis-card p-5 flex flex-col justify-between">
            <div>
              {/* Category Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-carbon-slate border border-fastener-border flex items-center justify-center text-nitro-amber">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-sm text-machined-titanium">
                      {cat.name}
                    </h3>
                    <span className="font-mono text-[10px] text-machined-dim block">
                      slug: <span className="text-nitro-amber">{cat.slug}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber text-[10px]">
                    {cat._count?.products || 0} PRODUCTS
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="text-machined-dim hover:text-red-400 p-1"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {cat.description && (
                <p className="text-xs text-machined-muted font-mono mb-4 leading-relaxed">
                  {cat.description}
                </p>
              )}

              {/* Subcategories Ribbon */}
              <div className="bg-carbon-slate/70 rounded-lg p-3 border border-fastener-border/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-machined-dim uppercase tracking-wider">
                    Child Subcategories ({cat.subcategories.length})
                  </span>
                  <button
                    onClick={() => {
                      setSelectedParentId(cat.id);
                      setSubModalOpen(true);
                    }}
                    className="text-[11px] font-mono text-nitro-amber hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Subcategory
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.length > 0 ? (
                    cat.subcategories.map((sub) => (
                      <span
                        key={sub.id}
                        className="bg-carbon-card border border-fastener-gunmetal rounded px-2.5 py-1 text-xs font-mono text-machined-silver inline-flex items-center gap-2"
                      >
                        {sub.name}
                        <button
                          onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                          className="text-machined-dim hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-machined-dim font-mono italic">
                      No subcategories assigned.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Root Category */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-obsidian/85 backdrop-blur-md">
          <div className="bg-carbon-card border border-fastener-gunmetal rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-fastener-border mb-4">
              <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                Add Dynamic Root Category
              </h2>
              <button onClick={() => setCatModalOpen(false)} className="text-machined-dim hover:text-machined-titanium">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Brushless Speed Motors"
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono text-nitro-amber focus:outline-none focus:border-nitro-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Category purpose and scope..."
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>

              <FileUploadZone
                label="Category Banner Image (Instant Metadata Extraction)"
                onUploadSuccess={(url) => setCatImage(url)}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-fastener-border">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="outline-btn text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="nitro-btn text-xs py-2 px-5">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subcategory */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-obsidian/85 backdrop-blur-md">
          <div className="bg-carbon-card border border-fastener-gunmetal rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-fastener-border mb-4">
              <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                Add Subcategory
              </h2>
              <button onClick={() => setSubModalOpen(false)} className="text-machined-dim hover:text-machined-titanium">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubcategory} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Subcategory Name</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => handleSubNameChange(e.target.value)}
                  placeholder="e.g. 1:16 Scale RWD"
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs font-mono text-nitro-amber focus:outline-none focus:border-nitro-amber"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-fastener-border">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="outline-btn text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="nitro-btn text-xs py-2 px-5">
                  Save Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
