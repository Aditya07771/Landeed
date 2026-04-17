import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'AUTHORITY' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { acquisitionId, reason, supportingNote } = await req.json();
    
    const acquisition = await prisma.acquisitionRequest.findUnique({ where: { id: acquisitionId } });
    if (!acquisition) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (acquisition.status !== 'REJECTED') return NextResponse.json({ error: 'Can only appeal rejected acquisitions' }, { status: 400 });
    
    const existingAppeal = await prisma.acquisitionAppeal.findUnique({ where: { acquisitionId } });
    if (existingAppeal) return NextResponse.json({ error: 'Appeal already exists' }, { status: 400 });
    
    const appeal = await prisma.acquisitionAppeal.create({
      data: {
        acquisitionId,
        appellantId: session.user.id,
        reason,
        supportingNote
      }
    });

    await prisma.acquisitionTimeline.create({
      data: {
        acquisitionRequestId: acquisitionId,
        action: 'APPEAL_FILED'
      }
    });

    const verifiers = await prisma.user.findMany({ where: { role: 'VERIFIER' } });
    for (const v of verifiers) {
      await prisma.notification.create({
        data: { userId: v.id, type: 'APPEAL_FILED', title: 'Appeal Needs Review', message: `An appeal for a rejected acquisition needs review.` }
      });
    }

    return NextResponse.json(appeal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let where: any = {};
    if (session.user.role === 'AUTHORITY') {
      where.appellantId = session.user.id;
    } else if (session.user.role === 'VERIFIER') {
      // Verifier can see all pending or ones they reviewed
      where.OR = [ { status: 'PENDING' }, { status: 'UNDER_REVIEW' }, { reviewedBy: session.user.id } ];
    }
    
    const appeals = await prisma.acquisitionAppeal.findMany({
      where,
      include: { acquisition: { include: { land: true } }, appellant: true, reviewer: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(appeals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
