import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusStr = searchParams.get('status') || 'ACTIVE';
    // Validate status string to be one of ListingStatus
    const validStatuses = ['ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED'];
    const status = validStatuses.includes(statusStr) ? (statusStr as any) : 'ACTIVE';
    
    const listings = await prisma.landListing.findMany({
      where: { status },
      include: {
        land: true,
        seller: { select: { id: true, name: true, walletAddress: true } },
        _count: { select: { offers: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(listings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { landId, askingPrice, description, expiresAt } = await req.json();
    const land = await prisma.land.findUnique({ where: { id: landId } });
    
    if (!land) return NextResponse.json({ error: 'Land not found' }, { status: 404 });
    if (land.ownerId !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (land.status !== 'AVAILABLE') return NextResponse.json({ error: 'Land is not available' }, { status: 400 });
    
    const existingListing = await prisma.landListing.findFirst({
      where: { landId, status: 'ACTIVE' }
    });
    if (existingListing) return NextResponse.json({ error: 'Listing already exists' }, { status: 400 });

    const listing = await prisma.landListing.create({
      data: {
        landId,
        sellerId: session.user.id,
        askingPrice: parseFloat(askingPrice),
        description,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });

    await prisma.landHistory.create({
      data: {
        landId,
        action: 'LISTED_FOR_SALE',
        performedBy: session.user.id
      }
    });

    return NextResponse.json(listing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
