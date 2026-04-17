import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'AUTHORITY' && session.user.role !== 'VERIFIER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { landId, valuationAmt, method, notes } = await req.json();
    
    const valuation = await prisma.landValuation.create({
      data: {
        landId,
        valuedBy: session.user.id,
        valuationAmt: parseFloat(valuationAmt),
        method,
        notes
      }
    });

    await prisma.landHistory.create({
      data: {
        landId,
        action: 'VALUATION_RECORDED',
        performedBy: session.user.id
      }
    });

    return NextResponse.json(valuation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const landId = searchParams.get('landId');
    if (!landId) return NextResponse.json({ error: 'landId is required' }, { status: 400 });
    
    const valuations = await prisma.landValuation.findMany({
      where: { landId },
      include: { valuator: { select: { name: true } } },
      orderBy: { valuedAt: 'desc' }
    });
    
    return NextResponse.json(valuations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
