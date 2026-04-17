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
    
    const { txHash, newOwnerId } = await req.json();
    const listing = await prisma.landListing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const acceptedOffer = await prisma.landOffer.findFirst({
      where: { listingId: params.id, status: 'ACCEPTED' }
    });
    if (!acceptedOffer) return NextResponse.json({ error: 'No accepted offer found' }, { status: 400 });

    await prisma.land.update({
      where: { id: listing.landId },
      data: { ownerId: newOwnerId, status: 'ACQUIRED' } // Using ACQUIRED as requested or AVAILABLE
    });
    
    await prisma.landListing.update({
      where: { id: params.id },
      data: { status: 'SOLD' }
    });
    
    await prisma.landOffer.update({
      where: { id: acceptedOffer.id },
      data: { status: 'COMPLETED', txHash }
    });

    await prisma.landHistory.create({
      data: {
        landId: listing.landId,
        action: 'PRIVATE_SALE_COMPLETED',
        performedBy: session.user.id,
        metadata: { txHash }
      }
    });

    await prisma.notification.create({
      data: { userId: listing.sellerId, type: 'SALE_COMPLETED', title: 'Sale Completed', message: `Your land has been transferred successfully.` }
    });
    await prisma.notification.create({
      data: { userId: newOwnerId, type: 'SALE_COMPLETED', title: 'Purchase Completed', message: `You are now the owner of the land.` }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
