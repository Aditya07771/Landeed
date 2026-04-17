import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'AUTHORITY' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { verifierId } = await req.json();
    
    const acquisition = await prisma.acquisitionRequest.findUnique({ where: { id: params.id }, include: { land: true } });
    if (!acquisition) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (acquisition.status !== 'PENDING') return NextResponse.json({ error: 'Acquisition is not pending' }, { status: 400 });
    
    const updatedAcquisition = await prisma.acquisitionRequest.update({
      where: { id: params.id },
      data: { assignedVerifierId: verifierId }
    });

    await prisma.acquisitionTimeline.create({
      data: {
        acquisitionRequestId: params.id,
        action: 'VERIFIER_ASSIGNED'
      }
    });

    await prisma.notification.create({
      data: { userId: verifierId, type: 'VERIFIER_ASSIGNED', title: 'New Verification Assignment', message: `You have been assigned to verify acquisition for land ${acquisition.land.landId}` }
    });

    return NextResponse.json(updatedAcquisition);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
