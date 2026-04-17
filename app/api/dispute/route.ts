import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'AUTHORITY' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { landId, category, description } = await req.json();
    const land = await prisma.land.findUnique({ where: { id: landId } });
    if (!land) return NextResponse.json({ error: 'Land not found' }, { status: 404 });
    
    const dispute = await prisma.dispute.create({
      data: {
        landId,
        filedById: session.user.id,
        category,
        description,
        status: 'OPEN',
        timeline: {
          create: {
            action: 'DISPUTE_FILED'
          }
        }
      }
    });

    await prisma.land.update({ where: { id: landId }, data: { status: 'DISPUTED' } });

    await prisma.notification.create({
      data: { userId: land.ownerId, type: 'DISPUTE_FILED', title: 'Dispute Filed', message: `A dispute has been filed against your land.` }
    });
    
    // notify authorities
    const authorities = await prisma.user.findMany({ where: { role: 'AUTHORITY' } });
    for (const auth of authorities) {
      await prisma.notification.create({
        data: { userId: auth.id, type: 'DISPUTE_FILED', title: 'Dispute Filed', message: `A dispute has been filed against a land.` }
      });
    }

    return NextResponse.json(dispute);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const role = session.user.role;
    let where = {};
    if (role === 'OWNER') {
      where = { land: { ownerId: session.user.id } };
    } else if (role === 'VERIFIER') {
      where = { assignedTo: session.user.id };
    } else if (role !== 'AUTHORITY' && role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const disputes = await prisma.dispute.findMany({
      where,
      include: { land: true, filedBy: true, assignedVerifier: true }
    });
    return NextResponse.json(disputes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
