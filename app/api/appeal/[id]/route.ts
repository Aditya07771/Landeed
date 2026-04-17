import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'VERIFIER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { status, reviewNote } = await req.json(); // UPHELD or REJECTED_FINAL
    const appeal = await prisma.acquisitionAppeal.findUnique({ where: { id: params.id }, include: { acquisition: true } });
    if (!appeal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const updatedAppeal = await prisma.acquisitionAppeal.update({
      where: { id: params.id },
      data: {
        status,
        reviewNote,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      }
    });

    if (status === 'UPHELD') {
      await prisma.acquisitionRequest.update({
        where: { id: appeal.acquisitionId },
        data: { status: 'PENDING' }
      });
      await prisma.land.update({
        where: { id: appeal.acquisition.landId },
        data: { status: 'UNDER_ACQUISITION' }
      });
      await prisma.acquisitionTimeline.create({
        data: {
          acquisitionRequestId: appeal.acquisitionId,
          action: 'APPEAL_UPHELD'
        }
      });
    }

    await prisma.notification.create({
      data: { userId: appeal.appellantId, type: 'APPEAL_REVIEWED', title: `Appeal ${status}`, message: `Your appeal has been reviewed and marked as ${status}.` }
    });

    return NextResponse.json(updatedAppeal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
