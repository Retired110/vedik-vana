import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { interactionId, feedback } = await request.json();

    if (!interactionId || !feedback) {
      return NextResponse.json({ success: false, message: 'Missing interactionId or feedback.' }, { status: 400 });
    }

    const updated = await prisma.botInteraction.update({
      where: { id: interactionId },
      data: {
        feedback: feedback === 'HELPFUL' ? 'HELPFUL' : 'UNHELPFUL',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your valuable feedback! Veda Mitra continuously learns from your guidance.',
      interaction: updated,
    });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to record feedback' }, { status: 500 });
  }
}
