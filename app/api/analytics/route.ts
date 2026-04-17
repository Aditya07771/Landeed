import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'AUTHORITY' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalLands = await prisma.land.count();
    
    const users = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });
    
    const landsByStatus = await prisma.land.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    
    const acquisitionsByStatus = await prisma.acquisitionRequest.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    
    const disputesByStatus = await prisma.dispute.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const recentLands = await prisma.land.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    const recentAcqs = await prisma.acquisitionRequest.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    // Simple grouping by date string
    const recentRegistrations = recentLands.reduce((acc: any, t) => {
      const d = t.createdAt.toISOString().split('T')[0];
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const recentAcquisitions = recentAcqs.reduce((acc: any, t) => {
      const d = t.createdAt.toISOString().split('T')[0];
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const topLocationsData = await prisma.land.groupBy({
      by: ['location'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    const activeLiens = await prisma.mortgageLien.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { principalAmount: true }
    });

    const taxPending = await prisma.taxRecord.aggregate({
      where: { status: 'PENDING' },
      _sum: { taxAmount: true }
    });

    const taxCollected = await prisma.taxRecord.aggregate({
      where: { status: 'PAID' },
      _sum: { paidAmount: true }
    });

    return NextResponse.json({
      totalLands,
      totalUsers: users,
      landsByStatus,
      acquisitionsByStatus,
      disputesByStatus,
      recentRegistrations,
      recentAcquisitions,
      topLocations: topLocationsData,
      totalMortgageValue: activeLiens._sum.principalAmount || 0,
      taxRevenuePending: taxPending._sum.taxAmount || 0,
      taxRevenueCollected: taxCollected._sum.paidAmount || 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
