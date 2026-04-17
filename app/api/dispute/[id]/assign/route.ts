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
    const dispute = await prisma.dispute.update({
      where: { id: params.id },
      data: {
        assignedTo: verifierId,
        status: 'UNDER_REVIEW',
        timeline: {
          create: {
            action: 'VERIFIER_ASSIGNED'
          }
        }
      }
    });
    
    return NextResponse.json(dispute);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
