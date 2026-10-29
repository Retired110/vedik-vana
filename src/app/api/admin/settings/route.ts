import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const data = await request.json();

    const updated = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: {
        storeName: data.storeName,
        tagline: data.tagline,
        logoUrl: data.logoUrl,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        fssaiLicence: data.fssaiLicence,
        freeShippingThresholdPaise: Number(data.freeShippingThresholdPaise),
        standardShippingFeePaise: Number(data.standardShippingFeePaise),
        taxRatePercent: Number(data.taxRatePercent),
        codEnabled: Boolean(data.codEnabled),
        razorpayKeyId: data.razorpayKeyId,
        razorpayKeySecret: data.razorpayKeySecret,
        announcementText: data.announcementText,
        announcementActive: Boolean(data.announcementActive),
      },
      create: {
        id: 'default',
        storeName: data.storeName || 'Vedik Vana',
        tagline: data.tagline || 'Sacred Botanical Living',
        contactEmail: data.contactEmail || 'care@vedikvana.com',
        contactPhone: data.contactPhone || '+91 98765 43210',
        address: data.address || 'Himalayan Foothills, Dehradun',
        fssaiLicence: data.fssaiLicence || '10024011000918',
        freeShippingThresholdPaise: Number(data.freeShippingThresholdPaise) || 99900,
        standardShippingFeePaise: Number(data.standardShippingFeePaise) || 9900,
        taxRatePercent: Number(data.taxRatePercent) || 5,
        codEnabled: Boolean(data.codEnabled),
        announcementText: data.announcementText || '',
        announcementActive: Boolean(data.announcementActive),
      },
    });

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/shop');

    return NextResponse.json({ success: true, settings: updated, message: 'Store settings saved successfully!' });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
