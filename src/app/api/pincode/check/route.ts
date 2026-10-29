import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode')?.trim();

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json({
      serviceable: false,
      message: 'Please enter a valid 6-digit Indian PIN code.',
    });
  }

  // Major metro prefixes
  const firstDigit = pincode.charAt(0);
  const isMetro = ['11', '12', '40', '56', '60', '70', '50'].some((prefix) => pincode.startsWith(prefix));

  const estimatedDays = isMetro ? '2-3 Business Days' : '3-5 Business Days';
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (isMetro ? 3 : 5));

  const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return NextResponse.json({
    serviceable: true,
    pincode,
    estimatedDays,
    estimatedDeliveryDate: formattedDate,
    codAvailable: true,
    expressAvailable: isMetro,
    message: `Delivery available by ${formattedDate} (${estimatedDays}). Free Express Shipping on orders over ₹999.`,
  });
}
