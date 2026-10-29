import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod, // 'RAZORPAY' or 'CASH_ON_DELIVERY'
      items,         // Array of { productId, variantId, quantity }
      couponCode,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || !items.length) {
      return NextResponse.json({ success: false, message: 'Missing required order fields.' }, { status: 400 });
    }

    // Get current store settings for shipping threshold, fees, tax, COD
    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } }) || {
      freeShippingThresholdPaise: 99900,
      standardShippingFeePaise: 9900,
      taxRatePercent: 5,
      codEnabled: true,
    };

    if (paymentMethod === 'CASH_ON_DELIVERY' && !settings.codEnabled) {
      return NextResponse.json({ success: false, message: 'Cash on Delivery is currently disabled by store.' }, { status: 400 });
    }

    // Perform database transaction to validate prices, stock, and atomically reserve/decrement
    const result = await prisma.$transaction(async (tx) => {
      let subtotalPaise = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variants: true, images: true },
        });

        if (!product || product.status !== 'PUBLISHED') {
          throw new Error(`Product ${item.name || item.productId} is no longer available.`);
        }

        let unitPricePaise = product.sellingPricePaise;
        let variantName: string | null = null;
        let availableStock = product.inventoryQty;

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            throw new Error(`Selected variant for ${product.name} is no longer available.`);
          }
          unitPricePaise = variant.pricePaise;
          variantName = variant.name;
          availableStock = variant.inventoryQty;
        }

        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}${variantName ? ` - ${variantName}` : ''}". Only ${availableStock} units remaining.`
          );
        }

        const itemTotalPaise = unitPricePaise * item.quantity;
        subtotalPaise += itemTotalPaise;

        const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';

        orderItemsToCreate.push({
          productId: product.id,
          variantId: item.variantId || null,
          productName: product.name,
          variantName,
          unitPricePaise,
          quantity: item.quantity,
          totalPaise: itemTotalPaise,
          image: primaryImage,
        });

        // Deduct inventory
        if (item.variantId) {
          const updatedVariant = await tx.productVariant.update({
            where: { id: item.variantId },
            data: { inventoryQty: { decrement: item.quantity } },
          });

          // Log inventory movement
          await tx.inventoryMovement.create({
            data: {
              productId: product.id,
              variantId: item.variantId,
              changeQty: -item.quantity,
              previousQty: availableStock,
              newQty: updatedVariant.inventoryQty,
              reason: 'ORDER_PLACED',
            },
          });
        } else {
          const updatedProduct = await tx.product.update({
            where: { id: product.id },
            data: {
              inventoryQty: { decrement: item.quantity },
              availability:
                product.inventoryQty - item.quantity <= 0
                  ? 'OUT_OF_STOCK'
                  : product.inventoryQty - item.quantity <= product.lowStockThreshold
                  ? 'LOW_STOCK'
                  : 'IN_STOCK',
            },
          });

          // Log inventory movement
          await tx.inventoryMovement.create({
            data: {
              productId: product.id,
              changeQty: -item.quantity,
              previousQty: availableStock,
              newQty: updatedProduct.inventoryQty,
              reason: 'ORDER_PLACED',
            },
          });
        }
      }

      // Calculate server-side coupon discount
      let discountPaise = 0;
      let appliedCouponRecord = null;

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.trim().toUpperCase() },
        });

        if (coupon && coupon.isActive) {
          const notExpired = !coupon.endDate || new Date(coupon.endDate) >= new Date();
          const underLimit = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
          const meetsMinOrder = subtotalPaise >= coupon.minOrderValuePaise;

          if (notExpired && underLimit && meetsMinOrder) {
            appliedCouponRecord = coupon;
            if (coupon.discountType === 'PERCENTAGE') {
              discountPaise = Math.round((subtotalPaise * coupon.discountValue) / 100);
              if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
                discountPaise = coupon.maxDiscountPaise;
              }
            } else {
              discountPaise = Math.min(coupon.discountValue, subtotalPaise);
            }

            // Increment coupon usage
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usageCount: { increment: 1 } },
            });
          }
        }
      }

      const taxableAmount = Math.max(0, subtotalPaise - discountPaise);
      const shippingPaise =
        subtotalPaise >= settings.freeShippingThresholdPaise || orderItemsToCreate.length === 0
          ? 0
          : settings.standardShippingFeePaise;
      const taxPaise = Math.round((taxableAmount * settings.taxRatePercent) / 100);
      const totalPaise = taxableAmount + shippingPaise + taxPaise;

      // Generate Order Number & Secure 4-digit Delivery OTP
      const orderCount = await tx.order.count();
      const orderNumber = `VV-${new Date().getFullYear()}-${String(1001 + orderCount).padStart(4, '0')}`;
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

      // Link existing registered customer if available
      const matchedCustomer = await tx.customer.findFirst({
        where: {
          OR: [
            { email: customerEmail.trim().toLowerCase() },
            { phone: customerPhone.trim() },
          ],
        },
      });

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: matchedCustomer?.id || null,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
          subtotalPaise,
          discountPaise,
          couponCode: appliedCouponRecord?.code || null,
          shippingPaise,
          taxPaise,
          totalPaise,
          deliveryOtp,
          deliveryOtpVerified: false,
          status: paymentMethod === 'RAZORPAY' ? 'PENDING' : 'CONFIRMED',
          paymentStatus: paymentMethod === 'RAZORPAY' ? 'PENDING' : 'PENDING',
          paymentMethod: paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'CASH_ON_DELIVERY',
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: result,
      message: 'Order created successfully!',
    });
  } catch (error: any) {
    console.error('Checkout processing error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to place order. Please review your cart and try again.',
      },
      { status: 400 }
    );
  }
}
