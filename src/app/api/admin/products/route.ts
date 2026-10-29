import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/formatters';
import { revalidatePath } from 'next/cache';

// GET products for admin
export async function GET(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const stockFilter = searchParams.get('stock'); // 'low', 'out', 'in'

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (stockFilter === 'low') {
      where.inventoryQty = { lte: 5, gt: 0 };
    } else if (stockFilter === 'out') {
      where.inventoryQty = { lte: 0 };
    } else if (stockFilter === 'in') {
      where.inventoryQty = { gt: 5 };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST create product
export async function POST(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      sku,
      barcode,
      shortDescription,
      fullDescription,
      categoryId,
      subcategory,
      tags,
      regularPricePaise,
      sellingPricePaise,
      compareAtPricePaise,
      inventoryQty = 0,
      lowStockThreshold = 5,
      status = 'PUBLISHED',
      isFeatured = false,
      isBestseller = false,
      isNewArrival = false,
      isSale = false,
      farmOrigin,
      harvestInfo,
      grade,
      netWeight,
      batchNumber,
      fssaiNumber,
      mfgDate,
      expiryDate,
      storageInstructions,
      shelfLife,
      ingredients,
      seoTitle,
      seoDescription,
      images = [],
      variants = [],
    } = body;

    if (!name || !sku || !categoryId || !shortDescription || !sellingPricePaise) {
      return NextResponse.json(
        { success: false, message: 'Name, SKU, Category, Short Description, and Selling Price are required.' },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one product image is required.' },
        { status: 400 }
      );
    }

    // Auto generate unique slug
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json({ success: false, message: `SKU "${sku}" is already in use.` }, { status: 400 });
    }

    // Determine availability
    let availability = 'IN_STOCK';
    if (inventoryQty <= 0) availability = 'OUT_OF_STOCK';
    else if (inventoryQty <= lowStockThreshold) availability = 'LOW_STOCK';

    // Create product in transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          slug,
          name,
          sku,
          barcode,
          shortDescription,
          fullDescription: fullDescription || shortDescription,
          categoryId,
          subcategory,
          tags: Array.isArray(tags) ? tags.join(', ') : tags,
          regularPricePaise: Number(regularPricePaise) || Number(sellingPricePaise),
          sellingPricePaise: Number(sellingPricePaise),
          compareAtPricePaise: compareAtPricePaise ? Number(compareAtPricePaise) : null,
          inventoryQty: Number(inventoryQty),
          lowStockThreshold: Number(lowStockThreshold),
          status,
          availability,
          isFeatured: Boolean(isFeatured),
          isBestseller: Boolean(isBestseller),
          isNewArrival: Boolean(isNewArrival),
          isSale: Boolean(isSale),
          farmOrigin,
          harvestInfo,
          grade,
          netWeight,
          batchNumber,
          fssaiNumber,
          mfgDate,
          expiryDate,
          storageInstructions,
          shelfLife,
          ingredients,
          seoTitle: seoTitle || name,
          seoDescription: seoDescription || shortDescription,
          images: {
            create: images.map((img: any, idx: number) => ({
              url: img.url,
              alt: img.alt || name,
              sortOrder: img.sortOrder ?? idx,
              isPrimary: img.isPrimary ?? idx === 0,
            })),
          },
          variants: {
            create: variants.map((v: any, idx: number) => ({
              name: v.name,
              sku: v.sku || `${sku}-V${idx + 1}`,
              pricePaise: Number(v.pricePaise) || Number(sellingPricePaise),
              compareAtPricePaise: v.compareAtPricePaise ? Number(v.compareAtPricePaise) : null,
              inventoryQty: Number(v.inventoryQty) || 0,
              isDefault: v.isDefault ?? idx === 0,
            })),
          },
        },
        include: {
          category: true,
          images: true,
          variants: true,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          userName: session.name,
          action: 'PRODUCT_CREATED',
          details: JSON.stringify({ productId: prod.id, name: prod.name, sku: prod.sku }),
        },
      });

      return prod;
    });

    revalidatePath('/');
    revalidatePath('/shop');

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Product created successfully and published to catalog!',
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create product' }, { status: 500 });
  }
}

