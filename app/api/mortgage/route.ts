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
    
    const { landId, lenderId, borrowerId, principalAmount, interestRate, startDate, endDate, notes } = await req.json();
    
    const lien = await prisma.mortgageLien.create({
      data: {
        landId,
        lenderId,
        borrowerId,
        principalAmount: parseFloat(principalAmount),
        interestRate: parseFloat(interestRate),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes
      }
    });

    await prisma.landHistory.create({
      data: {
        landId,
        action: 'LIEN_REGISTERED',
        performedBy: session.user.id
      }
    });

    const land = await prisma.land.findUnique({ where: { id: landId } });
    if (land) {
      await prisma.notification.create({
        data: { userId: land.ownerId, type: 'LIEN_REGISTERED', title: 'Lien Registered', message: `A new mortgage/lien was registered on your land.` }
      });
    }

    return NextResponse.json(lien);
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
    
    const liens = await prisma.mortgageLien.findMany({
      where: { landId },
      include: { lender: { select: { name: true } }, borrower: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(liens);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
