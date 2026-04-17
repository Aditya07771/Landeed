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
    
    const { status, paidAmount, paidAt, receiptNumber } = await req.json();
    
    const taxRecord = await prisma.taxRecord.update({
      where: { id: params.id },
      data: { 
        status, 
        paidAmount: paidAmount ? parseFloat(paidAmount) : undefined,
        paidAt: paidAt ? new Date(paidAt) : undefined, 
        receiptNumber 
      },
      include: { land: true }
    });

    if (status === 'PAID') {
      await prisma.landHistory.create({
        data: {
          landId: taxRecord.landId,
          action: 'TAX_PAID',
          performedBy: session.user.id
        }
      });
    } else if (status === 'OVERDUE') {
      await prisma.notification.create({
        data: { userId: taxRecord.land.ownerId, type: 'TAX_OVERDUE', title: 'Tax Overdue', message: `Your tax for year ${taxRecord.taxYear} is overdue.` }
      });
    }

    return NextResponse.json(taxRecord);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
