import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getAdminSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const interactions = await prisma.botInteraction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const total = await prisma.botInteraction.count();
    const helpful = await prisma.botInteraction.count({ where: { feedback: 'HELPFUL' } });
    const unhelpful = await prisma.botInteraction.count({ where: { feedback: 'UNHELPFUL' } });
    const satisfactionRate = helpful + unhelpful > 0 ? Math.round((helpful / (helpful + unhelpful)) * 100) : 100;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        helpful,
        unhelpful,
        satisfactionRate,
      },
      interactions,
    });
  } catch (error: any) {
    console.error('Fetch bot interactions error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch AI learning data' }, { status: 500 });
  }
}
