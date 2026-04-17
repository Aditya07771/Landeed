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
    
    const { resolution, action } = await req.json();
    const dispute = await prisma.dispute.findUnique({ where: { id: params.id }, include: { land: true } });
    if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const newStatus = action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED';

    const updatedDispute = await prisma.dispute.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        resolution,
        resolvedAt: new Date(),
        timeline: {
          create: {
            action: `DISPUTE_${newStatus}`,
            note: resolution
          }
        }
      }
    });

    if (action === 'DISMISSED') {
      await prisma.land.update({ where: { id: dispute.landId }, data: { status: 'AVAILABLE' } });
    }
    
    await prisma.notification.create({
      data: { userId: dispute.filedById, type: 'DISPUTE_UPDATED', title: `Dispute ${newStatus}`, message: `Your dispute has been ${newStatus}.` }
    });
    await prisma.notification.create({
      data: { userId: dispute.land.ownerId, type: 'DISPUTE_UPDATED', title: `Dispute ${newStatus}`, message: `A dispute on your land has been ${newStatus}.` }
    });
    
    return NextResponse.json(updatedDispute);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
