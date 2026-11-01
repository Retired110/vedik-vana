export function generateOrderConfirmationHtml(order: any, settings?: any): string {
  const storeName = settings?.storeName || 'Vedik Vana';
  const contactEmail = settings?.contactEmail || 'care@vedikvana.com';
  const contactPhone = settings?.contactPhone || '+91 98765 43210';
  const fssaiLicence = settings?.fssaiLicence || '10024011000918';
  const address = typeof order.shippingAddress === 'string'
    ? (() => {
        try {
          return JSON.parse(order.shippingAddress);
        } catch {
          return { addressLine1: order.shippingAddress };
        }
      })()
    : order.shippingAddress || {};

  const formatInr = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

  const isCod = order.paymentMethod === 'CASH_ON_DELIVERY';

  const itemsHtml = order.items
    ?.map(
      (item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0ede6;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              ${item.image ? `<td width="56" valign="top"><img src="${item.image}" alt="${item.productName}" width="48" height="48" style="border-radius: 8px; object-fit: cover; border: 1px solid #e7e2d9;" /></td>` : ''}
              <td style="padding-left: ${item.image ? '12px' : '0'};">
                <div style="font-family: 'Cinzel', serif, Georgia; font-weight: 700; font-size: 14px; color: #1c2826;">${item.productName}</div>
                ${item.variantName ? `<div style="font-size: 12px; color: #78716c; margin-top: 2px;">Variant: ${item.variantName}</div>` : ''}
                <div style="font-size: 12px; color: #a8a29e; margin-top: 2px;">Qty: ${item.quantity} × ${formatInr(item.unitPricePaise)}</div>
              </td>
              <td align="right" valign="top" style="font-size: 14px; font-weight: 700; color: #1c2826;">
                ${formatInr(item.totalPaise)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order Confirmation #${order.orderNumber} - ${storeName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f5; margin: 0; padding: 24px; color: #292524; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e2d9; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .header { background: #1c2826; padding: 32px 24px; text-align: center; color: #ffffff; }
    .brand-title { font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #ffffff; margin: 0; }
    .brand-tagline { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #c9a84e; margin-top: 6px; }
    .body { padding: 32px 28px; }
    .otp-card { background: #fbf7ee; border: 2px dashed #c9a84e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-badge { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1c2826; font-family: monospace; margin: 10px 0; }
    .payment-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .payment-cod { background: #fef3c7; color: #92400e; }
    .payment-paid { background: #d1fae5; color: #065f46; }
    .summary-table td { padding: 6px 0; font-size: 13px; color: #57534e; }
    .footer { background: #f5f2ea; padding: 24px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #e7e2d9; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #243532; color: #c9a84e; font-size: 20px; font-weight: bold; margin-bottom: 8px; border: 1px solid rgba(201, 168, 78, 0.4);">V</div>
      <h1 class="brand-title">${storeName.toUpperCase()}</h1>
      <div class="brand-tagline">Sacred Indian Botanicals • Farm-Traceable</div>
    </div>

    <!-- Body -->
    <div class="body">
      <h2 style="font-size: 20px; margin-top: 0; color: #1c2826;">Namaste, ${order.customerName}! 🙏</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #57534e;">
        Your sacred botanical order has been confirmed and placed with our Himalayan master apothecary. We are preparing and batch-testing your formulations for dispatch.
      </p>

      <div style="background: #fbf7ee; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
        <strong>Order Number:</strong> <span style="font-family: monospace; font-weight: bold; color: #1c2826;">${order.orderNumber}</span><br>
        <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>

      <!-- DELIVERY OTP CARD -->
      <div class="otp-card">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #9a761e; letter-spacing: 1px;">
          🔐 Secure Doorstep Delivery Verification OTP
        </div>
        <div class="otp-badge">${order.deliveryOtp || '4821'}</div>
        <div style="font-size: 12px; color: #78716c; line-height: 1.4; max-width: 440px; margin: 0 auto;">
          <strong>Security Notice:</strong> Please share this 4-digit verification code with the courier associate <em>only after receiving and inspecting your parcel</em> at your doorstep.
        </div>
      </div>

      <!-- PAYMENT DETAILS -->
      <div style="margin: 24px 0; padding: 16px; background: #faf8f5; border-radius: 12px; border: 1px solid #eee8df;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1c2826;">
          💳 Payment Information
        </h3>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font-size: 13px; color: #57534e;">Payment Method:</td>
            <td align="right" style="font-size: 13px; font-weight: bold; color: #1c2826;">
              ${isCod ? 'Cash on Delivery (Pay at Doorstep)' : 'Online Payment (Prepaid)'}
            </td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #57534e; padding-top: 6px;">Payment Status:</td>
            <td align="right" style="padding-top: 6px;">
              <span class="payment-badge ${isCod ? 'payment-cod' : 'payment-paid'}">
                ${isCod ? 'PAYABLE AT DOORSTEP' : 'PAID IN FULL'}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- ITEMS ORDERED -->
      <h3 style="margin: 28px 0 12px 0; font-size: 15px; color: #1c2826; border-bottom: 2px solid #1c2826; padding-bottom: 6px;">
        Ordered Botanical Items
      </h3>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${itemsHtml}
      </table>

      <!-- FINANCIAL SUMMARY -->
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e7e2d9;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" class="summary-table">
          <tr>
            <td>Subtotal:</td>
            <td align="right" style="font-weight: 600; color: #1c2826;">${formatInr(order.subtotalPaise)}</td>
          </tr>
          ${
            order.discountPaise > 0
              ? `<tr>
                  <td style="color: #047857;">Coupon Discount (${order.couponCode || 'Promo'}):</td>
                  <td align="right" style="font-weight: 600; color: #047857;">-${formatInr(order.discountPaise)}</td>
                </tr>`
              : ''
          }
          <tr>
            <td>Express Pan-India Shipping:</td>
            <td align="right" style="font-weight: 600; color: #1c2826;">${order.shippingPaise === 0 ? 'FREE' : formatInr(order.shippingPaise)}</td>
          </tr>
          <tr>
            <td>GST (5% Botanical Herbs & Oils):</td>
            <td align="right" style="font-weight: 600; color: #1c2826;">${formatInr(order.taxPaise)}</td>
          </tr>
          <tr style="border-top: 2px solid #1c2826;">
            <td style="font-size: 16px; font-weight: bold; color: #1c2826; padding-top: 12px;">Total ${isCod ? 'Payable' : 'Paid'}:</td>
            <td align="right" style="font-size: 18px; font-weight: bold; color: #1c2826; padding-top: 12px;">${formatInr(order.totalPaise)}</td>
          </tr>
        </table>
      </div>

      <!-- DELIVERY ADDRESS -->
      <div style="margin-top: 28px; padding: 16px; background: #faf8f5; border-radius: 12px; border: 1px solid #eee8df;">
        <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #1c2826;">
          📍 Delivery Address
        </h4>
        <div style="font-size: 13px; line-height: 1.5; color: #57534e;">
          <strong>${address.fullName || order.customerName}</strong><br>
          ${address.addressLine1 || ''}<br>
          ${address.addressLine2 ? `${address.addressLine2}<br>` : ''}
          ${address.city || ''}, ${address.state || ''} — ${address.pincode || ''}<br>
          Phone: ${order.customerPhone}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>${storeName} Botanicals Private Limited</strong></p>
      <p style="margin: 0 0 6px 0;">FSSAI Central Licence No. ${fssaiLicence} | Heavy-Metal & Purity Tested</p>
      <p style="margin: 0 0 12px 0;">For queries or support, contact <a href="mailto:${contactEmail}" style="color: #9a761e; text-decoration: none;">${contactEmail}</a> or call ${contactPhone}.</p>
      <p style="color: #a8a29e; font-size: 10px; margin: 0;">© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}

import nodemailer from 'nodemailer';

/**
 * Automatically dispatches confirmation email to customer after order is saved.
 */
export async function sendCustomerOrderConfirmationEmail(
  order: any,
  settings?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailHtml = generateOrderConfirmationHtml(order, settings);
    const storeName = settings?.storeName || 'Vedik Vana';
    const customerEmail = order.customerEmail?.trim();

    if (!customerEmail || !customerEmail.includes('@')) {
      return { success: false, error: 'Invalid customer email address' };
    }

    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, ''),
        },
      });

      await transporter.sendMail({
        from: `"${storeName}" <${gmailUser}>`,
        to: customerEmail,
        subject: `Order Confirmed #${order.orderNumber} — Thank You for Choosing ${storeName}`,
        html: emailHtml,
      });

      console.log(`[Email] Customer order confirmation sent to ${customerEmail} for #${order.orderNumber}`);
      return { success: true };
    }

    // Fallback: Resend API if configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const fromEmail = process.env.EMAIL_FROM || `${storeName} <orders@resend.dev>`;
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [customerEmail],
          subject: `Order Confirmed #${order.orderNumber} — ${storeName}`,
          html: emailHtml,
        }),
      });

      if (res.ok) {
        return { success: true };
      }
    }

    console.log(`[Dev Mode] Order confirmation email logged for #${order.orderNumber} (${customerEmail})`);
    return { success: true };
  } catch (err: any) {
    console.error('[Email Error] Failed to send customer confirmation:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Automatically notifies merchant administrator of a new incoming customer order.
 */
export async function sendMerchantNewOrderNotificationEmail(
  order: any,
  settings?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const storeName = settings?.storeName || 'Vedik Vana';
    const merchantEmail = settings?.contactEmail || process.env.GMAIL_USER || 'admin@vedikvana.com';
    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    const itemsSummary = order.items
      ?.map(
        (i: any) =>
          `• ${i.productName}${i.variantName ? ` (${i.variantName})` : ''} × ${i.quantity} — ₹${(i.totalPaise / 100).toLocaleString('en-IN')}`
      )
      .join('<br>');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vedik-vana.vercel.app';

    const merchantHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #292524; background: #faf8f5;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e2d9; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <div style="background: #1c2826; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 18px; margin: 0; letter-spacing: 1.5px;">VEDIK VANA MERCHANT ALERT</h1>
            <p style="color: #c9a84e; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase;">New Order Placed</p>
          </div>
          <div style="padding: 28px;">
            <h2 style="font-size: 20px; color: #1c2826; margin-top: 0;">Order #${order.orderNumber}</h2>
            <div style="background: #fbf7ee; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; line-height: 1.8;">
              <strong>Customer:</strong> ${order.customerName}<br>
              <strong>Email:</strong> ${order.customerEmail}<br>
              <strong>Phone:</strong> ${order.customerPhone}<br>
              <strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})<br>
              <strong>Total Amount:</strong> <span style="font-size: 16px; font-weight: bold; color: #065f46;">₹${(order.totalPaise / 100).toLocaleString('en-IN')}</span><br>
              <strong>Doorstep Delivery OTP:</strong> <span style="font-family: monospace; font-weight: bold; color: #9a761e; font-size: 16px;">${order.deliveryOtp}</span>
            </div>

            <div style="margin: 20px 0; font-size: 13px;">
              <strong>Items to Pack & Prepare:</strong>
              <div style="margin-top: 8px; line-height: 1.6; color: #57534e;">
                ${itemsSummary}
              </div>
            </div>

            <div style="text-align: center; margin-top: 28px;">
              <a href="${appUrl}/admin/orders" style="display: inline-block; padding: 12px 28px; background: #1c2826; color: #c9a84e; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px; letter-spacing: 0.5px;">
                Open Merchant Order Queue →
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, ''),
        },
      });

      await transporter.sendMail({
        from: `"${storeName} Alerts" <${gmailUser}>`,
        to: merchantEmail,
        subject: `🔔 [NEW ORDER #${order.orderNumber}] ${order.customerName} — ₹${(order.totalPaise / 100).toLocaleString('en-IN')}`,
        html: merchantHtml,
      });

      console.log(`[Email] Merchant notification sent to ${merchantEmail} for #${order.orderNumber}`);
      return { success: true };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Email Error] Failed to send merchant notification:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Automatically notifies customer when order moves to PROCESSING, SHIPPED, or DELIVERED.
 */
