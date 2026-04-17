import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.landListing.findUnique({
      where: { id: params.id },
      include: {
        land: true,
        seller: { select: { id: true, name: true } },
        offers: { include: { buyer: { select: { id: true, name: true } } } }
      }
    });
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(listing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const listing = await prisma.landListing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (listing.sellerId !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await prisma.landListing.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' }
    });

    await prisma.landHistory.create({
      data: {
        landId: listing.landId,
        action: 'LISTING_CANCELLED',
        performedBy: session.user.id
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