// PUT update product
export async function PUT(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, images = [], variants = [], ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID is required.' }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const inventoryQty = Number(data.inventoryQty ?? existingProduct.inventoryQty);
    const lowStockThreshold = Number(data.lowStockThreshold ?? existingProduct.lowStockThreshold);

    let availability = data.availability || existingProduct.availability;
    if (availability !== 'PREORDER' && availability !== 'DISCONTINUED') {
      if (inventoryQty <= 0) availability = 'OUT_OF_STOCK';
      else if (inventoryQty <= lowStockThreshold) availability = 'LOW_STOCK';
      else availability = 'IN_STOCK';
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Clean and update core fields
      const prod = await tx.product.update({
        where: { id },
        data: {
          name: data.name ?? existingProduct.name,
          sku: data.sku ?? existingProduct.sku,
          barcode: data.barcode,
          shortDescription: data.shortDescription ?? existingProduct.shortDescription,
          fullDescription: data.fullDescription ?? existingProduct.fullDescription,
          categoryId: data.categoryId ?? existingProduct.categoryId,
          subcategory: data.subcategory,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags,
          regularPricePaise: Number(data.regularPricePaise ?? existingProduct.regularPricePaise),
          sellingPricePaise: Number(data.sellingPricePaise ?? existingProduct.sellingPricePaise),
          compareAtPricePaise: data.compareAtPricePaise ? Number(data.compareAtPricePaise) : null,
          inventoryQty,
          lowStockThreshold,
          status: data.status ?? existingProduct.status,
          availability,
          isFeatured: Boolean(data.isFeatured),
          isBestseller: Boolean(data.isBestseller),
          isNewArrival: Boolean(data.isNewArrival),
          isSale: Boolean(data.isSale),
          farmOrigin: data.farmOrigin,
          harvestInfo: data.harvestInfo,
          grade: data.grade,
          netWeight: data.netWeight,
          batchNumber: data.batchNumber,
          fssaiNumber: data.fssaiNumber,
          mfgDate: data.mfgDate,
          expiryDate: data.expiryDate,
          storageInstructions: data.storageInstructions,
          shelfLife: data.shelfLife,
          ingredients: data.ingredients,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
        },
      });

      // Update images: delete existing and recreate
      if (images && images.length > 0) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((img: any, idx: number) => ({
            productId: id,
            url: img.url,
            alt: img.alt || prod.name,
            sortOrder: img.sortOrder ?? idx,
            isPrimary: img.isPrimary ?? idx === 0,
          })),
        });
      }

      // Update variants: sync
      if (variants && variants.length > 0) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.productVariant.createMany({
          data: variants.map((v: any, idx: number) => ({
            productId: id,
            name: v.name,
            sku: v.sku || `${prod.sku}-V${idx + 1}`,
            pricePaise: Number(v.pricePaise) || prod.sellingPricePaise,
            compareAtPricePaise: v.compareAtPricePaise ? Number(v.compareAtPricePaise) : null,
            inventoryQty: Number(v.inventoryQty) || 0,
            isDefault: v.isDefault ?? idx === 0,
          })),
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          userName: session.name,
          action: 'PRODUCT_UPDATED',
          details: JSON.stringify({
            productId: id,
            name: prod.name,
            priceChanged: existingProduct.sellingPricePaise !== prod.sellingPricePaise,
          }),
        },
      });

      return prod;
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${existingProduct.slug}`);

    return NextResponse.json({
      success: true,
      product: updated,
      message: 'Product updated successfully!',
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update product' }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID is required.' }, { status: 400 });
    }

    // Check if product has existing orders
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      // Archive instead of hard delete to preserve historical order references
      await prisma.product.update({
        where: { id },
        data: { status: 'ARCHIVED', availability: 'DISCONTINUED' },
      });
      return NextResponse.json({
        success: true,
        message: 'Product has order history, so it has been safely ARCHIVED and removed from storefront.',
      });
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath('/');
    revalidatePath('/shop');

    return NextResponse.json({ success: true, message: 'Product permanently deleted.' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