export async function sendCustomerOrderStatusUpdateEmail(
  order: any,
  settings: any,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const storeName = settings?.storeName || 'Vedik Vana';
    const customerEmail = order.customerEmail?.trim();
    if (!customerEmail || !customerEmail.includes('@')) return { success: false };

    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    let subject = '';
    let statusHeading = '';
    let statusMessage = '';

    if (newStatus === 'SHIPPED') {
      subject = `Your Order #${order.orderNumber} Has Been Dispatched! 🚚`;
      statusHeading = 'Order Dispatched with Express Courier';
      statusMessage = `Your sacred botanical formulations have been carefully sealed and dispatched via <strong>${order.courierName || 'Express Courier'}</strong>. Tracking number: <strong style="font-family: monospace;">${order.trackingNumber || 'Available shortly'}</strong>.`;
    } else if (newStatus === 'DELIVERED') {
      subject = `Delivered: Your Vedik Vana Order #${order.orderNumber} Has Arrived! 🌿`;
      statusHeading = 'Order Successfully Delivered';
      statusMessage = `Your order has been delivered at your doorstep. We hope these sacred botanicals bring health, vitality, and peace to your daily ritual.`;
    } else if (newStatus === 'FULFILLED') {
      subject = `Order #${order.orderNumber} is Packed & Sealed for Courier Handover 📦`;
      statusHeading = 'Order Packed & Fulfilled';
      statusMessage = `Your sacred formulations have passed final purity inspection, sealed in tamper-evident packaging, and are awaiting handover to the express courier partner.`;
    } else if (newStatus === 'PROCESSING') {
      subject = `Order #${order.orderNumber} is Being Handcrafted & Packaged 🌿`;
      statusHeading = 'Order Accepted & In Preparation';
      statusMessage = `Our master apothecaries have accepted your order and are currently preparing your formulations under strict batch standards.`;
    } else {
      return { success: true };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vedik-vana.vercel.app';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf8f5; padding: 24px; color: #292524;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e2d9; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <div style="background: #1c2826; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 18px; margin: 0; letter-spacing: 2px;">${storeName.toUpperCase()}</h1>
            <p style="color: #c9a84e; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase;">Sacred Botanical Living</p>
          </div>
          <div style="padding: 28px;">
            <h2 style="font-size: 18px; color: #1c2826; margin-top: 0;">${statusHeading}</h2>
            <p style="font-size: 14px; color: #57534e; line-height: 1.6;">${statusMessage}</p>
            <div style="background: #fbf7ee; border-left: 4px solid #c9a84e; padding: 14px; margin: 20px 0; font-size: 13px; line-height: 1.8;">
              <strong>Order ID:</strong> ${order.orderNumber}<br>
              <strong>Status:</strong> <span style="font-weight: bold; color: #065f46;">${newStatus}</span><br>
              ${order.courierName ? `<strong>Courier:</strong> ${order.courierName}<br>` : ''}
              ${order.trackingNumber ? `<strong>Tracking Number:</strong> <span style="font-family: monospace;">${order.trackingNumber}</span><br>` : ''}
              <strong>Doorstep Delivery OTP:</strong> <span style="font-family: monospace; font-weight: bold; color: #9a761e;">${order.deliveryOtp}</span>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${appUrl}/order-success/${order.orderNumber}" style="display: inline-block; padding: 10px 24px; background: #1c2826; color: #c9a84e; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">
                Track Live Order Status →
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, ''),
        },
      });

      await transporter.sendMail({
        from: `"${storeName}" <${gmailUser}>`,
        to: customerEmail,
        subject,
        html,
      });

      console.log(`[Email] Status update (${newStatus}) sent to ${customerEmail} for #${order.orderNumber}`);
      return { success: true };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Email Error] Status update email failed:', err.message);
    return { success: false, error: err.message };
  }
}
