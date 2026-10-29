import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/formatters';

// Export Catalog to CSV
export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    const headers = [
      'ID',
      'SKU',
      'Name',
      'Slug',
      'Category',
      'Selling Price (INR)',
      'MRP (INR)',
      'Stock Qty',
      'Low Stock Threshold',
      'Status',
      'Availability',
      'Farm Origin',
      'FSSAI Licence',
      'Batch Number',
    ];

    const rows = products.map((p) => [
      p.id,
      `"${p.sku.replace(/"/g, '""')}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      p.slug,
      `"${(p.category?.name || '').replace(/"/g, '""')}"`,
      (p.sellingPricePaise / 100).toFixed(2),
      p.compareAtPricePaise ? (p.compareAtPricePaise / 100).toFixed(2) : '',
      p.inventoryQty,
      p.lowStockThreshold,
      p.status,
      p.availability,
      `"${(p.farmOrigin || '').replace(/"/g, '""')}"`,
      `"${(p.fssaiNumber || '').replace(/"/g, '""')}"`,
      `"${(p.batchNumber || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vedik_vana_products_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate CSV' }, { status: 500 });
  }
}

// Import Catalog from CSV
export async function POST(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { csvText } = await request.json();
    if (!csvText || typeof csvText !== 'string') {
      return NextResponse.json({ success: false, message: 'Valid CSV text is required.' }, { status: 400 });
    }

    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ success: false, message: 'CSV contains no product rows.' }, { status: 400 });
    }

    // Default category fallback
    let defaultCat = await prisma.category.findFirst();
    if (!defaultCat) {
      defaultCat = await prisma.category.create({
        data: { name: 'Botanicals', slug: 'botanicals', description: 'General Botanicals' },
      });
    }

    let importedCount = 0;
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV regex parse
      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      if (cols.length < 5) continue;

      const cleanCols = cols.map((c) => c.replace(/^"|"$/g, '').trim());
      const [id, sku, name, slugInput, categoryName, priceStr, mrpStr, stockStr] = cleanCols;

      if (!name || !sku) continue;

      const sellingPricePaise = Math.round((parseFloat(priceStr) || 100) * 100);
      const compareAtPricePaise = mrpStr ? Math.round(parseFloat(mrpStr) * 100) : null;
      const inventoryQty = parseInt(stockStr, 10) || 10;
      const slug = slugInput || slugify(name);

      await prisma.product.upsert({
        where: { sku },
        update: {
          name,
          sellingPricePaise,
          compareAtPricePaise,
          inventoryQty,
        },
        create: {
          sku,
          name,
          slug,
          categoryId: defaultCat.id,
          shortDescription: `${name} — 100% natural and lab-certified.`,
          fullDescription: `${name} harvested sustainably and prepared according to classical Vedic processes.`,
          sellingPricePaise,
          regularPricePaise: sellingPricePaise,
          compareAtPricePaise,
          inventoryQty,
          status: 'PUBLISHED',
          availability: inventoryQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        },
      });
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed CSV and imported/updated ${importedCount} products.`,
    });
  } catch (error: any) {
    console.error('CSV import error:', error);
    return NextResponse.json({ success: false, message: error.message || 'CSV import failed' }, { status: 500 });
  }
}
