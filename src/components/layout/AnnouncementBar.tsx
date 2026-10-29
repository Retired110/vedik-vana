'use client';

import React, { useState } from 'react';
import { Sparkles, X, Tag } from 'lucide-react';

interface AnnouncementBarProps {
  message?: string;
  isActive?: boolean;
}

export function AnnouncementBar({
  message = '✨ Special Festive Offering: Use code VEDIK15 for 15% off | Free Express Delivery across India above ₹999',
  isActive = true,
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(isActive);

  if (!isVisible || !message) return null;

  return (
    <div className="bg-brand-forest-900 text-brand-gold-100 text-xs py-2 px-4 relative z-50 transition-all border-b border-brand-forest-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center gap-2 text-center font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold hidden sm:inline" />
          <span>{message}</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-stone-400 hover:text-white p-1 transition-colors"
          aria-label="Close announcement bar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
