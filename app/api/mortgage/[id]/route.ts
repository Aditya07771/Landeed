import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'AUTHORITY' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { status, txHash } = await req.json();
    const lien = await prisma.mortgageLien.update({
      where: { id: params.id },
      data: { status, txHash }
    });

    await prisma.landHistory.create({
      data: {
        landId: lien.landId,
        action: `LIEN_${status}`,
        performedBy: session.user.id,
        metadata: { txHash }
      }
    });

    return NextResponse.json(lien);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
