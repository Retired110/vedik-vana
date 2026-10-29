/**
 * Safe currency and data formatting helpers for Vedik Vana
 * Prices are strictly stored in integer paise (₹1 = 100 paise)
 */

export function formatPrice(paise: number | undefined | null): string {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

export function calculateDiscount(
  sellingPaise: number,
  compareAtPaise?: number | null
): {
  hasDiscount: boolean;
  percentage: number;
  savingsPaise: number;
} {
  if (!compareAtPaise || compareAtPaise <= sellingPaise) {
    return { hasDiscount: false, percentage: 0, savingsPaise: 0 };
  }
  const savings = compareAtPaise - sellingPaise;
  const percentage = Math.round((savings / compareAtPaise) * 100);
  return {
    hasDiscount: percentage > 0,
    percentage,
    savingsPaise: savings,
  };
}

export function formatDate(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

export function getStockStatus(
  qty: number,
  threshold: number = 5,
  availability: string = 'IN_STOCK'
): {
  label: string;
  badgeClass: string;
  isPurchasable: boolean;
  isLowStock: boolean;
} {
  if (availability === 'DISCONTINUED') {
    return {
      label: 'Discontinued',
      badgeClass: 'bg-stone-100 text-stone-600 border-stone-200',
      isPurchasable: false,
      isLowStock: false,
    };
  }
  if (availability === 'PREORDER') {
    return {
      label: 'Preorder Available',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      isPurchasable: true,
      isLowStock: false,
    };
  }
  if (qty <= 0) {
    return {
      label: 'Out of Stock',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      isPurchasable: false,
      isLowStock: false,
    };
  }
  if (qty <= threshold) {
    return {
      label: `Low Stock (Only ${qty} left)`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse',
      isPurchasable: true,
      isLowStock: true,
    };
  }
  return {
    label: 'In Stock',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    isPurchasable: true,
    isLowStock: false,
  };
}
