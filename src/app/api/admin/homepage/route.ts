import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ success: true, sections });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch homepage sections' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { sectionKey, title, subtitle, content, isEnabled, displayOrder } = await request.json();
    if (!sectionKey) return NextResponse.json({ success: false, message: 'Section key required' }, { status: 400 });

    const section = await prisma.homepageSection.upsert({
      where: { sectionKey },
      update: {
        title,
        subtitle,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
      },
      create: {
        sectionKey,
        title: title || '',
        subtitle: subtitle || '',
        content: typeof content === 'string' ? content : JSON.stringify(content || {}),
        isEnabled: isEnabled ?? true,
        displayOrder: displayOrder ?? 0,
      },
    });

    revalidatePath('/');

    return NextResponse.json({ success: true, section, message: 'Homepage section updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to update section' }, { status: 500 });
  }
}
