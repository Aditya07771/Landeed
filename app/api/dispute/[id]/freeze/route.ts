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
    
    const { freeze } = await req.json();
    const dispute = await prisma.dispute.findUnique({ where: { id: params.id }, include: { land: true } });
    if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const newStatus = freeze ? 'DISPUTED' : 'AVAILABLE';

    await prisma.land.update({
      where: { id: dispute.landId },
      data: { status: newStatus }
    });

    await prisma.landHistory.create({
      data: {
        landId: dispute.landId,
        action: freeze ? 'LAND_FROZEN' : 'LAND_UNFROZEN',
        performedBy: session.user.id
      }
    });
    
    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
