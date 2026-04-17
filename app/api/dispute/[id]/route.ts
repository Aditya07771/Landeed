import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        land: true,
        filedBy: true,
        assignedVerifier: true,
        evidence: { include: { uploader: true } },
        timeline: { orderBy: { createdAt: 'desc' } }
      }
    });
    
    if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(dispute);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
