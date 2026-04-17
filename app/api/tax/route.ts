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
    
    const { landId, taxYear, assessedValue, taxAmount, dueDate } = await req.json();
    
    const taxRecord = await prisma.taxRecord.create({
      data: {
        landId,
        taxYear: parseInt(taxYear),
        assessedValue: parseFloat(assessedValue),
        taxAmount: parseFloat(taxAmount),
        dueDate: new Date(dueDate)
      }
    });

    const land = await prisma.land.findUnique({ where: { id: landId } });
    if (land) {
      await prisma.notification.create({
        data: { userId: land.ownerId, type: 'TAX_NOTICE_ISSUED', title: 'Tax Notice Issued', message: `A new tax record for year ${taxYear} has been issued.` }
      });
    }

    return NextResponse.json(taxRecord);
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
    const status = searchParams.get('status') as any;
    const taxYear = searchParams.get('taxYear') ? parseInt(searchParams.get('taxYear')!) : undefined;
    
    let where: any = {};
    if (landId) where.landId = landId;
    if (status) where.status = status;
    if (taxYear) where.taxYear = taxYear;

    if (session.user.role === 'OWNER') {
      where.land = { ownerId: session.user.id };
    }

    const taxRecords = await prisma.taxRecord.findMany({
      where,
      include: { land: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(taxRecords);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
