'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Copy,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Download,
  Image as ImageIcon,
  Sparkles,
  ArrowUpDown,
  X,
  ExternalLink,
  Tag,
  Check,
} from 'lucide-react';
import { formatPrice, slugify } from '@/lib/formatters';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkPricePercent, setBulkPricePercent] = useState('10');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeFormTab, setActiveFormTab] = useState<'general' | 'pricing' | 'variants' | 'provenance' | 'images' | 'seo'>('general');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formFullDescription, setFormFullDescription] = useState('');
  const [formSellingPriceRupees, setFormSellingPriceRupees] = useState('');
  const [formCompareAtRupees, setFormCompareAtRupees] = useState('');
  const [formInventoryQty, setFormInventoryQty] = useState('20');
  const [formLowStockThreshold, setFormLowStockThreshold] = useState('5');
  const [formStatus, setFormStatus] = useState('PUBLISHED');
  const [formAvailability, setFormAvailability] = useState('IN_STOCK');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsBestseller, setFormIsBestseller] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(false);
  const [formIsSale, setFormIsSale] = useState(false);

  // Provenance fields
  const [formFarmOrigin, setFormFarmOrigin] = useState('');
  const [formHarvestInfo, setFormHarvestInfo] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formNetWeight, setFormNetWeight] = useState('');
  const [formBatchNumber, setFormBatchNumber] = useState('');
  const [formFssaiNumber, setFormFssaiNumber] = useState('10024011000918');
  const [formExpiryDate, setFormExpiryDate] = useState('24 Months from Packaging');
  const [formStorageInstructions, setFormStorageInstructions] = useState('');
  const [formIngredients, setFormIngredients] = useState('');

  // SEO fields
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');

  // Images list
  const [formImages, setFormImages] = useState<Array<{ url: string; alt?: string; isPrimary: boolean; sortOrder: number }>>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variants list
  const [formVariants, setFormVariants] = useState<Array<{ name: string; sku: string; priceRupees: string; compareAtRupees?: string; inventoryQty: string; isDefault: boolean }>>([]);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // CSV Import Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvInputText, setCsvInputText] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(search ? { search } : {}),
        ...(categoryFilter !== 'all' ? { categoryId: categoryFilter } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(stockFilter !== 'all' ? { stock: stockFilter } : {}),
      });

      const [resProd, resCat] = await Promise.all([
        fetch(`/api/admin/products?${params.toString()}`),
        fetch('/api/admin/categories'),
      ]);

      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      if (dataProd.success) setProducts(dataProd.products || []);
      if (dataCat.success) setCategories(dataCat.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter, stockFilter]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setEditingProductId(null);
    setFormName('');
    setFormSlug('');
    setFormSku(`VV-${Date.now().toString().slice(-5)}`);
    setFormBarcode('');
    setFormCategoryId(categories[0]?.id || '');
    setFormShortDescription('');
    setFormFullDescription('');
    setFormSellingPriceRupees('999');
    setFormCompareAtRupees('1299');
    setFormInventoryQty('25');
    setFormLowStockThreshold('5');
    setFormStatus('PUBLISHED');
    setFormAvailability('IN_STOCK');
    setFormIsFeatured(false);
    setFormIsBestseller(false);
    setFormIsNewArrival(true);
    setFormIsSale(false);
    setFormFarmOrigin('Kashmir Valley / Himalayan Foothills');
    setFormHarvestInfo('Fresh Seasonal Harvest');
    setFormGrade('Grade-A Pure');
    setFormNetWeight('250g Glass Jar');
    setFormBatchNumber(`VV-24-${Date.now().toString().slice(-4)}`);
    setFormFssaiNumber('10024011000918');
    setFormExpiryDate('24 Months from Packaging');
    setFormStorageInstructions('Store in a cool, dry place away from direct sunlight.');
    setFormIngredients('100% Pure Botanical Harvest');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormImages([]);
    setFormVariants([]);
    setActiveFormTab('general');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product: any) => {
    setModalMode('edit');
    setEditingProductId(product.id);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormSku(product.sku);
    setFormBarcode(product.barcode || '');
    setFormCategoryId(product.categoryId);
    setFormShortDescription(product.shortDescription || '');
    setFormFullDescription(product.fullDescription || '');
    setFormSellingPriceRupees((product.sellingPricePaise / 100).toString());
    setFormCompareAtRupees(product.compareAtPricePaise ? (product.compareAtPricePaise / 100).toString() : '');
    setFormInventoryQty(product.inventoryQty.toString());
    setFormLowStockThreshold(product.lowStockThreshold.toString());
    setFormStatus(product.status);
    setFormAvailability(product.availability);
    setFormIsFeatured(product.isFeatured);
    setFormIsBestseller(product.isBestseller);
    setFormIsNewArrival(product.isNewArrival);
    setFormIsSale(product.isSale);
    setFormFarmOrigin(product.farmOrigin || '');
    setFormHarvestInfo(product.harvestInfo || '');
    setFormGrade(product.grade || '');
    setFormNetWeight(product.netWeight || '');
    setFormBatchNumber(product.batchNumber || '');
    setFormFssaiNumber(product.fssaiNumber || '10024011000918');
    setFormExpiryDate(product.expiryDate || '');
    setFormStorageInstructions(product.storageInstructions || '');
    setFormIngredients(product.ingredients || '');
    setFormSeoTitle(product.seoTitle || '');
    setFormSeoDescription(product.seoDescription || '');
    setFormImages(
      product.images?.map((img: any) => ({
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })) || []
    );
    setFormVariants(
      product.variants?.map((v: any) => ({
        name: v.name,
        sku: v.sku,
        priceRupees: (v.pricePaise / 100).toString(),
        compareAtRupees: v.compareAtPricePaise ? (v.compareAtPricePaise / 100).toString() : '',
        inventoryQty: v.inventoryQty.toString(),
        isDefault: v.isDefault,
      })) || []
    );
    setActiveFormTab('general');
    setIsModalOpen(true);
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFormImages([
          ...formImages,
          {
            url: data.url,
            alt: formName || 'Botanical product image',
            isPrimary: formImages.length === 0,
            sortOrder: formImages.length,
          },
        ]);
        showToast('Image uploaded successfully!');
      } else {
        showToast(data.message || 'Image upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSku || !formCategoryId || !formSellingPriceRupees) {
      showToast('Please fill in required fields: Name, SKU, Category, and Selling Price.', 'error');
      return;
    }

    if (!formImages || formImages.length === 0) {
      showToast('Product requires at least one image. Please upload or add a product photo.', 'error');
      setActiveFormTab('images');
      return;
    }

    const payload = {
      id: editingProductId,
      name: formName,
      sku: formSku,
      barcode: formBarcode,
      categoryId: formCategoryId,
      shortDescription: formShortDescription || formName,
      fullDescription: formFullDescription || formShortDescription || formName,
      sellingPricePaise: Math.round(parseFloat(formSellingPriceRupees) * 100),
      regularPricePaise: Math.round(parseFloat(formSellingPriceRupees) * 100),
      compareAtPricePaise: formCompareAtRupees ? Math.round(parseFloat(formCompareAtRupees) * 100) : null,
      inventoryQty: parseInt(formInventoryQty, 10) || 0,
      lowStockThreshold: parseInt(formLowStockThreshold, 10) || 5,
      status: formStatus,
      availability: formAvailability,
      isFeatured: formIsFeatured,
      isBestseller: formIsBestseller,
      isNewArrival: formIsNewArrival,
      isSale: formIsSale,
      farmOrigin: formFarmOrigin,
      harvestInfo: formHarvestInfo,
      grade: formGrade,
      netWeight: formNetWeight,
      batchNumber: formBatchNumber,
      fssaiNumber: formFssaiNumber,
      expiryDate: formExpiryDate,
      storageInstructions: formStorageInstructions,
      shelfLife: formExpiryDate,
      ingredients: formIngredients,
      seoTitle: formSeoTitle || formName,
      seoDescription: formSeoDescription || formShortDescription,
      images: formImages,
      variants: formVariants.map((v) => ({
        name: v.name,
        sku: v.sku,
        pricePaise: Math.round(parseFloat(v.priceRupees) * 100),
        compareAtPricePaise: v.compareAtRupees ? Math.round(parseFloat(v.compareAtRupees) * 100) : null,
        inventoryQty: parseInt(v.inventoryQty, 10) || 0,
        isDefault: v.isDefault,
      })),
    };

    try {
      const url = '/api/admin/products';
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(modalMode === 'create' ? 'Product created and published!' : 'Product updated successfully!');
        setIsModalOpen(false);
        fetchProducts();
      } else {
        showToast(data.message || 'Failed to save product', 'error');
      }
    } catch {
      showToast('An error occurred while saving the product.', 'error');
    }
  };

  // 1-Click Duplicate Product
  const handleDuplicate = async (product: any) => {
    try {
      const newSku = `${product.sku}-COPY-${Date.now().toString().slice(-4)}`;
      const payload = {
        name: `${product.name} (Copy)`,
        sku: newSku,
        categoryId: product.categoryId,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        sellingPricePaise: product.sellingPricePaise,
        compareAtPricePaise: product.compareAtPricePaise,
        inventoryQty: product.inventoryQty,
        lowStockThreshold: product.lowStockThreshold,
        status: 'DRAFT', // Safe draft
        images: product.images,
        variants: product.variants,
        farmOrigin: product.farmOrigin,
        harvestInfo: product.harvestInfo,
        grade: product.grade,
        netWeight: product.netWeight,
        batchNumber: `${product.batchNumber || 'VV'}-COPY`,
        fssaiNumber: product.fssaiNumber,
        ingredients: product.ingredients,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Duplicated as "${payload.name}" in Draft status.`);
        fetchProducts();
      } else {
        showToast(data.message || 'Duplicate failed', 'error');
      }
    } catch {
      showToast('Error duplicating product', 'error');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or archive "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Product removed.');
        fetchProducts();
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: string, value?: any) => {
    if (selectedIds.length === 0) return;
    if (action === 'DELETE' && !confirm(`Permanently delete/archive ${selectedIds.length} products?`)) return;

    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productIds: selectedIds,
          value,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setSelectedIds([]);
        fetchProducts();
      } else {
        showToast(data.message || 'Bulk action failed', 'error');
      }
    } catch {
      showToast('Error executing bulk action', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // CSV Import Submit
  const handleCsvImport = async () => {
    if (!csvInputText.trim()) return;
    try {
      const res = await fetch('/api/admin/products/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: csvInputText }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsCsvModalOpen(false);
        setCsvInputText('');
        fetchProducts();
      } else {
        showToast(data.message || 'CSV Import failed', 'error');
      }
    } catch {
      showToast('Error processing CSV import', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-scale ${
            toastMessage.type === 'success' ? 'bg-emerald-800 text-white' : 'bg-rose-800 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Master Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Botanical Product Catalog
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Publish, edit prices, manage variants, and update inventory with zero code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <a
            href="/api/admin/products/csv"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalog CSV</span>
          </a>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-forest text-white hover:bg-brand-forest-700 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            placeholder="Search products by name or SKU..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-forest"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Stock */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">All Stock Levels</option>
            <option value="in">In Stock (&gt;5)</option>
            <option value="low">Low Stock (≤5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>

          <button
            onClick={fetchProducts}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Bulk Actions Toolbar (Visible when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-brand-forest-900 text-white p-3.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-brand-gold text-brand-forest-950 px-2 py-0.5 rounded-full text-[11px]">
              {selectedIds.length} Selected
            </span>
            <span className="text-stone-300">Bulk Actions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkAction('PUBLISH')}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-medium"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkAction('UNPUBLISH')}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 font-medium"
            >
              Unpublish (Draft)
            </button>

            {/* Price adjustment */}
            <div className="flex items-center gap-1 bg-brand-forest-950 px-2 py-1 rounded-lg">
              <span>Price %:</span>
              <input
                type="number"
                value={bulkPricePercent}
                onChange={(e) => setBulkPricePercent(e.target.value)}
                className="w-12 bg-transparent text-center font-bold text-brand-gold focus:outline-none"
              />
              <button
                onClick={() => handleBulkAction('ADJUST_PRICE_PERCENT', bulkPricePercent)}
                className="text-[11px] underline text-brand-gold hover:text-white"
              >
                Apply
              </button>
            </div>

            <button
              onClick={() => handleBulkAction('DELETE')}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete / Archive</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(products.map((p) => p.id));
                      else setSelectedIds([]);
                    }}
                    className="rounded text-brand-forest"
                  />
                </th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price / MRP</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Variants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    Loading botanical products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No products match the selected filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-stone-50/70 transition-colors ${
                        isSelected ? 'bg-brand-sage-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, p.id]);
                            else setSelectedIds(selectedIds.filter((id) => id !== p.id));
                          }}
                          className="rounded text-brand-forest"
                        />
                      </td>

                      {/* Product Thumbnail + Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200">
                            {primaryImg ? (
                              <img src={primaryImg} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-stone-900 block truncate max-w-xs hover:text-brand-forest">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono block">
                              SKU: {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        {p.category?.name || '—'}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-forest">
                          {formatPrice(p.sellingPricePaise)}
                        </div>
                        {p.compareAtPricePaise && (
                          <div className="text-[10px] text-stone-400 line-through">
                            MRP: {formatPrice(p.compareAtPricePaise)}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          p.inventoryQty <= 0
                            ? 'bg-rose-100 text-rose-800'
                            : p.inventoryQty <= p.lowStockThreshold
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.inventoryQty} Units
                        </span>
                      </td>

                      {/* Variants count */}
                      <td className="py-3.5 px-4 text-stone-600 font-medium">
                        {p.variants?.length ? `${p.variants.length} Sizes` : 'Single Item'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live preview */}
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-stone-400 hover:text-brand-forest hover:bg-stone-100 rounded-lg"
                            title="Preview on Live Store"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-stone-600 hover:text-brand-forest hover:bg-stone-100 rounded-lg"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(p)}
                            className="p-1.5 text-stone-600 hover:text-blue-600 hover:bg-stone-100 rounded-lg"
                            title="1-Click Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg"
                            title="Delete or Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {modalMode === 'create' ? 'Create New Botanical Product' : `Edit: ${formName}`}
                </h3>
                <p className="text-xs text-stone-500">
                  All updates automatically sync across homepage, catalog, search, and checkout.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-stone-200 px-6 gap-6 text-xs font-semibold overflow-x-auto bg-stone-50/50">
              {[
                { key: 'general', label: '1. General Info *' },
                { key: 'pricing', label: '2. Pricing & Stock *' },
                { key: 'variants', label: `3. Variants (${formVariants.length})` },
                { key: 'images', label: `4. Images * (${formImages.length})` },
                { key: 'provenance', label: '5. Farm Provenance & FSSAI' },
                { key: 'seo', label: '6. SEO & Google Preview' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFormTab(tab.key as any)}
                  className={`py-3.5 border-b-2 whitespace-nowrap transition-all ${
                    activeFormTab === tab.key
                      ? 'border-brand-forest text-brand-forest'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: General Info */}
              {activeFormTab === 'general' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-stone-800 block mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => {
                          setFormName(e.target.value);
                          if (modalMode === 'create') setFormSlug(slugify(e.target.value));
                        }}
                        placeholder="e.g. Pure Himalayan Shilajit Resin (Gold Grade)"
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-forest font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">SKU (Stock Keeping Unit) *</label>
                      <input
                        type="text"
                        required
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                        placeholder="e.g. VV-SHJ-001"
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-forest font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Botanical Category *</label>
                      <select
                        required
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-forest font-medium"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Status</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                      >
                        <option value="PUBLISHED">Published (Visible on Storefront)</option>
                        <option value="DRAFT">Draft (Hidden from Public)</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Optional Barcode / EAN</label>
                      <input
                        type="text"
                        value={formBarcode}
                        onChange={(e) => setFormBarcode(e.target.value)}
                        placeholder="e.g. 8901234567890"
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-stone-800 block mb-1">Short Summary (Catalog & Cards)</label>
                      <textarea
                        rows={2}
                        value={formShortDescription}
                        onChange={(e) => setFormShortDescription(e.target.value)}
                        placeholder="1-2 sentences summarizing botanical extraction and primary benefit..."
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-stone-800 block mb-1">Full Editorial Description</label>
                      <textarea
                        rows={4}
                        value={formFullDescription}
                        onChange={(e) => setFormFullDescription(e.target.value)}
                        placeholder="Detailed botanical narrative, traditional Vedic references, harvesting altitudes, and instructions..."
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>

                  {/* Badges Toggles */}
                  <div className="pt-2 border-t border-stone-200">
                    <span className="font-bold text-stone-800 block mb-2">Storefront Badges:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsBestseller}
                          onChange={(e) => setFormIsBestseller(e.target.checked)}
                          className="rounded text-brand-forest"
                        />
                        <span className="font-medium text-stone-800">Bestseller</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsFeatured}
                          onChange={(e) => setFormIsFeatured(e.target.checked)}
                          className="rounded text-brand-forest"
                        />
                        <span className="font-medium text-stone-800">Featured</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsNewArrival}
                          onChange={(e) => setFormIsNewArrival(e.target.checked)}
                          className="rounded text-brand-forest"
                        />
                        <span className="font-medium text-stone-800">New Arrival</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsSale}
                          onChange={(e) => setFormIsSale(e.target.checked)}
                          className="rounded text-brand-forest"
                        />
                        <span className="font-medium text-stone-800">Sale Offering</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Pricing & Stock */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-stone-800 block mb-1">
                        Selling Price (₹ INR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formSellingPriceRupees}
                          onChange={(e) => setFormSellingPriceRupees(e.target.value)}
                          placeholder="999.00"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-stone-300 font-bold text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">
                        Compare-at / MRP (₹ INR - Strikethrough)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formCompareAtRupees}
                          onChange={(e) => setFormCompareAtRupees(e.target.value)}
                          placeholder="1299.00"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-stone-300 font-bold text-sm"
                        />
                      </div>
                    </div>

                    {/* Live Discount calculation pill */}
                    {parseFloat(formCompareAtRupees) > parseFloat(formSellingPriceRupees) && (
                      <div className="sm:col-span-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-semibold flex items-center justify-between">
                        <span>Customer Savings on Storefront:</span>
                        <span>
                          {Math.round(
                            ((parseFloat(formCompareAtRupees) - parseFloat(formSellingPriceRupees)) /
                              parseFloat(formCompareAtRupees)) *
                              100
                          )}
                          % OFF (Saves ₹
                          {(parseFloat(formCompareAtRupees) - parseFloat(formSellingPriceRupees)).toFixed(2)})
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Inventory Quantity in Harvest *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formInventoryQty}
                        onChange={(e) => setFormInventoryQty(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Low-Stock Alert Threshold</label>
                      <input
                        type="number"
                        min="1"
                        value={formLowStockThreshold}
                        onChange={(e) => setFormLowStockThreshold(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Availability Override</label>
                      <select
                        value={formAvailability}
                        onChange={(e) => setFormAvailability(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                      >
                        <option value="IN_STOCK">Automatic / In Stock</option>
                        <option value="LOW_STOCK">Force Low Stock</option>
                        <option value="OUT_OF_STOCK">Force Out of Stock</option>
                        <option value="PREORDER">Preorder Permitted</option>
                        <option value="DISCONTINUED">Discontinued</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Variants Builder */}
              {activeFormTab === 'variants' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-stone-800">Product Variants (Weights / Sizes / Refills)</h4>
                      <p className="text-stone-500">Each variant has its own price, SKU, and independent stock.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormVariants([
                          ...formVariants,
                          {
                            name: '500g Jar',
                            sku: `${formSku}-V${formVariants.length + 1}`,
                            priceRupees: formSellingPriceRupees,
                            compareAtRupees: formCompareAtRupees,
                            inventoryQty: '10',
                            isDefault: formVariants.length === 0,
                          },
                        ])
                      }
                      className="px-3 py-1.5 rounded-xl bg-brand-forest text-white font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Variant</span>
                    </button>
                  </div>

                  {formVariants.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500">
                      No variants added. This product will be sold as a single unit using the main price and stock.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formVariants.map((v, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                          <div>
                            <label className="font-semibold block mb-1">Variant Name</label>
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) => {
                                const updated = [...formVariants];
                                updated[idx].name = e.target.value;
                                setFormVariants(updated);
                              }}
                              placeholder="e.g. 500g Glass Jar"
                              className="w-full p-2 rounded-lg border bg-white"
                            />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">SKU</label>
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => {
                                const updated = [...formVariants];
                                updated[idx].sku = e.target.value;
                                setFormVariants(updated);
                              }}
                              className="w-full p-2 rounded-lg border bg-white font-mono uppercase"
                            />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">Price (₹)</label>
                            <input
                              type="number"
                              value={v.priceRupees}
                              onChange={(e) => {
                                const updated = [...formVariants];
                                updated[idx].priceRupees = e.target.value;
                                setFormVariants(updated);
                              }}
                              className="w-full p-2 rounded-lg border bg-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">Stock</label>
                            <input
                              type="number"
                              value={v.inventoryQty}
                              onChange={(e) => {
                                const updated = [...formVariants];
                                updated[idx].inventoryQty = e.target.value;
                                setFormVariants(updated);
                              }}
                              className="w-full p-2 rounded-lg border bg-white font-bold"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setFormVariants(formVariants.filter((_, i) => i !== idx));
                              }}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete Variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Images & Media */}
              {activeFormTab === 'images' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-stone-800">Product Photography & Gallery</h4>
                      <p className="text-stone-500">Upload or link images. The primary image is shown on cards and thumbnails.</p>
                    </div>

                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-brand-forest text-white font-semibold flex items-center gap-2 shadow-sm">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {/* Add via direct URL input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      id="directUrlInput"
                      placeholder="Or enter direct image URL (e.g. Unsplash or CDN)..."
                      className="flex-1 p-2 rounded-xl border border-stone-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('directUrlInput') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          setFormImages([
                            ...formImages,
                            {
                              url: input.value.trim(),
                              alt: formName,
                              isPrimary: formImages.length === 0,
                              sortOrder: formImages.length,
                            },
                          ]);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 font-semibold rounded-xl text-stone-800"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Images Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {formImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 group ${
                          img.isPrimary ? 'border-brand-forest ring-2 ring-brand-forest/20' : 'border-stone-200'
                        }`}
                      >
                        <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />

                        {img.isPrimary && (
                          <span className="absolute top-2 left-2 bg-brand-forest text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            Primary
                          </span>
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormImages(
                                  formImages.map((im, i) => ({
                                    ...im,
                                    isPrimary: i === idx,
                                  }))
                                );
                              }}
                              className="p-1.5 bg-white text-stone-800 rounded-lg text-[10px] font-bold"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setFormImages(formImages.filter((_, i) => i !== idx));
                            }}
                            className="p-1.5 bg-rose-600 text-white rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Farm Provenance & FSSAI */}
              {activeFormTab === 'provenance' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-brand-ivory-warm rounded-xl border border-brand-ivory-border text-stone-700">
                    <span className="font-bold text-brand-forest block mb-0.5">Agricultural & Food Product Compliance</span>
                    Regulated details will only be displayed on the customer product page if filled in.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Farm Origin & Geography</label>
                      <input
                        type="text"
                        value={formFarmOrigin}
                        onChange={(e) => setFormFarmOrigin(e.target.value)}
                        placeholder="e.g. Kinnaur Valley, High Himalayas (16,000 ft)"
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Harvest Season / Extraction Info</label>
                      <input
                        type="text"
                        value={formHarvestInfo}
                        onChange={(e) => setFormHarvestInfo(e.target.value)}
                        placeholder="e.g. October 2024 Dawn Harvest, Wood-Pressed"
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Standardized Grade</label>
                      <input
                        type="text"
                        value={formGrade}
                        onChange={(e) => setFormGrade(e.target.value)}
                        placeholder="e.g. Grade-A+ Super Mongra"
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Net Weight / Package Volume</label>
                      <input
                        type="text"
                        value={formNetWeight}
                        onChange={(e) => setFormNetWeight(e.target.value)}
                        placeholder="e.g. 500ml Glass Carafe"
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">Batch Number</label>
                      <input
                        type="text"
                        value={formBatchNumber}
                        onChange={(e) => setFormBatchNumber(e.target.value)}
                        placeholder="e.g. VV-KSM-24-01"
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-800 block mb-1">FSSAI Licence Number</label>
                      <input
                        type="text"
                        value={formFssaiNumber}
                        onChange={(e) => setFormFssaiNumber(e.target.value)}
                        placeholder="10024011000918"
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-stone-800 block mb-1">Complete Botanical Ingredients</label>
                      <textarea
                        rows={2}
                        value={formIngredients}
                        onChange={(e) => setFormIngredients(e.target.value)}
                        placeholder="e.g. 100% Pure Kashmiri Mongra Saffron (Crocus sativus stigmas)"
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-stone-800 block mb-1">Storage & Preservation Instructions</label>
                      <input
                        type="text"
                        value={formStorageInstructions}
                        onChange={(e) => setFormStorageInstructions(e.target.value)}
                        placeholder="e.g. Store in amber glass away from sunlight and moisture."
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SEO & Preview */}
              {activeFormTab === 'seo' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">SEO Meta Title</label>
                    <input
                      type="text"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder={formName || 'Product Title'}
                      className="w-full p-2.5 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={formSeoDescription}
                      onChange={(e) => setFormSeoDescription(e.target.value)}
                      placeholder={formShortDescription || 'Product description for search results...'}
                      className="w-full p-2.5 rounded-xl border border-stone-300"
                    />
                  </div>

                  {/* Google Search Live Preview Card */}
                  <div className="pt-2">
                    <span className="font-bold text-stone-700 block mb-2">Live Google Search Preview:</span>
                    <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm max-w-lg space-y-1">
                      <div className="text-[11px] text-stone-500">https://vedikvana.com › product › {formSlug || 'slug'}</div>
                      <div className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer">
                        {formSeoTitle || formName || 'Product Title'} | Vedik Vana
                      </div>
                      <div className="text-xs text-stone-600 line-clamp-2">
                        {formSeoDescription || formShortDescription || 'Pure, farm-traceable Indian botanicals handcrafted according to Ayurvedic shastras.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="p-5 border-t border-stone-200 flex items-center justify-between bg-stone-50 rounded-b-3xl -mx-6 -mb-6 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-xs text-stone-600 hover:bg-stone-200"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-forest text-white hover:bg-brand-forest-700 flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>{modalMode === 'create' ? 'Publish Product to Live Store' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-base font-bold text-stone-900">
                Bulk Import Products via CSV
              </h3>
              <button onClick={() => setIsCsvModalOpen(false)} className="text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Paste standard CSV rows with columns: <code>ID, SKU, Name, Slug, Category, Selling Price, MRP, Stock</code>
            </p>

            <textarea
              rows={8}
              value={csvInputText}
              onChange={(e) => setCsvInputText(e.target.value)}
              placeholder={`SKU,Name,Category,Selling Price,MRP,Stock\nVV-NEW-01,"Himalayan Herb Extract",Botanicals,899,1199,50`}
              className="w-full p-3 rounded-xl border border-stone-300 font-mono text-xs"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvImport}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-forest text-white hover:bg-brand-forest-700 shadow-sm"
              >
                Import Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
